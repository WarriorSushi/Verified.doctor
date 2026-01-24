import { createClient } from "@/lib/supabase/server";

/**
 * Pro features that can be gated
 */
export type ProFeature =
  | "premium_templates" // Timeline, Magazine, Grid, Minimal
  | "premium_themes" // Sage, Warm, Teal, Executive
  | "video_intro"
  | "case_studies"
  | "media_publications"
  | "clinic_gallery"
  | "unlimited_connections" // Free: 20 max
  | "unlimited_messages" // Free: 50/month
  | "advanced_analytics" // Referrers, custom date range
  | "custom_qr" // Custom colors, logo
  | "unlimited_ai"; // Free: 3/month

/**
 * Free tier limits
 */
export const FREE_LIMITS = {
  connections: 20,
  messages_per_month: 50,
  ai_suggestions_per_month: 3,
  analytics_days: 1, // Today only - 7+ days requires Pro
} as const;

/**
 * Premium templates (not available on free)
 */
export const PREMIUM_TEMPLATES = ["timeline", "magazine", "grid", "minimal"];

/**
 * Premium themes (not available on free)
 */
export const PREMIUM_THEMES = ["sage", "warm", "teal", "executive"];

/**
 * Check if a profile has active Pro subscription or active trial
 */
export async function hasProAccess(profileId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at, trial_status, trial_expires_at")
    .eq("id", profileId)
    .single();

  if (!profile) return false;

  // Pro status with valid expiry
  if (profile.subscription_status === "pro") {
    if (!profile.subscription_expires_at) return true;
    return new Date(profile.subscription_expires_at) > new Date();
  }

  // Cancelled but still has access until expiry
  if (profile.subscription_status === "cancelled") {
    if (!profile.subscription_expires_at) return false;
    return new Date(profile.subscription_expires_at) > new Date();
  }

  // Active trial with valid expiry
  if (profile.trial_status === "active") {
    if (!profile.trial_expires_at) return true; // Admin granted trial without expiry
    return new Date(profile.trial_expires_at) > new Date();
  }

  return false;
}

/**
 * Check if a user can use a specific feature
 */
export async function canUseFeature(
  profileId: string,
  feature: ProFeature
): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
  const isPro = await hasProAccess(profileId);

  // Pro users can use everything
  if (isPro) {
    return { allowed: true };
  }

  const supabase = await createClient();

  // Check feature-specific limits for free users
  switch (feature) {
    case "unlimited_connections": {
      const { count } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`)
        .eq("status", "accepted");

      const used = count || 0;
      const allowed = used < FREE_LIMITS.connections;

      return {
        allowed,
        reason: allowed ? undefined : `Free plan limited to ${FREE_LIMITS.connections} connections`,
        limit: FREE_LIMITS.connections,
        used,
      };
    }

    case "unlimited_messages": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("messages_received_this_month, messages_reset_at")
        .eq("id", profileId)
        .single();

      if (!profile) return { allowed: false, reason: "Profile not found" };

      // Check if we need to reset the counter (new month)
      const resetAt = new Date(profile.messages_reset_at || 0);
      const now = new Date();
      const needsReset =
        resetAt.getMonth() !== now.getMonth() ||
        resetAt.getFullYear() !== now.getFullYear();

      const used = needsReset ? 0 : profile.messages_received_this_month || 0;
      const allowed = used < FREE_LIMITS.messages_per_month;

      return {
        allowed,
        reason: allowed ? undefined : `Free plan limited to ${FREE_LIMITS.messages_per_month} messages/month`,
        limit: FREE_LIMITS.messages_per_month,
        used,
      };
    }

    case "unlimited_ai": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("ai_suggestions_used_this_month, ai_suggestions_reset_at")
        .eq("id", profileId)
        .single();

      if (!profile) return { allowed: false, reason: "Profile not found" };

      // Check if we need to reset the counter
      const resetAt = new Date(profile.ai_suggestions_reset_at || 0);
      const now = new Date();
      const needsReset =
        resetAt.getMonth() !== now.getMonth() ||
        resetAt.getFullYear() !== now.getFullYear();

      const used = needsReset ? 0 : profile.ai_suggestions_used_this_month || 0;
      const allowed = used < FREE_LIMITS.ai_suggestions_per_month;

      return {
        allowed,
        reason: allowed ? undefined : `Free plan limited to ${FREE_LIMITS.ai_suggestions_per_month} AI suggestions/month`,
        limit: FREE_LIMITS.ai_suggestions_per_month,
        used,
      };
    }

    // These features are Pro-only (no free tier access)
    case "premium_templates":
    case "premium_themes":
    case "video_intro":
    case "case_studies":
    case "media_publications":
    case "clinic_gallery":
    case "advanced_analytics":
    case "custom_qr":
      return {
        allowed: false,
        reason: "This feature requires Pro",
      };

    default:
      return { allowed: false, reason: "Unknown feature" };
  }
}

/**
 * Increment usage counter for a feature (uses atomic database functions)
 */
export async function incrementUsage(
  profileId: string,
  feature: "messages" | "ai_suggestions"
): Promise<void> {
  const supabase = await createClient();

  if (feature === "messages") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("increment_messages_received", {
      p_profile_id: profileId,
    });
  }

  if (feature === "ai_suggestions") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("increment_ai_suggestions_used", {
      p_profile_id: profileId,
    });
  }
}

/**
 * Get subscription status for a profile
 */
export async function getSubscriptionStatus(profileId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      subscription_status,
      subscription_id,
      subscription_plan,
      subscription_started_at,
      subscription_expires_at,
      subscription_cancelled_at,
      ai_suggestions_used_this_month,
      messages_received_this_month
    `)
    .eq("id", profileId)
    .single();

  if (!profile) return null;

  const isPro = await hasProAccess(profileId);

  return {
    isPro,
    status: profile.subscription_status || "free",
    plan: profile.subscription_plan,
    startedAt: profile.subscription_started_at,
    expiresAt: profile.subscription_expires_at,
    cancelledAt: profile.subscription_cancelled_at,
    usage: {
      aiSuggestions: profile.ai_suggestions_used_this_month || 0,
      messages: profile.messages_received_this_month || 0,
    },
    limits: isPro ? null : FREE_LIMITS,
  };
}
