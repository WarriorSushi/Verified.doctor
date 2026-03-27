import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sendAdminMessageEmail } from "@/lib/email";
import { z } from "zod";
import { requireCsrf } from "@/lib/csrf";
import { sanitizeMessage } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

const adminMessageSchema = z.object({
  profileId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const rl = await rateLimit("admin-messages", 100, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = adminMessageSchema.parse(body);
    const profileId = parsed.profileId;
    const message = sanitizeMessage(parsed.message);

    const supabase = await createClient();

    // Verify the profile exists and get user info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, user_id")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Create the admin message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: messageError } = await (supabase as any)
      .from("messages")
      .insert({
        profile_id: profileId,
        sender_name: "Verified.Doctor Team",
        sender_phone: "admin",
        message_content: message,
        is_read: false,
        is_admin_message: true,
        is_pinned: true,
        admin_sender_name: "Verified.Doctor Team",
      });

    if (messageError) {
      console.error("Error creating admin message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Get user email from Supabase Auth and send notification email
    let emailSent = false;
    try {
      // Use service role to get user email
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);

      if (userData?.user?.email) {
        const result = await sendAdminMessageEmail(
          userData.user.email,
          profile.full_name,
          message
        );
        emailSent = result.success;
        if (!result.success) {
          console.warn("[admin] Failed to send admin message email:", result.error);
        }
      }
    } catch (emailError) {
      // Don't fail the whole request if email fails
      console.error("[admin] Error sending admin message email:", emailError);
    }

    // Log admin action
    try {
      await supabase.from("admin_actions").insert({
        admin_identifier: "admin",
        action_type: "send_message",
        target_profile_id: profileId,
        details: {
          message_preview: message.slice(0, 100),
          email_sent: emailSent,
        },
      });
    } catch (logError) {
      console.error("[admin] Failed to log action:", logError);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Admin message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
