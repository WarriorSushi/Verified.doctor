import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { z } from "zod";
import { requireCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";

const freezeSchema = z.object({
  isFrozen: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const rl = await rateLimit(`profile-freeze:${userId}`, 20, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { isFrozen } = freezeSchema.parse(body);

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update freeze status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({
        is_frozen: isFrozen,
        frozen_at: isFrozen ? new Date().toISOString() : null,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Freeze update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update freeze status" },
        { status: 500 }
      );
    }

    // Log lifecycle event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("user_lifecycle_events").insert({
      profile_id: profile.id,
      event_type: isFrozen ? "frozen" : "unfrozen",
    });

    // If freezing, schedule a nudge email for 7 days later
    if (isFrozen) {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 7);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("automation_email_queue").insert({
        profile_id: profile.id,
        template_slug: "frozen_nudge",
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
      });
    } else {
      // If unfreezing, cancel any pending frozen_nudge emails
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("automation_email_queue")
        .update({ status: "cancelled" })
        .eq("profile_id", profile.id)
        .eq("template_slug", "frozen_nudge")
        .eq("status", "pending");
    }

    return NextResponse.json({
      success: true,
      isFrozen,
      message: isFrozen
        ? "Your profile is now offline"
        : "Your profile is now live",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    console.error("Freeze error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get the user's profile freeze status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error } = await (supabase as any)
      .from("profiles")
      .select("is_frozen, frozen_at")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      isFrozen: profile.is_frozen || false,
      frozenAt: profile.frozen_at,
    });
  } catch (error) {
    console.error("Get freeze status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
