import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This endpoint would be called by a cron job or external service
// to process the email queue and send pending emails
// For now, it just returns the emails that should be sent

// NOTE: This is the infrastructure stub. The actual email sending
// logic should be implemented when integrating with Resend or similar.
// See docs/pending-automation.md for implementation details.

// POST - Process and send pending emails (called by cron/automation engine)
export async function POST(request: Request) {
  try {
    // Verify this is an authorized call using secret key
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.AUTOMATION_SECRET_KEY;

    // Secret key MUST be configured and match
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // Get pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("automation_email_queue")
      .select(`
        *,
        profile:profiles(id, full_name, handle, user_id),
        template:automation_email_templates(*)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error("Error fetching pending emails:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch pending emails" },
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No pending emails to process",
      });
    }

    // Get user emails for the profiles
    const userIds = pendingEmails
      .map((email) => email.profile?.user_id)
      .filter((userId): userId is string => Boolean(userId));

    // In a real implementation, you would:
    // 1. Fetch user emails from your auth system (Clerk/Supabase Auth)
    // 2. Process template variables (replace {{name}}, {{handle}}, etc.)
    // 3. Send emails via Resend
    // 4. Update queue status to 'sent' or 'failed'
    // 5. Log to automation_email_log

    // For now, return what would be processed
    const emailsToSend = pendingEmails.map((email) => {
      const template = email.template as unknown as {
        slug?: string;
        subject?: string;
      } | null;

      return {
        id: email.id,
        recipientName: email.profile?.full_name,
        recipientHandle: email.profile?.handle,
        templateSlug: template?.slug,
        subject: template?.subject,
        scheduledFor: email.scheduled_for,
      };
    });

    return NextResponse.json({
      success: true,
      processed: emailsToSend.length,
      pendingEmails: emailsToSend,
      message: `Found ${emailsToSend.length} emails ready to send. Actual sending not implemented yet - see docs/pending-automation.md`,
      userIds, // For debugging - would be used to fetch emails
    });
  } catch (error) {
    console.error("Process queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Check queue status (requires authorization)
export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.AUTOMATION_SECRET_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get queue statistics
    const { data: stats, error } = await supabase
      .from("automation_email_queue")
      .select("status");

    if (error) {
      console.error("Error fetching queue stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    const statusCounts = (stats || []).reduce<Record<string, number>>(
      (acc, item) => {
        const status = item.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Get count of emails due now
    const now = new Date().toISOString();
    const { count: dueNow } = await supabase
      .from("automation_email_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lte("scheduled_for", now);

    return NextResponse.json({
      queueStats: statusCounts,
      emailsDueNow: dueNow || 0,
      timestamp: now,
    });
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
