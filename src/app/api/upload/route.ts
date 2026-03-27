import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getUploadLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";

// SECURITY: Validate magic bytes to ensure file content matches declared MIME type
function validateImageMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 12) return false;

  switch (mimeType) {
    case "image/jpeg":
      // JPEG starts with FF D8 FF
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      // PNG starts with 89 50 4E 47 0D 0A 1A 0A
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      // WebP starts with RIFF....WEBP
      return (
        bytes[0] === 0x52 && // R
        bytes[1] === 0x49 && // I
        bytes[2] === 0x46 && // F
        bytes[3] === 0x46 && // F
        bytes[8] === 0x57 && // W
        bytes[9] === 0x45 && // E
        bytes[10] === 0x42 && // B
        bytes[11] === 0x50    // P
      );
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = getUploadLimiter();
    const rl = await checkRateLimit(limiter, userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many uploads. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const typeParam = formData.get("type") as string || "gallery";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // SECURITY: Whitelist allowed upload types to prevent path traversal
    const ALLOWED_UPLOAD_TYPES: Record<string, { bucket: string; folder: string }> = {
      gallery: { bucket: "clinic-gallery", folder: "gallery" },
      profile: { bucket: "profile-photos", folder: "profile" },
    };

    const uploadConfig = ALLOWED_UPLOAD_TYPES[typeParam];
    if (!uploadConfig) {
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 }
      );
    }

    // Validate file type (MIME type)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // SECURITY: Validate magic bytes to ensure file is actually an image
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const isValidImage = validateImageMagicBytes(bytes, file.type);
    if (!isValidImage) {
      return NextResponse.json(
        { error: "Invalid file content. File does not match declared type." },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB - compression happens client-side)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    // Use validated bucket from whitelist
    const bucket = uploadConfig.bucket;

    // Generate safe filename with extension from MIME type
    const timestamp = Date.now();
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extMap[file.type] || "jpg";
    // SECURITY: Use folder from whitelist, not user input
    const filename = `${userId}/${uploadConfig.folder}-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const supabase = await createClient();

    // Convert already-read ArrayBuffer to Buffer for upload
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
