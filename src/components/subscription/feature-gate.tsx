"use client";

import { ReactNode } from "react";
import { useSubscription } from "./use-subscription";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureGateProps {
  /**
   * The feature being gated
   */
  feature: string;
  /**
   * The content to show if user has access
   */
  children: ReactNode;
  /**
   * Optional custom fallback UI
   */
  fallback?: ReactNode;
  /**
   * Show blurred preview instead of hiding
   */
  showBlurredPreview?: boolean;
  /**
   * Show inline lock icon instead of overlay
   */
  inlineLock?: boolean;
}

/**
 * Gates content behind Pro subscription
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showBlurredPreview = false,
  inlineLock = false,
}: FeatureGateProps) {
  const { subscription, isLoading } = useSubscription();

  // While loading, show children (optimistic)
  if (isLoading) {
    return <>{children}</>;
  }

  // Pro users get full access
  if (subscription?.isPro) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Inline lock icon
  if (inlineLock) {
    return (
      <div className="relative inline-flex items-center gap-2">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <ProBadge small />
      </div>
    );
  }

  // Blurred preview with upgrade overlay
  if (showBlurredPreview) {
    return (
      <div className="relative">
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-lg">
          <UpgradePrompt feature={feature} />
        </div>
      </div>
    );
  }

  // Default: hidden with lock icon
  return (
    <div className="relative p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <UpgradePrompt feature={feature} />
    </div>
  );
}

/**
 * Upgrade prompt shown when feature is locked
 */
function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <Crown className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <p className="font-medium text-slate-800">Pro Feature</p>
        <p className="text-sm text-slate-500 mt-1">
          Upgrade to unlock {feature.replace(/_/g, " ")}
        </p>
      </div>
      <Link href="/dashboard/upgrade">
        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </Link>
    </div>
  );
}

/**
 * Small Pro badge indicator
 */
export function ProBadge({ small = false }: { small?: boolean }) {
  if (small) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
        <Crown className="w-2.5 h-2.5" />
        PRO
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
      <Crown className="w-3.5 h-3.5" />
      PRO
    </span>
  );
}

/**
 * Lock icon overlay for disabled features
 */
export function LockedFeature({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  const { subscription } = useSubscription();

  if (subscription?.isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative group cursor-not-allowed">
      <div className="opacity-40 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 text-white text-xs rounded-full">
          <Lock className="w-3 h-3" />
          {label || "Pro"}
        </div>
      </div>
    </div>
  );
}
