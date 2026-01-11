import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { sendProfileViewsEmail } from "@/lib/email";

export async function POST() {
  try {
    const { userId, user } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, handle, created_at, initial_boost_applied, view_count")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if boost already applied
    if (profile.initial_boost_applied) {
      return NextResponse.json({
        success: false,
        reason: "Boost already applied",
        boostAmount: 0,
      });
    }

    // Check if account is at least 24 hours old
    const createdAt = new Date(profile.created_at || new Date());
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation < 24) {
      return NextResponse.json({
        success: false,
        reason: "Account not yet eligible (must be 24+ hours old)",
        hoursRemaining: Math.ceil(24 - hoursSinceCreation),
        boostAmount: 0,
      });
    }

    // Generate random boost amount between 10-20
    const boostAmount = Math.floor(Math.random() * 11) + 10; // 10 to 20

    // Update profile with boost
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        initial_boost_applied: true,
        initial_boost_amount: boostAmount,
        initial_boost_applied_at: now.toISOString(),
        view_count: (profile.view_count || 0) + boostAmount,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to apply boost:", updateError);
      return NextResponse.json(
        { error: "Failed to apply boost" },
        { status: 500 }
      );
    }

    // Also add to analytics_daily_stats for today
    const today = now.toISOString().split("T")[0];

    // Check if today's record exists
    const { data: existingStats } = await supabase
      .from("analytics_daily_stats")
      .select("id, total_views, unique_views")
      .eq("profile_id", profile.id)
      .eq("date", today)
      .single();

    if (existingStats) {
      // Update existing record
      await supabase
        .from("analytics_daily_stats")
        .update({
          total_views: (existingStats.total_views || 0) + boostAmount,
          unique_views: (existingStats.unique_views || 0) + boostAmount,
          updated_at: now.toISOString(),
        })
        .eq("id", existingStats.id);
    } else {
      // Create new record for today
      await supabase.from("analytics_daily_stats").insert({
        profile_id: profile.id,
        date: today,
        total_views: boostAmount,
        unique_views: boostAmount,
        mobile_views: Math.floor(boostAmount * 0.6), // Assume 60% mobile
        desktop_views: Math.floor(boostAmount * 0.4), // 40% desktop
      });
    }

    // Send email notification (async, don't block)
    if (user?.email) {
      sendProfileViewsEmail(
        user.email,
        profile.full_name,
        profile.handle,
        boostAmount
      ).catch((err) => {
        console.error("[email] Failed to send profile views email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      boostAmount,
      message: `${boostAmount} profile views added!`,
    });
  } catch (error) {
    console.error("Apply boost error:", error);
    return NextResponse.json(
      { error: "Failed to apply boost" },
      { status: 500 }
    );
  }
}
