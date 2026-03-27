import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  ThumbsUp,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  UserPlus,
  ChevronRight,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile-cache";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/dashboard/copy-button";
import { formatViewCount } from "@/lib/format-metrics";
import { InviteDialog } from "@/components/dashboard/invite-dialog";
import { QRCodeDesigner } from "@/components/dashboard/qr-code-designer";
import { VerifiedBadge } from "@/components/profile/verified-badge";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";

export default async function DashboardPage() {
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  const supabase = await createClient();

  // Run queries in parallel
  const [messagesResult, adminActionsResult] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("is_read", false),
    // Get recent admin actions for this user (last 7 days)
    supabase
      .from("admin_actions")
      .select("action_type, details, created_at")
      .eq("target_profile_id", profile.id)
      .in("action_type", ["grant_trial", "grant_pro", "verify", "freeze", "ban"])
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const unreadCount = messagesResult.count;
  const recentAdminActions = adminActionsResult.data || [];

  // Calculate if user has Pro access (includes trial)
  const isTrialActive: boolean =
    profile.trial_status === "active" &&
    !!profile.trial_expires_at &&
    new Date(profile.trial_expires_at) > new Date();
  const hasProAccess: boolean = profile.subscription_status === "pro" || isTrialActive;

  const metrics = [
    { label: "Views", value: profile.view_count || 0, icon: Eye, format: formatViewCount },
    { label: "Recommends", value: profile.recommendation_count || 0, icon: ThumbsUp },
    { label: "Connections", value: profile.connection_count || 0, icon: Users },
    { label: "Messages", value: unreadCount || 0, icon: MessageSquare, href: "/dashboard/messages" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Verification Banner - Compact */}
      {!profile.is_verified && (
        <Link
          href="/dashboard/profile-builder?tab=settings"
          className="block bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 hover:bg-amber-100/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 text-sm">
                Get your verified badge
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 hidden sm:block">
                Upload credentials to build trust with patients
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600 flex-shrink-0" />
          </div>
        </Link>
      )}

      {profile.is_verified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-medium text-emerald-900 text-sm">Verified Physician</p>
        </div>
      )}

      {/* Dashboard Notifications */}
      <DashboardNotifications
        profileId={profile.id}
        initialDismissed={(profile.dismissed_notifications as string[]) || []}
        createdAt={profile.created_at || new Date().toISOString()}
        viewCount={profile.view_count || 0}
        trialStatus={profile.trial_status || "none"}
        trialInvitesCompleted={profile.trial_invites_completed || 0}
        trialInvitesRequired={profile.trial_invites_required || 2}
        trialExpiresAt={profile.trial_expires_at}
        subscriptionPlan={profile.subscription_plan}
        isPro={hasProAccess}
        isBanned={profile.is_banned}
        isFrozen={profile.is_frozen}
        banReason={profile.ban_reason}
        recentAdminActions={recentAdminActions}
      />

      {/* Mini Profile Preview Card */}
      <div data-tour="profile-preview" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              {profile.profile_photo_url ? (
                <Image
                  src={profile.profile_photo_url}
                  alt={profile.full_name}
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-lg sm:text-xl font-semibold text-slate-500">
                  {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge
                    isVerified={profile.is_verified}
                    isPro={profile.subscription_status === "pro"}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {profile.full_name}
              </h2>
              {profile.specialty && (
                <p className="text-sm font-medium text-[#0099F7]">{profile.specialty}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                {profile.clinic_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.clinic_location}
                  </span>
                )}
                {profile.years_experience && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {profile.years_experience}+ years
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile URL */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 font-mono text-xs text-slate-600 truncate">
              verified.doctor/{profile.handle}
            </div>
            <CopyButton text={`https://verified.doctor/${profile.handle}`} />
          </div>
        </div>
      </div>

      {/* Enrich Your Profile Card - Right after user info */}
      <Link
        href="/dashboard/profile-builder?tab=content"
        className="block bg-gradient-to-br from-teal-50 to-sky-50 rounded-xl border border-teal-200/50 p-4 sm:p-5 hover:border-teal-300 transition-colors group"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Enrich Your Profile</h3>
              <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Add education, procedures, case studies & more to stand out. Pre-made templates available!
            </p>
          </div>
        </div>
      </Link>

      {/* Metrics Row - Compact */}
      <div data-tour="metrics-row" className="grid grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const content = (
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 text-center hover:border-slate-300 transition-colors">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-slate-900">
                {metric.format ? metric.format(metric.value) : metric.value.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{metric.label}</p>
            </div>
          );

          if (metric.href) {
            return (
              <Link key={metric.label} href={metric.href}>
                {content}
              </Link>
            );
          }

          return <div key={metric.label}>{content}</div>;
        })}
      </div>

      {/* QR Code & Invite - Side by Side */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* QR Code - Enhanced */}
        <div data-tour="qr-code" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-4">
            {/* QR Preview */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg flex flex-col items-center justify-center p-2"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "3px solid #0099F7",
                }}
              >
                <div className="bg-white p-1 rounded">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://verified.doctor/${profile.handle}`}
                    alt="QR Code"
                    width={50}
                    height={50}
                    className="sm:w-[60px] sm:h-[60px]"
                  />
                </div>
                <p className="text-[6px] sm:text-[7px] font-mono text-slate-600 mt-1 truncate max-w-full">
                  verified.doctor/{profile.handle}
                </p>
              </div>
            </div>

            {/* Info & Action */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-1">QR Code</h3>
              <p className="text-xs text-slate-500 mb-3">
                Print for your clinic - patients can scan to save your contact
              </p>
              <QRCodeDesigner
                handle={profile.handle}
                doctorName={profile.full_name}
                specialty={profile.specialty}
                trigger={
                  <Button size="sm" className="text-xs bg-[#0099F7] hover:bg-[#0080CC]">
                    Choose Design & Download
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Invite Colleagues */}
        <div data-tour="invite-section" className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200/50 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Grow Your Network</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Invite colleagues to connect and boost your professional credibility
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white border-2 border-sky-100 flex items-center justify-center"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
            <InviteDialog
              trigger={
                <Button size="sm" className="text-xs bg-sky-600 hover:bg-sky-700">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Invite
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
