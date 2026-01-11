import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Pencil, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile-cache";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { InviteProcessor } from "@/components/dashboard/invite-processor";
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use cached profile fetch - deduplicated across layout and pages
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  // Run badge count queries in parallel for performance
  const supabase = await createClient();
  const [unreadResult, pendingResult] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("is_read", false),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", profile.id)
      .eq("status", "pending"),
  ]);

  const unreadCount = unreadResult.count;
  const pendingConnectionsCount = pendingResult.count;

  return (
    <DashboardClientWrapper>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <Image
                  src={
                    profile.subscription_status === "pro" ||
                    (profile.trial_status === "active" &&
                     profile.trial_expires_at &&
                     new Date(profile.trial_expires_at) > new Date())
                      ? "/Pro.svg"
                      : "/verified-doctor-logo.svg"
                  }
                  alt="Verified.Doctor"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                verified<span className="text-[#0099F7]">.doctor</span>
              </span>
            </Link>

            <div data-tour="user-menu">
              <UserMenu
                fullName={profile.full_name}
                handle={profile.handle}
                profilePhotoUrl={profile.profile_photo_url}
                subscriptionStatus={profile.subscription_status}
                trialStatus={profile.trial_status}
                trialExpiresAt={profile.trial_expires_at}
              />
            </div>
          </div>

          {/* Navigation - Desktop only */}
          <div className="hidden sm:block">
            <DashboardNav
              unreadCount={unreadCount || 0}
              pendingConnectionsCount={pendingConnectionsCount || 0}
            />
          </div>
        </header>

        {/* Action Bar - Sticky on all devices */}
        <div className="sticky top-[53px] sm:top-[105px] z-40 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-b border-sky-100/80">
          <div className="max-w-6xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-2.5">
              <Link
                href="/dashboard/profile-builder"
                data-tour="edit-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-sky-50 text-sky-700 px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all active:scale-[0.98] border border-sky-200 shadow-sm"
              >
                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Edit Page</span>
              </Link>
              <Link
                href={`/${profile.handle}`}
                target="_blank"
                data-tour="view-profile-btn"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-3 sm:px-5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all active:scale-[0.98] shadow-sm"
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>View Page</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Invite Processor - handles invite codes from URL */}
        <Suspense fallback={null}>
          <InviteProcessor />
        </Suspense>

        {/* Main Content - Extra padding on mobile for bottom nav */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 sm:pb-8">{children}</main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          unreadCount={unreadCount || 0}
          pendingConnectionsCount={pendingConnectionsCount || 0}
        />
      </div>
    </DashboardClientWrapper>
  );
}
