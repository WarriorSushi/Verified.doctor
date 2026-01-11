import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current profile with trial info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        trial_status,
        trial_invites_required,
        trial_invites_completed,
        trial_started_at,
        trial_expires_at,
        trial_offer_shown_at
      `)
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate days remaining if trial is active
    let daysRemaining = 0;
    let isTrialActive = false;
    let isTrialExpired = false;

    if (profile.trial_status === "active" && profile.trial_expires_at) {
      const expiresAt = new Date(profile.trial_expires_at);
      const now = new Date();

      if (expiresAt > now) {
        isTrialActive = true;
        daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        isTrialExpired = true;
      }
    }

    // Get list of people who signed up via invites (for showing progress)
    const { data: trialInvites } = await supabase
      .from("trial_invites")
      .select(`
        id,
        created_at,
        completed_at,
        invitee:profiles!trial_invites_invitee_profile_id_fkey(
          full_name,
          handle,
          specialty
        )
      `)
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      status: profile.trial_status || "none",
      invitesRequired: profile.trial_invites_required || 2,
      invitesCompleted: profile.trial_invites_completed || 0,
      invitesRemaining: Math.max(0, (profile.trial_invites_required || 2) - (profile.trial_invites_completed || 0)),
      isTrialActive,
      isTrialExpired,
      daysRemaining,
      trialStartedAt: profile.trial_started_at,
      trialExpiresAt: profile.trial_expires_at,
      trialOfferShownAt: profile.trial_offer_shown_at,
      invitees: trialInvites || [],
    });
  } catch (error) {
    console.error("Trial status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
