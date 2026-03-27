import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { getConnectionLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";

const acceptInviteSchema = z.object({
  inviteCode: z.string().min(1),
});

// POST - Accept an invite for an existing user
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const limiter = getConnectionLimiter();
    const rl = await checkRateLimit(limiter, userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many invite accepts. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = acceptInviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const { inviteCode } = result.data;
    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, handle")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select(`
        id,
        inviter_profile_id,
        used,
        inviter:profiles!invites_inviter_profile_id_fkey(
          id, full_name, handle
        )
      `)
      .eq("invite_code", inviteCode)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (invite.used) {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 400 }
      );
    }

    // Check if they're already connected (query both directions separately to avoid string interpolation)
    const { data: existingAsRequester } = await supabase
      .from("connections")
      .select("id")
      .eq("requester_id", invite.inviter_profile_id)
      .eq("receiver_id", profile.id)
      .maybeSingle();

    const { data: existingAsReceiver } = await supabase
      .from("connections")
      .select("id")
      .eq("requester_id", profile.id)
      .eq("receiver_id", invite.inviter_profile_id)
      .maybeSingle();

    const existingConnection = existingAsRequester || existingAsReceiver;

    if (existingConnection) {
      return NextResponse.json(
        { error: "You are already connected with this doctor", alreadyConnected: true },
        { status: 400 }
      );
    }

    // Check if they're trying to connect with themselves
    if (invite.inviter_profile_id === profile.id) {
      return NextResponse.json(
        { error: "You cannot use your own invite" },
        { status: 400 }
      );
    }

    // Create connection between inviter and existing user
    const { error: connectionError } = await supabase
      .from("connections")
      .insert({
        requester_id: invite.inviter_profile_id,
        receiver_id: profile.id,
        status: "accepted",
      });

    if (connectionError) {
      console.error("Connection error:", connectionError);
      return NextResponse.json(
        { error: "Failed to create connection" },
        { status: 500 }
      );
    }

    // Mark invite as used
    await supabase
      .from("invites")
      .update({
        used: true,
        used_by_profile_id: profile.id,
      })
      .eq("id", invite.id);

    // Increment connection counts for both
    await supabase.rpc("increment_connection_counts", {
      profile1_uuid: invite.inviter_profile_id,
      profile2_uuid: profile.id,
    });

    // Track trial invite and check for trial activation
    let trialActivated = false;
    try {
      // Get inviter's trial status
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("trial_status, trial_invites_required, trial_invites_completed, full_name")
        .eq("id", invite.inviter_profile_id)
        .single();

      if (inviterProfile && inviterProfile.trial_status === "eligible") {
        // Record the trial invite
        await supabase.from("trial_invites").insert({
          profile_id: invite.inviter_profile_id,
          invite_code: inviteCode,
          invitee_profile_id: profile.id,
          completed_at: new Date().toISOString(),
        });

        // Increment trial invites completed
        const newCompleted = (inviterProfile.trial_invites_completed || 0) + 1;
        const required = inviterProfile.trial_invites_required || 2;

        if (newCompleted >= required) {
          // Activate the trial!
          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setDate(expiresAt.getDate() + 30);

          await supabase
            .from("profiles")
            .update({
              trial_status: "active",
              trial_invites_completed: newCompleted,
              trial_started_at: now.toISOString(),
              trial_expires_at: expiresAt.toISOString(),
            })
            .eq("id", invite.inviter_profile_id);

          trialActivated = true;

          // Note: Email notification to inviter would require looking up their
          // email from Clerk. For now, they'll see the trial is active when
          // they next log in to their dashboard.
        } else {
          // Just increment the count
          await supabase
            .from("profiles")
            .update({
              trial_invites_completed: newCompleted,
            })
            .eq("id", invite.inviter_profile_id);
        }
      }
    } catch (trialError) {
      // Don't fail the connection creation if trial tracking fails
      console.error("Trial tracking error:", trialError);
    }

    return NextResponse.json({
      success: true,
      connectedWith: invite.inviter,
      message: `You are now connected with Dr. ${(invite.inviter as { full_name: string })?.full_name || "your colleague"}!`,
      trialActivated,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
