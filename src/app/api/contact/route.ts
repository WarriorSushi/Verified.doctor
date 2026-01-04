import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { escapeHtml } from "@/lib/utils/html-escape";

// Admin email from environment variable
const ADMIN_EMAIL = process.env.ADMIN_CONTACT_EMAIL || process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  console.error("[contact] ADMIN_CONTACT_EMAIL or ADMIN_EMAIL not configured");
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(2000),
  type: z.enum(["general", "support", "verification", "billing", "partnership", "feedback", "other"]).default("general"),
});

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ||
               headersList.get("x-real-ip") ||
               "unknown";

    // Rate limit: 5 messages per hour per IP
    const rateLimitResult = await rateLimit(`contact:${ip}`, 5, 60 * 60);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, subject, message, type } = result.data;
    const supabase = await createClient();

    // Store in database (contact_messages table)
    const { data: contactMessage, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subject || `${type} inquiry`,
        message,
        inquiry_type: type,
        status: "new",
        ip_address: ip,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[contact] Insert error:", insertError);
      // Continue even if DB insert fails - still send email
    }

    // Format email
    const typeLabels: Record<string, string> = {
      general: "General Inquiry",
      support: "Technical Support",
      verification: "Verification Help",
      billing: "Billing Question",
      partnership: "Partnership Inquiry",
      feedback: "Feedback",
      other: "Other",
    };

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
    .type-badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .info-row { background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; }
    .info-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; color: #0f172a; font-weight: 500; margin-top: 4px; }
    .message-box { background: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0099F7; margin: 20px 0; }
    .message-content { color: #334155; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
    .timestamp { color: #94a3b8; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <span class="type-badge">${escapeHtml(typeLabels[type])}</span>
      <h1>New Contact Form Submission</h1>

      <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value">${escapeHtml(name)}</div>
      </div>

      <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value"><a href="mailto:${escapeHtml(email)}" style="color: #0099F7;">${escapeHtml(email)}</a></div>
      </div>

      ${subject ? `
      <div class="info-row">
        <div class="info-label">Subject</div>
        <div class="info-value">${escapeHtml(subject)}</div>
      </div>
      ` : ""}

      <div class="message-box">
        <p class="message-content">${escapeHtml(message)}</p>
      </div>

      <p class="timestamp">Received: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      ${contactMessage?.id ? `<p class="timestamp">Reference ID: ${contactMessage.id}</p>` : ""}
    </div>

    <div class="footer">
      <p>Verified.Doctor Contact System</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
New Contact Form Submission

Type: ${typeLabels[type]}
Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ""}

Message:
${message}

---
Received: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
${contactMessage?.id ? `Reference ID: ${contactMessage.id}` : ""}
    `.trim();

    // Send email to admin
    if (ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `[Contact] ${typeLabels[type]}: ${subject || name}`,
          html: emailHtml,
          text: emailText,
          replyTo: email, // Allow direct reply to the sender
        });
      } catch (emailError) {
        console.error("[contact] Email send error:", emailError);
        // Don't fail the request if email fails - message is already in DB
      }
    } else {
      console.warn("[contact] Admin email not configured, skipping email notification");
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully",
      referenceId: contactMessage?.id,
    });
  } catch (error) {
    console.error("[contact] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
