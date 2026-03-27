import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getUploadLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { requireCsrf } from "@/lib/csrf";

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP also has WEBP at offset 8)
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

async function validateFileMagicBytes(file: File): Promise<boolean> {
  const expectedSignatures = MAGIC_BYTES[file.type];
  if (!expectedSignatures) return false;

  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return expectedSignatures.some((signature) =>
    signature.every((byte, index) => bytes[index] === byte)
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const limiter = getUploadLimiter();
    const rl = await checkRateLimit(limiter, userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many verification uploads. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, verification_status, is_verified")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if already verified
    if (profile.is_verified) {
      return NextResponse.json(
        { error: "Profile is already verified" },
        { status: 400 }
      );
    }

    // Check if already pending
    if (profile.verification_status === "pending") {
      return NextResponse.json(
        { error: "Verification is already pending" },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll("documents") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one document is required" },
        { status: 400 }
      );
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 documents allowed" },
        { status: 400 }
      );
    }

    // Validate file types, sizes, and magic bytes
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only JPG, PNG, WebP, and PDF are allowed.` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      // Validate file content matches declared type (prevent spoofed MIME types)
      const isValidContent = await validateFileMagicBytes(file);
      if (!isValidContent) {
        return NextResponse.json(
          { error: `File content doesn't match declared type: ${file.name}. Please upload a valid image or PDF.` },
          { status: 400 }
        );
      }
    }

    // Upload files to Supabase Storage (using service role for private bucket)
    const adminSupabase = createAdminClient();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/${Date.now()}-${i}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from("verification-docs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      uploadedUrls.push(uploadData.path);
    }

    // Create verification document records
    const documentRecords = uploadedUrls.map((url) => ({
      profile_id: profile.id,
      document_url: url,
    }));

    const { error: insertError } = await supabase
      .from("verification_documents")
      .insert(documentRecords);

    if (insertError) {
      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to save document records" },
        { status: 500 }
      );
    }

    // Update profile verification status to pending
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update verification status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully. Your verification is now under review.",
      documentsUploaded: files.length,
    });
  } catch (error) {
    console.error("Verification upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get verification documents for the current user
export async function GET() {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, verification_status, is_verified")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get verification documents
    const { data: documents, error: docsError } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("profile_id", profile.id)
      .order("uploaded_at", { ascending: false });

    if (docsError) {
      console.error("Database error:", docsError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verification_status: profile.verification_status,
      is_verified: profile.is_verified,
      documents: documents || [],
    });
  } catch (error) {
    console.error("Get verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
