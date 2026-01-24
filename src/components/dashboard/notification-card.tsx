"use client";

import { useState } from "react";
import { X, Gift, Sparkles, TrendingUp, Users, AlertTriangle, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export type NotificationType = "trial_offer" | "success" | "info" | "warning" | "error";

interface NotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  onDismiss?: (id: string) => void;
  onAction?: () => void;
  dismissible?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const typeConfig: Record<NotificationType, {
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
}> = {
  trial_offer: {
    icon: Gift,
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200/50",
  },
  success: {
    icon: Sparkles,
    gradient: "from-blue-50 via-sky-50 to-cyan-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200/50",
  },
  info: {
    icon: TrendingUp,
    gradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    borderColor: "border-violet-200/50",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-50 via-orange-50 to-yellow-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-300/50",
  },
  error: {
    icon: AlertOctagon,
    gradient: "from-red-50 via-rose-50 to-pink-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    borderColor: "border-red-300/50",
  },
};

export function NotificationCard({
  id,
  type,
  title,
  description,
  ctaText,
  ctaHref,
  onDismiss,
  onAction,
  dismissible = true,
  className = "",
  children,
}: NotificationCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleDismiss = async () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss?.(id);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-xl border ${config.borderColor} bg-gradient-to-br ${config.gradient} shadow-sm ${className}`}
        >
          {/* Decorative sparkle pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="80" cy="20" r="1.5" fill="currentColor" className={config.iconColor} />
              <circle cx="70" cy="30" r="1" fill="currentColor" className={config.iconColor} />
              <circle cx="90" cy="35" r="0.8" fill="currentColor" className={config.iconColor} />
              <circle cx="75" cy="10" r="0.8" fill="currentColor" className={config.iconColor} />
            </svg>
          </div>

          <div className="relative p-4 sm:p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {description}
                </p>

                {/* Custom content */}
                {children}

                {/* CTA Button */}
                {(ctaText && ctaHref) && (
                  <a href={ctaHref}>
                    <Button
                      size="sm"
                      className="mt-3 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white text-xs"
                    >
                      {ctaText}
                    </Button>
                  </a>
                )}

                {(ctaText && onAction) && (
                  <Button
                    size="sm"
                    onClick={onAction}
                    className="mt-3 bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white text-xs"
                  >
                    {ctaText}
                  </Button>
                )}
              </div>

              {/* Dismiss button */}
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized notification for trial offer
interface TrialOfferNotificationProps {
  invitesCompleted: number;
  invitesRequired: number;
  onDismiss: (id: string) => void;
  onInvite: () => void;
}

export function TrialOfferNotification({
  invitesCompleted,
  invitesRequired,
  onDismiss,
  onInvite,
}: TrialOfferNotificationProps) {
  const remaining = invitesRequired - invitesCompleted;

  return (
    <NotificationCard
      id="trial-offer"
      type="trial_offer"
      title="You've been selected for free Pro!"
      description={`Invite ${remaining} colleague${remaining > 1 ? 's' : ''} and get 30 days of Pro features absolutely free. No credit card required.`}
      onDismiss={onDismiss}
    >
      {/* Progress indicator */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-medium text-slate-700">{invitesCompleted}/{invitesRequired} invites</span>
        </div>
        <div className="h-2 bg-white/80 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(invitesCompleted / invitesRequired) * 100}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
        </div>
        <Button
          size="sm"
          onClick={onInvite}
          className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs"
        >
          <Users className="w-3 h-3 mr-1.5" />
          Invite Colleagues
        </Button>
      </div>
    </NotificationCard>
  );
}
