import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "@/lib/email/send";
import { getInviteLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";

const createInviteSchema = z.object({
  email: z.string().email().optional(),
});

// Invite expiration: 30 days
const INVITE_EXPIRATION_DAYS = 30;

// Generate a unique invite code with retry logic
async function generateUniqueInviteCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  maxRetries = 5
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    const code = randomBytes(6).toString("hex");

    // Check if code already exists
    const { data: existing } = await supabase
      .from("invites")
      .select("id")
      .eq("invite_code", code)
      .single();

    if (!existing) {
      return code;
    }
  }
  return null;
}

// POST - Create a new invite
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 invites per user per hour
    const limiter = getInviteLimiter();
    const rateLimitResult = await checkRateLimit(limiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Too many invites. Please try again in ${formatRetryAfter(rateLimitResult.retryAfter || 60)}.`,
          retryAfter: rateLimitResult.retryAfter
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = createInviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the inviter's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, handle")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if email already has a pending invite (if provided)
    // Note: We don't check auth.users to avoid revealing registration status
    // (email is not stored in profiles table). Instead, we check for existing
    // unused invites to this email to prevent duplicate invite emails.
    let emailAlreadyRegistered = false;
    if (result.data.email) {
      const { data: existingInvite } = await supabase
        .from("invites")
        .select("id")
        .eq("invitee_email", result.data.email.toLowerCase())
        .eq("used", false)
        .maybeSingle();

      if (existingInvite) {
        // An unused invite already exists for this email — skip sending
        emailAlreadyRegistered = true;
      }
    }

    // Generate unique invite code with retry logic
    const inviteCode = await generateUniqueInviteCode(supabase);

    if (!inviteCode) {
      console.error("Failed to generate unique invite code after multiple retries");
      return NextResponse.json(
        { error: "Failed to generate invite code. Please try again." },
        { status: 500 }
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRATION_DAYS);

    // Create the invite
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .insert({
        inviter_profile_id: profile.id,
        invite_code: inviteCode,
        invitee_email: result.data.email?.toLowerCase() || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite creation error:", inviteError);

      // Handle unique constraint violation (rare but possible race condition)
      if (inviteError.code === "23505") {
        return NextResponse.json(
          { error: "Please try again" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create invite" },
        { status: 500 }
      );
    }

    // Ensure the base URL has the protocol
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://verified.doctor";
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = `https://${baseUrl}`;
    }
    const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}`;

    // Track email send result
    let emailSent = false;
    let emailError: string | undefined;

    // Send invite email if email was provided and not already registered
    if (result.data.email && !emailAlreadyRegistered) {
      console.log(`[invites] Attempting to send invite email to: ${result.data.email}`);

      const emailResult = await sendInviteEmail(
        result.data.email,
        profile.full_name,
        profile.handle,
        inviteUrl
      );

      if (emailResult.success) {
        emailSent = true;
        console.log(`[invites] Successfully sent invite email to: ${result.data.email}`);
      } else {
        emailError = emailResult.error;
        console.error(`[invites] Failed to send invite email to ${result.data.email}:`, emailResult.error);
      }
    } else if (emailAlreadyRegistered) {
      // Pretend email was sent to prevent enumeration
      emailSent = true;
    }

    return NextResponse.json({
      invite,
      inviteUrl,
      inviter: {
        name: profile.full_name,
        handle: profile.handle,
      },
      emailSent,
      emailError,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List all invites for the current user
export async function GET() {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all invites
    const { data: invites, error } = await supabase
      .from("invites")
      .select(`
        *,
        used_by:profiles!invites_used_by_profile_id_fkey(
          id, full_name, handle, specialty
        )
      `)
      .eq("inviter_profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get invites error:", error);
      return NextResponse.json(
        { error: "Failed to fetch invites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Get invites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
