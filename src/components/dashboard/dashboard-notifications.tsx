"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NotificationCard } from "./notification-card";
import { InviteDialog } from "./invite-dialog";
import { Button } from "@/components/ui/button";
import { Users, Crown, Sparkles, Gift, Shield } from "lucide-react";

interface AdminAction {
  action_type: string;
  details: unknown;
  created_at: string | null;
}

interface DashboardNotificationsProps {
  profileId: string;
  initialDismissed: string[];
  createdAt: string;
  viewCount: number;
  boostApplied: boolean;
  trialStatus: string;
  trialInvitesCompleted: number;
  trialInvitesRequired: number;
  trialExpiresAt?: string | null;
  subscriptionPlan?: string | null;
  isPro: boolean;
  recentAdminActions?: AdminAction[];
}

export function DashboardNotifications({
  profileId,
  initialDismissed,
  createdAt,
  viewCount,
  boostApplied: initialBoostApplied,
  trialStatus,
  trialInvitesCompleted,
  trialInvitesRequired,
  trialExpiresAt,
  subscriptionPlan,
  isPro,
  recentAdminActions = [],
}: DashboardNotificationsProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<string[]>(initialDismissed);
  const [boostApplied, setBoostApplied] = useState(initialBoostApplied);
  const [boostAmount, setBoostAmount] = useState(0);
  const [showBoostSuccess, setShowBoostSuccess] = useState(false);
  const [isApplyingBoost, setIsApplyingBoost] = useState(false);

  // Check and apply boost on mount
  const checkAndApplyBoost = useCallback(async () => {
    if (boostApplied || isApplyingBoost) return;

    // Check if account is 24+ hours old
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation < 24) return;

    setIsApplyingBoost(true);
    try {
      const response = await fetch("/api/boost/apply", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setBoostApplied(true);
        setBoostAmount(data.boostAmount);
        setShowBoostSuccess(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to apply boost:", error);
    } finally {
      setIsApplyingBoost(false);
    }
  }, [boostApplied, createdAt, isApplyingBoost, router]);

  useEffect(() => {
    checkAndApplyBoost();
  }, [checkAndApplyBoost]);

  const handleDismiss = async (notificationId: string) => {
    setDismissed((prev) => [...prev, notificationId]);

    try {
      await fetch("/api/notifications/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };

  const isNotDismissed = (id: string) => !dismissed.includes(id);

  // Check for admin-granted actions
  const grantTrialAction = recentAdminActions.find(
    (a) => a.action_type === "grant_trial"
  );
  const grantProAction = recentAdminActions.find(
    (a) => a.action_type === "grant_pro"
  );
  const verifyAction = recentAdminActions.find(
    (a) => a.action_type === "verify"
  );

  // Calculate trial days remaining
  let trialDaysRemaining = 0;
  if (trialStatus === "active" && trialExpiresAt) {
    const expiresAt = new Date(trialExpiresAt);
    const now = new Date();
    trialDaysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Show admin-granted Pro notification
  const showAdminProNotification =
    grantProAction &&
    subscriptionPlan === "admin_granted" &&
    isNotDismissed(`admin-pro-${grantProAction.created_at}`);

  // Show admin-granted trial notification (active trial)
  const showAdminTrialNotification =
    grantTrialAction &&
    trialStatus === "active" &&
    trialDaysRemaining > 0 &&
    isNotDismissed(`admin-trial-${grantTrialAction.created_at}`);

  // Show admin verification notification
  const showAdminVerifyNotification =
    verifyAction && isNotDismissed(`admin-verify-${verifyAction.created_at}`);

  // Don't show trial offer if user is already Pro or has active trial
  const showTrialOffer =
    trialStatus === "eligible" && !isPro && isNotDismissed("trial-offer");

  // Show boost success notification
  const showBoostNotification =
    showBoostSuccess && boostAmount > 0 && isNotDismissed("view-boost-success");

  // Show views milestone notification (after boost, if they have good view count)
  const showViewsMilestone =
    boostApplied &&
    !showBoostSuccess &&
    viewCount >= 10 &&
    isNotDismissed("views-milestone");

  const hasAnyNotification =
    showAdminProNotification ||
    showAdminTrialNotification ||
    showAdminVerifyNotification ||
    showTrialOffer ||
    showBoostNotification ||
    showViewsMilestone;

  if (!hasAnyNotification) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Admin Granted Pro Notification */}
      {showAdminProNotification && (
        <NotificationCard
          id={`admin-pro-${grantProAction.created_at}`}
          type="success"
          title="You've been upgraded to Pro!"
          description="Congratulations! The Verified.Doctor team has granted you Pro access. Enjoy all premium features including advanced analytics, unlimited connections, and premium templates."
          onDismiss={handleDismiss}
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
              PRO MEMBER
            </div>
            <span className="text-xs text-slate-500">Lifetime access</span>
          </div>
        </NotificationCard>
      )}

      {/* Admin Granted Trial Notification */}
      {showAdminTrialNotification && (
        <NotificationCard
          id={`admin-trial-${grantTrialAction.created_at}`}
          type="trial_offer"
          title="You've received a free Pro trial!"
          description={`The Verified.Doctor team has gifted you ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} of Pro access. Explore all premium features and see the difference!`}
          onDismiss={handleDismiss}
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              FREE TRIAL
            </div>
            <span className="text-xs text-violet-600 font-medium">
              {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining
            </span>
          </div>
        </NotificationCard>
      )}

      {/* Admin Verified Notification */}
      {showAdminVerifyNotification && (
        <NotificationCard
          id={`admin-verify-${verifyAction.created_at}`}
          type="success"
          title="Your profile has been verified!"
          description="Congratulations! Your credentials have been reviewed and approved. Your verified badge is now visible on your public profile."
          onDismiss={handleDismiss}
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              VERIFIED
            </div>
          </div>
        </NotificationCard>
      )}

      {/* Boost Success Notification */}
      {showBoostNotification && (
        <NotificationCard
          id="view-boost-success"
          type="success"
          title={`${boostAmount} new profile views!`}
          description="Your profile is getting noticed! Keep building your presence by adding more content and sharing your QR code."
          ctaText="Enhance Your Profile"
          ctaHref="/dashboard/profile-builder?tab=content"
          onDismiss={handleDismiss}
        />
      )}

      {/* Views Milestone Notification */}
      {showViewsMilestone && (
        <NotificationCard
          id="views-milestone"
          type="view_boost"
          title="Your profile is getting noticed!"
          description={`${viewCount} people have viewed your profile. Share your QR code to reach even more patients.`}
          ctaText="Get Your QR Code"
          ctaHref="/dashboard"
          onDismiss={handleDismiss}
        />
      )}

      {/* Trial Offer Notification */}
      {showTrialOffer && (
        <NotificationCard
          id="trial-offer"
          type="trial_offer"
          title="You've been selected for free Pro!"
          description={`Invite ${trialInvitesRequired - trialInvitesCompleted} colleague${trialInvitesRequired - trialInvitesCompleted > 1 ? "s" : ""} and get 30 days of Pro features absolutely free.`}
          onDismiss={handleDismiss}
        >
          {/* Progress indicator */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium text-slate-700">
                {trialInvitesCompleted}/{trialInvitesRequired} invites
              </span>
            </div>
            <div className="h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(trialInvitesCompleted / trialInvitesRequired) * 100}%`,
                }}
              />
            </div>
            <InviteDialog
              trigger={
                <Button
                  size="sm"
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs"
                >
                  <Users className="w-3 h-3 mr-1.5" />
                  Invite Colleagues
                </Button>
              }
            />
          </div>
        </NotificationCard>
      )}
    </div>
  );
}
