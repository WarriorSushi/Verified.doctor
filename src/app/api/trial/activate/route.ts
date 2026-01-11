import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { sendTrialClaimedEmail } from "@/lib/email";

// POST - Manually check and activate trial if conditions are met
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
      .select(`
        id,
        full_name,
        trial_status,
        trial_invites_required,
        trial_invites_completed
      `)
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if already active or claimed
    if (profile.trial_status === "active" || profile.trial_status === "claimed") {
      return NextResponse.json({
        success: false,
        reason: "Trial already active or claimed",
        status: profile.trial_status,
      });
    }

    // Check if enough invites completed
    const required = profile.trial_invites_required || 2;
    const completed = profile.trial_invites_completed || 0;

    if (completed < required) {
      return NextResponse.json({
        success: false,
        reason: "Not enough invites completed",
        invitesRequired: required,
        invitesCompleted: completed,
        invitesRemaining: required - completed,
      });
    }

    // Activate the trial - 30 days from now
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        trial_status: "active",
        trial_started_at: now.toISOString(),
        trial_expires_at: expiresAt.toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to activate trial:", updateError);
      return NextResponse.json(
        { error: "Failed to activate trial" },
        { status: 500 }
      );
    }

    // Send confirmation email
    if (user?.email) {
      sendTrialClaimedEmail(user.email, profile.full_name, expiresAt).catch((err) => {
        console.error("[email] Failed to send trial claimed email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      trialStartedAt: now.toISOString(),
      trialExpiresAt: expiresAt.toISOString(),
      daysRemaining: 30,
      message: "Congratulations! Your 30-day Pro trial is now active!",
    });
  } catch (error) {
    console.error("Trial activation error:", error);
    return NextResponse.json(
      { error: "Failed to activate trial" },
      { status: 500 }
    );
  }
}
