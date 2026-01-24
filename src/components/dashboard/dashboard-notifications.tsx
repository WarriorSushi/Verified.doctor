"use client";

import { useState } from "react";
import { NotificationCard } from "./notification-card";
import { InviteDialog } from "./invite-dialog";
import { Button } from "@/components/ui/button";
import { Users, Crown, Gift, Shield, AlertTriangle, Ban, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  trialStatus: string;
  trialInvitesCompleted: number;
  trialInvitesRequired: number;
  trialExpiresAt?: string | null;
  subscriptionPlan?: string | null;
  isPro: boolean;
  isBanned?: boolean | null;
  isFrozen?: boolean | null;
  banReason?: string | null;
  recentAdminActions?: AdminAction[];
}

export function DashboardNotifications({
  profileId,
  initialDismissed,
  createdAt,
  viewCount,
  trialStatus,
  trialInvitesCompleted,
  trialInvitesRequired,
  trialExpiresAt,
  subscriptionPlan,
  isPro,
  isBanned,
  isFrozen,
  banReason,
  recentAdminActions = [],
}: DashboardNotificationsProps) {
  const [dismissed, setDismissed] = useState<string[]>(initialDismissed);

  // Appeal state for banned users
  const [appealMessage, setAppealMessage] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

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

  // Submit ban appeal
  const handleSubmitAppeal = async () => {
    if (!appealMessage.trim() || isSubmittingAppeal) return;

    setIsSubmittingAppeal(true);
    setAppealError(null);

    try {
      const response = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: appealMessage.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppealSubmitted(true);
        setAppealMessage("");
      } else {
        setAppealError(data.error || "Failed to submit appeal. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit appeal:", error);
      setAppealError("Failed to submit appeal. Please try again.");
    } finally {
      setIsSubmittingAppeal(false);
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
  const freezeAction = recentAdminActions.find(
    (a) => a.action_type === "freeze"
  );
  const banAction = recentAdminActions.find(
    (a) => a.action_type === "ban"
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

  // Show freeze notification (always show if currently frozen, not dismissible)
  const showFreezeNotification =
    isFrozen &&
    !isBanned; // Don't show freeze if also banned (ban takes precedence)

  // Show ban notification (always show if currently banned, not dismissible)
  const showBanNotification = isBanned;

  // Don't show trial offer if user is already Pro or has active trial
  const showTrialOffer =
    trialStatus === "eligible" && !isPro && isNotDismissed("trial-offer");

  const hasAnyNotification =
    showAdminProNotification ||
    showAdminTrialNotification ||
    showAdminVerifyNotification ||
    showFreezeNotification ||
    showBanNotification ||
    showTrialOffer;

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

      {/* Account Banned Notification */}
      {showBanNotification && (
        <NotificationCard
          id="account-banned"
          type="error"
          title="Your account has been suspended"
          description={banReason || "Your account has been suspended by the Verified.Doctor team. You have received an email with more details."}
          dismissible={false}
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold">
              <Ban className="w-3.5 h-3.5" />
              SUSPENDED
            </div>
          </div>

          {/* Appeal Form */}
          <div className="mt-4 pt-4 border-t border-red-200/50">
            {appealSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">Appeal submitted successfully!</p>
                <p className="text-xs text-green-600 mt-1">
                  Our team will review your appeal and respond via email.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                    Submit an Appeal
                  </label>
                  <Textarea
                    placeholder="Explain why you believe this suspension should be reconsidered..."
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    className="min-h-[80px] text-sm resize-none bg-white/80"
                    maxLength={1000}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">
                    {appealMessage.length}/1000
                  </p>
                </div>
                {appealError && (
                  <p className="text-xs text-red-600">{appealError}</p>
                )}
                <Button
                  size="sm"
                  onClick={handleSubmitAppeal}
                  disabled={!appealMessage.trim() || isSubmittingAppeal}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs"
                >
                  {isSubmittingAppeal ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1.5" />
                      Submit Appeal
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </NotificationCard>
      )}

      {/* Account Frozen Notification */}
      {showFreezeNotification && (
        <NotificationCard
          id="account-frozen"
          type="warning"
          title="Your profile has been temporarily frozen"
          description="Your public profile is temporarily not visible to visitors. This may be due to a review process or pending verification. Contact support if you have questions."
          dismissible={false}
        >
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              FROZEN
            </div>
            <span className="text-xs text-amber-600 font-medium">
              Profile temporarily hidden
            </span>
          </div>
        </NotificationCard>
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
