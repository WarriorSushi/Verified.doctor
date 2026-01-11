import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { dodo, isDodoConfigured } from "@/lib/dodo/client";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!isDodoConfigured()) {
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
      );
    }

    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile with subscription info
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, subscription_id, subscription_status")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.subscription_status !== "pro" || !profile.subscription_id) {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 400 }
      );
    }

    // Cancel subscription at period end via Dodo
    // Note: The API supports cancel_at_period_end per docs but SDK types may lag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (dodo.subscriptions as any).update(profile.subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local status
    await supabase
      .from("profiles")
      .update({
        subscription_status: "cancelled",
        subscription_cancelled_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    // Log the event
    await supabase.from("subscription_events").insert({
      profile_id: profile.id,
      event_type: "cancelled_by_user",
      dodo_subscription_id: profile.subscription_id,
      metadata: { cancelled_at: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription will be cancelled at the end of the billing period",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
