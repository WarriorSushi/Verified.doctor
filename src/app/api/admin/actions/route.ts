import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sendAccountBannedEmail } from "@/lib/email";
import { z } from "zod";
import type { Json } from "@/types/database";
import { requireCsrf } from "@/lib/csrf";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

const adminActionSchema = z.object({
  profileId: z.string().uuid(),
  action: z.enum([
    "ban",
    "unban",
    "freeze",
    "unfreeze",
    "grant_trial",
    "revoke_trial",
    "grant_pro",
    "revoke_pro",
    "verify",
    "unverify",
  ]),
  reason: z.string().optional(),
  trialDays: z.number().min(1).max(365).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError as NextResponse;

    const rl = await rateLimit("admin-actions", 200, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = adminActionSchema.parse(body);
    const profileId = parsed.profileId;
    const action = parsed.action;
    const reason = parsed.reason ? sanitizeText(parsed.reason) : undefined;
    const trialDays = parsed.trialDays;

    const supabase = await createClient();

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    let updateData: Record<string, unknown> = {};
    const actionDetails: Record<string, Json | undefined> = { reason };

    switch (action) {
      case "ban":
        updateData = {
          is_banned: true,
          banned_at: now,
          ban_reason: reason || "Banned by admin",
          banned_by: "admin",
          is_frozen: true, // Also freeze when banned
          frozen_at: now,
        };
        actionDetails.previous_state = { is_banned: profile.is_banned };
        break;

      case "unban":
        updateData = {
          is_banned: false,
          banned_at: null,
          ban_reason: null,
          banned_by: null,
        };
        actionDetails.previous_state = { is_banned: profile.is_banned, ban_reason: profile.ban_reason };
        break;

      case "freeze":
        updateData = {
          is_frozen: true,
          frozen_at: now,
        };
        actionDetails.previous_state = { is_frozen: profile.is_frozen };
        break;

      case "unfreeze":
        updateData = {
          is_frozen: false,
          frozen_at: null,
        };
        actionDetails.previous_state = { is_frozen: profile.is_frozen };
        break;

      case "grant_trial": {
        const days = trialDays || 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        updateData = {
          trial_status: "active",
          trial_started_at: now,
          trial_expires_at: expiresAt.toISOString(),
          trial_invites_required: 0, // No invites required when admin grants
          trial_invites_completed: 0,
        };
        actionDetails.trial_days = days;
        actionDetails.previous_state = { trial_status: profile.trial_status };
        break;
      }

      case "revoke_trial":
        updateData = {
          trial_status: "none",
          trial_started_at: null,
          trial_expires_at: null,
        };
        actionDetails.previous_state = { trial_status: profile.trial_status };
        break;

      case "grant_pro":
        updateData = {
          subscription_status: "pro",
          subscription_plan: "admin_granted",
          subscription_started_at: now,
          subscription_expires_at: null, // No expiry for admin granted
          // Also clear any trial
          trial_status: "none",
          trial_started_at: null,
          trial_expires_at: null,
        };
        actionDetails.previous_state = { subscription_status: profile.subscription_status };
        break;

      case "revoke_pro":
        updateData = {
          subscription_status: "free",
          subscription_plan: null,
          subscription_id: null,
          subscription_started_at: null,
          subscription_expires_at: null,
          subscription_cancelled_at: now,
        };
        actionDetails.previous_state = { subscription_status: profile.subscription_status };
        break;

      case "verify":
        updateData = {
          is_verified: true,
          verification_status: "approved",
        };
        actionDetails.previous_state = { is_verified: profile.is_verified };
        break;

      case "unverify":
        updateData = {
          is_verified: false,
          verification_status: "none",
        };
        actionDetails.previous_state = { is_verified: profile.is_verified };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to perform action" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_identifier: "admin",
      action_type: action,
      target_profile_id: profileId,
      details: actionDetails as Json,
    });

    // Send ban notification email
    if (action === "ban" && profile.user_id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient();
        const { data: { user } } = await adminClient.auth.admin.getUserById(profile.user_id);

        if (user?.email) {
          const banReason = reason || "Violation of platform guidelines";
          sendAccountBannedEmail(
            user.email,
            profile.full_name,
            banReason
          ).catch((err) => {
            console.error("[email] Failed to send ban notification email:", err);
          });
        }
      } catch (emailErr) {
        console.error("[email] Error fetching user email for ban notification:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      action,
      profileId,
      message: getSuccessMessage(action, profile.full_name),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getSuccessMessage(action: string, name: string): string {
  const messages: Record<string, string> = {
    ban: `${name} has been banned`,
    unban: `${name} has been unbanned`,
    freeze: `${name}'s profile has been frozen`,
    unfreeze: `${name}'s profile has been unfrozen`,
    grant_trial: `Pro trial granted to ${name}`,
    revoke_trial: `Trial revoked from ${name}`,
    grant_pro: `Pro subscription granted to ${name}`,
    revoke_pro: `Pro subscription revoked from ${name}`,
    verify: `${name} has been verified`,
    unverify: `Verification removed from ${name}`,
  };
  return messages[action] || "Action completed";
}

// GET - Get admin action log for a profile
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const supabase = await createClient();

    let query = supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (profileId) {
      query = query.eq("target_profile_id", profileId);
    }

    const { data: actions, error } = await query;

    if (error) {
      console.error("Error fetching admin actions:", error);
      return NextResponse.json(
        { error: "Failed to fetch actions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ actions });
  } catch (error) {
    console.error("Admin actions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
