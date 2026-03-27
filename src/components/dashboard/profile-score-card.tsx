"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Trophy, Sparkles } from "lucide-react";
import {
  calculateProfileScore,
  calculateBadges,
  BADGES,
  type BadgeId,
} from "@/lib/profile-score";
import type { Profile } from "@/types/database";

interface ProfileScoreCardProps {
  profile: Profile;
  profileNumber?: number | null;
}

/**
 * Progress ring SVG component
 */
function ProgressRing({
  score,
  size = 80,
  strokeWidth = 6,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const color =
    score >= 80
      ? "#10B981" // emerald
      : score >= 50
        ? "#0099F7" // sky
        : score >= 25
          ? "#F59E0B" // amber
          : "#EF4444"; // red

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{score}%</span>
      </div>
    </div>
  );
}

/**
 * Badge display chip
 */
function BadgeChip({ badgeId }: { badgeId: BadgeId }) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      title={badge.description}
    >
      <span>{badge.icon}</span>
      <span>{badge.name}</span>
    </div>
  );
}

/**
 * Profile Score Card for the dashboard.
 * Shows progress ring, badges, and actionable tips.
 */
export function ProfileScoreCard({ profile, profileNumber }: ProfileScoreCardProps) {
  const { score, tips, completedFields, totalFields } = useMemo(
    () => calculateProfileScore(profile),
    [profile]
  );

  const earnedBadges = useMemo(
    () => calculateBadges(profile, profileNumber),
    [profile, profileNumber]
  );

  // Show top 3 tips
  const topTips = tips.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <ProgressRing score={score} size={72} strokeWidth={5} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            Profile Score
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedFields}/{totalFields} fields completed
          </p>
          {score < 100 && topTips.length > 0 && (
            <p className="text-xs text-slate-600 mt-2">
              <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
              {topTips[0].tip.length > 60
                ? topTips[0].tip.slice(0, 60) + "…"
                : topTips[0].tip}
              {" "}
              <span className="text-[#0099F7] font-medium">+{topTips[0].weight}%</span>
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-slate-500">Achievements</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {earnedBadges.map((id) => (
              <BadgeChip key={id} badgeId={id} />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {score < 100 && topTips.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          {topTips.slice(1).map((tip) => (
            <Link
              key={tip.field}
              href="/dashboard/profile-builder?tab=content"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-sky-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 truncate">{tip.tip}</p>
              </div>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <span className="text-xs font-medium text-[#0099F7]">+{tip.weight}%</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#0099F7] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {score >= 100 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <p className="text-sm font-medium text-emerald-600">
            🎉 Perfect score! Your profile is fully complete.
          </p>
        </div>
      )}
    </div>
  );
}
