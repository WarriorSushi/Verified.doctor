import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import {
  getMessageLimiter,
  getClientIp,
  checkRateLimit,
  formatRetryAfter,
} from "@/lib/rate-limit";
import { sendNewMessageEmail } from "@/lib/email";
import { sanitizeName, sanitizeMessage } from "@/lib/sanitize";
import { requireCsrf } from "@/lib/csrf";


// Phone validation regex - supports international formats
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

const createMessageSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  senderName: z.string().min(2, "Name is required").max(100),
  senderPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number too long")
    .regex(phoneRegex, "Invalid phone number format")
    .transform((val) => val.replace(/[^\d+]/g, "")), // Strip non-digits except +
  // senderEmail removed: column does not exist in DB schema
  messageContent: z.string().min(10, "Message too short").max(500, "Message too long"),
});

export async function POST(request: Request) {
  try {
    const csrfError = await requireCsrf(request);
    if (csrfError) {
      return csrfError as NextResponse;
    }

    // Rate limiting: 5 messages per IP per hour
    const ip = await getClientIp();
    const limiter = getMessageLimiter();
    const rateLimit = await checkRateLimit(limiter, ip);

    if (!rateLimit.success) {
      const retryAfter = rateLimit.retryAfter || 3600; // Default 1 hour
      return NextResponse.json(
        {
          error: `Too many messages sent. Please try again in ${formatRetryAfter(retryAfter)}.`,
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const result = createMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const { profileId, senderPhone } = result.data;
    const senderName = sanitizeName(result.data.senderName);
    const messageContent = sanitizeMessage(result.data.messageContent);

    const supabase = await createClient();

    // Check if profile exists and get user_id for email notification
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, user_id")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Create message (sender_email column does not exist in DB schema, omit it)
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        profile_id: profileId,
        sender_name: senderName,
        sender_phone: senderPhone,
        message_content: messageContent,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert message", insertError, { profileId, ip });
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Send email notification to doctor (async, don't block response)
    if (profile.user_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Use admin client to get user email (requires service role key)
      try {
        const adminClient = createAdminClient();
        const { data: { user: doctorUser } } = await adminClient.auth.admin.getUserById(profile.user_id);

        if (doctorUser?.email) {
          const messagePreview = messageContent.length > 100
            ? messageContent.substring(0, 100)
            : messageContent;

          sendNewMessageEmail(
            doctorUser.email,
            profile.full_name,
            senderName,
            messagePreview
          ).catch((err) => {
            console.error("[email] Failed to send new message notification:", err);
          });
        }
      } catch (emailErr) {
        console.error("[email] Error fetching doctor email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: message.id,
    });
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get messages for authenticated doctor
export async function GET() {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get profile for this user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get messages (filter out deleted, order pinned first)
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("profile_id", profile.id)
      .is("deleted_at", null)
      .order("is_pinned", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
