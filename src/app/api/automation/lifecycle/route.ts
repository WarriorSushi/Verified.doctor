import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { verifyAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

const lifecycleEventSchema = z.object({
  profileId: z.string().uuid(),
  eventType: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// GET - List lifecycle events for a profile
export async function GET(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const eventType = searchParams.get("eventType");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50"), 1), 200); // Clamp between 1-200

    const supabase = await createClient();

    // Get user's profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    // Check if user is admin (for viewing other profiles)
    const isAdmin = await verifyAdminSession();

    // SECURITY: If a profileId is specified and it's not the user's own profile,
    // only allow if user is an admin
    if (profileId && userProfile && profileId !== userProfile.id && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You can only view your own lifecycle events" },
        { status: 403 }
      );
    }

    // If no profile found and no admin access, return empty
    if (!userProfile && !isAdmin) {
      return NextResponse.json({ events: [] });
    }

    let query = supabase
      .from("user_lifecycle_events")
      .select(`
        *,
        profile:profiles(id, full_name, handle)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by profile - admins can query any profile, users only their own
    if (profileId && isAdmin) {
      // Admin can view any profile
      query = query.eq("profile_id", profileId);
    } else if (userProfile) {
      // Regular users can only see their own events
      query = query.eq("profile_id", userProfile.id);
    }

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching lifecycle events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Lifecycle events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Log a lifecycle event
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, eventType, metadata } = lifecycleEventSchema.parse(body);

    const supabase = await createClient();

    // Get user's profile to verify ownership
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    // Check if user is admin
    const isAdmin = await verifyAdminSession();

    // SECURITY: Only allow logging events for own profile unless admin
    if (!isAdmin && (!userProfile || userProfile.id !== profileId)) {
      return NextResponse.json(
        { error: "Forbidden: You can only log events for your own profile" },
        { status: 403 }
      );
    }

    const { data: event, error } = await supabase
      .from("user_lifecycle_events")
      .insert({
        profile_id: profileId,
        event_type: eventType,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error logging lifecycle event:", error);
      return NextResponse.json(
        { error: "Failed to log event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
      message: "Event logged successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Lifecycle event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
