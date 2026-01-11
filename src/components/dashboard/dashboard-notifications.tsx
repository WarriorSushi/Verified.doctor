"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NotificationCard, TrialOfferNotification } from "./notification-card";
import { InviteDialog } from "./invite-dialog";
import { Button } from "@/components/ui/button";
import { Users, Sparkles } from "lucide-react";

interface DashboardNotificationsProps {
  profileId: string;
  initialDismissed: string[];
  createdAt: string;
  viewCount: number;
  boostApplied: boolean;
  trialStatus: string;
  trialInvitesCompleted: number;
  trialInvitesRequired: number;
  isPro: boolean;
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
  isPro,
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

  // Don't show trial notification if user is already Pro or has active trial
  const showTrialOffer =
    trialStatus === "eligible" &&
    !isPro &&
    isNotDismissed("trial-offer");

  // Show boost success notification
  const showBoostNotification =
    showBoostSuccess &&
    boostAmount > 0 &&
    isNotDismissed("view-boost-success");

  // Show views milestone notification (after boost, if they have good view count)
  const showViewsMilestone =
    boostApplied &&
    !showBoostSuccess &&
    viewCount >= 10 &&
    isNotDismissed("views-milestone");

  if (!showTrialOffer && !showBoostNotification && !showViewsMilestone) {
    return null;
  }

  return (
    <div className="space-y-3">
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
          description={`Invite ${trialInvitesRequired - trialInvitesCompleted} colleague${(trialInvitesRequired - trialInvitesCompleted) > 1 ? 's' : ''} and get 30 days of Pro features absolutely free.`}
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
                style={{ width: `${(trialInvitesCompleted / trialInvitesRequired) * 100}%` }}
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
