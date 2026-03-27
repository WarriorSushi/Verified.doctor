import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { verifyAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

const queueEmailSchema = z.object({
  profileId: z.string().uuid(),
  templateSlug: z.string(),
  scheduledFor: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Allowed status values to prevent injection
const ALLOWED_STATUSES = ["pending", "sent", "cancelled", "failed"] as const;

// GET - List queued emails (admin can see all, user sees their own)
export async function GET(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status"); // pending, sent, cancelled, failed
    const profileId = searchParams.get("profileId");

    // Validate status if provided
    const status = rawStatus && ALLOWED_STATUSES.includes(rawStatus as typeof ALLOWED_STATUSES[number])
      ? rawStatus
      : null;

    const supabase = await createClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    // Check if user is admin
    const isAdmin = await verifyAdminSession();

    // SECURITY: If a profileId is specified and it's not the user's own profile,
    // only allow if user is an admin
    if (profileId && profile && profileId !== profile.id && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You can only view your own queued emails" },
        { status: 403 }
      );
    }

    // If no profile found and no admin access, return empty
    if (!profile && !isAdmin) {
      return NextResponse.json({ queuedEmails: [] });
    }

    let query = supabase
      .from("automation_email_queue")
      .select(`
        *,
        profile:profiles(id, full_name, handle)
      `)
      .order("scheduled_for", { ascending: true });

    // Filter by profile - admins can query any profile, users only their own
    if (profileId && isAdmin) {
      // Admin can view any profile's queue
      query = query.eq("profile_id", profileId);
    } else if (profile) {
      // Regular users can only see their own queued emails
      query = query.eq("profile_id", profile.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: queuedEmails, error } = await query;

    if (error) {
      console.error("Error fetching queue:", error);
      return NextResponse.json(
        { error: "Failed to fetch queue" },
        { status: 500 }
      );
    }

    return NextResponse.json({ queuedEmails });
  } catch (error) {
    console.error("Queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Queue a new email
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, templateSlug, scheduledFor, metadata } =
      queueEmailSchema.parse(body);

    const supabase = await createClient();

    // Get user's profile to verify ownership
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    // Check if user is admin
    const isAdmin = await verifyAdminSession();

    // SECURITY: Only allow queuing emails for own profile unless admin
    if (!isAdmin && (!userProfile || userProfile.id !== profileId)) {
      return NextResponse.json(
        { error: "Forbidden: You can only queue emails for your own profile" },
        { status: 403 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from("automation_email_templates")
      .select("slug, is_active")
      .eq("slug", templateSlug)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (!template.is_active) {
      return NextResponse.json(
        { error: "Template is not active" },
        { status: 400 }
      );
    }

    // Queue the email
    const { data: queuedEmail, error: queueError } = await supabase
      .from("automation_email_queue")
      .insert({
        profile_id: profileId,
        template_slug: templateSlug,
        scheduled_for: scheduledFor || new Date().toISOString(),
        status: "pending",
        metadata,
      })
      .select()
      .single();

    if (queueError) {
      console.error("Error queuing email:", queueError);
      return NextResponse.json(
        { error: "Failed to queue email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queuedEmail,
      message: "Email queued successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
