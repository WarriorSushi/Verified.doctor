"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  isPro?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
}

const sizeClasses = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

/**
 * Verified Badge component that shows Pro badge for Pro subscribers
 * and regular verified badge for non-Pro verified doctors.
 *
 * - Pro subscribers: Shows /Pro.svg with "Pro" text
 * - Non-Pro verified: Shows /verified-doctor-logo.svg
 * - Unverified: Shows nothing
 */
export function VerifiedBadge({
  isVerified,
  isPro = false,
  size = "sm",
  className,
  showTooltip = true,
}: VerifiedBadgeProps) {
  // Don't show anything if not verified
  if (!isVerified) {
    return null;
  }

  const sizeClass = sizeClasses[size];
  const tooltipText = isPro ? "Verified Pro Doctor" : "Verified Doctor";
  const badgeSrc = isPro ? "/Pro.svg" : "/verified-doctor-logo.svg";

  return (
    <div
      className={cn("relative flex-shrink-0", sizeClass, className)}
      title={showTooltip ? tooltipText : undefined}
    >
      <Image
        src={badgeSrc}
        alt={tooltipText}
        fill
        className="object-contain"
      />
    </div>
  );
}

/**
 * Inline Pro badge for use in text contexts
 */
export function ProBadgeInline({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        className
      )}
    >
      <Image src="/Pro.svg" alt="Pro" width={14} height={14} className="object-contain" />
      PRO
    </span>
  );
}

/**
 * Small Pro indicator badge
 */
export function ProIndicator({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  const sizeClass = size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={cn("relative flex-shrink-0", sizeClass)} title="Pro Member">
      <Image src="/Pro.svg" alt="Pro" fill className="object-contain" />
    </div>
  );
}
