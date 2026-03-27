/**
 * Weekly Digest Email System
 *
 * Generates and sends a weekly summary email to each doctor:
 * - Views this week
 * - New recommendations
 * - New messages
 * - New connections
 * - Profile tips based on completeness
 */

import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { calculateProfileScore } from "@/lib/profile-score";
import type { Profile } from "@/types/database";

interface WeeklyStats {
  totalViews: number;
  newRecommendations: number;
  newMessages: number;
  newConnections: number;
}

/**
 * Fetch weekly stats for a single profile.
 */
async function getWeeklyStats(
  profileId: string
): Promise<WeeklyStats> {
  const supabase = createAdminClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [viewsRes, recsRes, msgsRes, connsRes] = await Promise.all([
    // Views this week from analytics_daily_stats
    supabase
      .from("analytics_daily_stats")
      .select("total_views")
      .eq("profile_id", profileId)
      .gte("date", oneWeekAgo.split("T")[0]),
    // New recommendations
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .gte("created_at", oneWeekAgo),
    // New messages
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .gte("created_at", oneWeekAgo),
    // New connections
    supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`)
      .gte("created_at", oneWeekAgo),
  ]);

  const totalViews = (viewsRes.data || []).reduce(
    (sum, row) => sum + (row.total_views || 0),
    0
  );

  return {
    totalViews,
    newRecommendations: recsRes.count || 0,
    newMessages: msgsRes.count || 0,
    newConnections: connsRes.count || 0,
  };
}

/**
 * Build HTML email for the weekly digest.
 */
function buildDigestHtml(
  profile: Profile,
  stats: WeeklyStats,
  tips: Array<{ label: string; tip: string; weight: number }>
): string {
  const dashboardUrl = "https://verified.doctor/dashboard";
  const profileUrl = `https://verified.doctor/${profile.handle}`;
  const firstName =
    profile.full_name.split(" ").find((p) => !p.toLowerCase().startsWith("dr")) ||
    profile.full_name.split(" ")[0];

  const statItems = [
    { label: "Profile Views", value: stats.totalViews, emoji: "👁️", color: "#0099F7" },
    { label: "New Recommendations", value: stats.newRecommendations, emoji: "👍", color: "#10B981" },
    { label: "New Messages", value: stats.newMessages, emoji: "💬", color: "#F59E0B" },
    { label: "New Connections", value: stats.newConnections, emoji: "🤝", color: "#06B6D4" },
  ];

  const hasActivity = stats.totalViews > 0 || stats.newRecommendations > 0 || stats.newMessages > 0 || stats.newConnections > 0;

  // Take top 3 tips
  const topTips = tips.slice(0, 3);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; font-size: 22px; margin: 0 0 8px 0; }
    h2 { color: #0f172a; font-size: 16px; margin: 24px 0 12px 0; }
    p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; font-size: 14px; }
    .stats-grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1 1 calc(50% - 6px); min-width: 120px; background: #f8fafc; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid #e2e8f0; }
    .stat-value { font-size: 28px; font-weight: 700; margin: 4px 0; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .stat-emoji { font-size: 20px; }
    .tip-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #0099F7; }
    .tip-text { font-size: 13px; color: #334155; margin: 0; }
    .tip-weight { font-size: 11px; color: #0099F7; font-weight: 600; }
    .button { display: inline-block; background: linear-gradient(135deg, #0099F7 0%, #0080CC 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; }
    .footer a { color: #0099F7; text-decoration: none; }
    .no-activity { text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px; }
    .no-activity p { color: #64748b; margin: 8px 0 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Your Weekly Summary</h1>
      <p>Hi ${firstName}, here's what happened on your profile this week.</p>

      ${hasActivity ? `
      <div class="stats-grid">
        ${statItems
          .map(
            (s) => `
          <div class="stat-card">
            <div class="stat-emoji">${s.emoji}</div>
            <div class="stat-value" style="color: ${s.color};">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>`
          )
          .join("")}
      </div>
      ` : `
      <div class="no-activity">
        <div style="font-size: 32px;">📊</div>
        <p>No activity this week. Complete your profile to attract more visitors!</p>
      </div>
      `}

      ${topTips.length > 0 ? `
      <h2>💡 Tips to Improve Your Profile</h2>
      ${topTips
        .map(
          (t) => `
        <div class="tip-item">
          <div>
            <p class="tip-text">${t.tip}</p>
            <span class="tip-weight">+${t.weight}% completeness</span>
          </div>
        </div>`
        )
        .join("")}
      ` : ""}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${dashboardUrl}" class="button">View Dashboard</a>
      </div>

      <p style="text-align: center; margin-top: 16px; font-size: 12px; color: #94a3b8;">
        <a href="${profileUrl}" style="color: #0099F7; text-decoration: none;">View your public profile →</a>
      </p>
    </div>

    <div class="footer">
      <p>Verified.Doctor — Your Digital Identity, Verified.</p>
      <p style="margin-top: 8px;">
        <a href="${dashboardUrl}/settings">Unsubscribe from weekly digests</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildDigestText(
  profile: Profile,
  stats: WeeklyStats,
  tips: Array<{ label: string; tip: string; weight: number }>
): string {
  const firstName =
    profile.full_name.split(" ").find((p) => !p.toLowerCase().startsWith("dr")) ||
    profile.full_name.split(" ")[0];
  const dashboardUrl = "https://verified.doctor/dashboard";

  let text = `Weekly Summary for ${firstName}\n\n`;
  text += `Profile Views: ${stats.totalViews}\n`;
  text += `New Recommendations: ${stats.newRecommendations}\n`;
  text += `New Messages: ${stats.newMessages}\n`;
  text += `New Connections: ${stats.newConnections}\n\n`;

  if (tips.length > 0) {
    text += "Tips to improve your profile:\n";
    tips.slice(0, 3).forEach((t) => {
      text += `- ${t.tip} (+${t.weight}% completeness)\n`;
    });
    text += "\n";
  }

  text += `View dashboard: ${dashboardUrl}\n\n`;
  text += `Unsubscribe: ${dashboardUrl}/settings\n`;
  text += "\n— The Verified.Doctor Team";
  return text;
}

/**
 * Process weekly digest for all active profiles.
 * Returns count of emails sent.
 */
export async function processWeeklyDigest(): Promise<{
  sent: number;
  skipped: number;
  errors: number;
}> {
  const supabase = createAdminClient();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  // Fetch all active (not banned, not frozen) profiles
  // We need to get user emails from auth.users via profile.user_id
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .or("is_banned.is.null,is_banned.eq.false")
    .or("is_frozen.is.null,is_frozen.eq.false");

  if (error || !profiles) {
    console.error("[weekly-digest] Failed to fetch profiles:", error);
    return { sent: 0, skipped: 0, errors: 1 };
  }

  for (const profile of profiles) {
    try {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(
        profile.user_id
      );
      const email = userData?.user?.email;

      if (!email) {
        skipped++;
        continue;
      }

      // Check opt-out: achievement_badges JSON may contain { weekly_digest_opt_out: true }
      const badges = profile.achievement_badges as Record<string, unknown> | null;
      if (badges?.weekly_digest_opt_out === true) {
        skipped++;
        continue;
      }

      const stats = await getWeeklyStats(profile.id);
      const { tips } = calculateProfileScore(profile as Profile);

      const subject = stats.totalViews > 0
        ? `${stats.totalViews} people viewed your profile this week`
        : "Your weekly Verified.Doctor summary";

      const html = buildDigestHtml(profile as Profile, stats, tips);
      const text = buildDigestText(profile as Profile, stats, tips);

      const result = await sendEmail({ to: email, subject, html, text });

      if (result.success) {
        sent++;
      } else {
        errors++;
        console.error(`[weekly-digest] Failed for ${profile.handle}:`, result.error);
      }

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      errors++;
      console.error(`[weekly-digest] Error for ${profile.handle}:`, err);
    }
  }

  return { sent, skipped, errors };
}
