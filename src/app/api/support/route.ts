import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/utils/html-escape";
import { requireCsrf } from "@/lib/csrf";
import { getSupportLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { sanitizeText, sanitizeMessage } from "@/lib/sanitize";

// Admin email from environment variable
const ADMIN_EMAIL = process.env.ADMIN_SUPPORT_EMAIL || process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  console.error("[support] ADMIN_SUPPORT_EMAIL or ADMIN_EMAIL not configured");
}

const supportSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
});

export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const limiter = getSupportLimiter();
    const rl = await checkRateLimit(limiter, userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many support requests. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = supportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const subject = sanitizeText(result.data.subject);
    const message = sanitizeMessage(result.data.message);
    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, handle, specialty")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Save the support message to database (optional - table may not exist yet)
    let supportMessageId: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: supportMessage, error: insertError } = await (supabase as any)
        .from("support_messages")
        .insert({
          profile_id: profile.id,
          subject,
          message,
          status: "open",
        })
        .select()
        .single();

      if (insertError) {
        console.warn("[support] DB insert skipped:", insertError.message);
      } else {
        supportMessageId = supportMessage?.id;
      }
    } catch (dbError) {
      // Database insert is optional - we'll still send the email
      console.warn("[support] DB insert failed, continuing with email:", dbError);
    }

    // Send email notification to admin
    const profileUrl = `https://verified.doctor/${profile.handle}`;
    const adminPanelUrl = `https://verified.doctor/admin/support`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; font-size: 20px; margin: 0 0 16px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .user-info { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .user-name { font-size: 16px; font-weight: 600; color: #0369a1; margin-bottom: 4px; }
    .user-detail { font-size: 14px; color: #0284c7; }
    .message-box { background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #0099F7; margin: 20px 0; }
    .message-subject { font-weight: 600; color: #0f172a; margin-bottom: 8px; font-size: 16px; }
    .message-content { color: #334155; white-space: pre-wrap; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
    .timestamp { color: #94a3b8; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>New Support Request</h1>

      <div class="user-info">
        <div class="user-name">${escapeHtml(profile.full_name)}</div>
        <div class="user-detail">${escapeHtml(profile.specialty || "Doctor")}</div>
        <div class="user-detail">
          <a href="${profileUrl}" style="color: #0099F7;">verified.doctor/${escapeHtml(profile.handle)}</a>
        </div>
      </div>

      <div class="message-box">
        <p class="message-subject">${escapeHtml(subject)}</p>
        <p class="message-content">${escapeHtml(message)}</p>
      </div>

      <center>
        <a href="${adminPanelUrl}" class="button">View in Admin Panel</a>
      </center>

      <p class="timestamp">Received: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
    </div>

    <div class="footer">
      <p>Verified.Doctor Support System</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
New Support Request

From: ${profile.full_name} (${profile.specialty || "Doctor"})
Profile: ${profileUrl}

Subject: ${subject}

Message:
${message}

---
Received: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
View in Admin Panel: ${adminPanelUrl}
    `.trim();

    // Send email to admin
    if (ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `[Support] ${subject} - ${profile.full_name}`,
          html: emailHtml,
          text: emailText,
          replyTo: ADMIN_EMAIL,
        });
      } catch (emailError) {
        console.error("[support] Email send error:", emailError);
        // Don't fail the request if email fails - message is already in DB
      }
    } else {
      console.warn("[support] Admin email not configured, skipping email notification");
    }

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully",
      ticketId: supportMessageId,
    });
  } catch (error) {
    console.error("[support] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List support messages for admin
export async function GET(request: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { isAdmin } = await import("@/lib/admin-auth");
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("support_messages")
      .select(`
        *,
        profile:profiles!support_messages_profile_id_fkey(
          id, full_name, handle, specialty, profile_photo_url
        )
      `)
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("[support] Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[support] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
