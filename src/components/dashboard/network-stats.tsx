"use client";

import { Users, Trophy, TrendingUp, UserPlus, Sparkles, Sprout, TreePine, Star, Crown, Gem } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NetworkStatsProps {
  connectionCount: number;
  pendingRequestsCount: number;
  invitesSent?: number;
  invitesAccepted?: number;
}

const MILESTONES = [
  { count: 5, label: "Getting Started", Icon: Sprout, color: "text-emerald-500" },
  { count: 10, label: "Growing Network", Icon: TrendingUp, color: "text-teal-500" },
  { count: 25, label: "Well Connected", Icon: TreePine, color: "text-green-600" },
  { count: 50, label: "Key Networker", Icon: Star, color: "text-amber-500" },
  { count: 100, label: "Network Leader", Icon: Crown, color: "text-amber-600" },
  { count: 250, label: "Super Connector", Icon: Gem, color: "text-sky-500" },
];

function getNextMilestone(count: number) {
  return MILESTONES.find((m) => m.count > count) || MILESTONES[MILESTONES.length - 1];
}

function getCurrentMilestone(count: number) {
  const achieved = MILESTONES.filter((m) => m.count <= count);
  return achieved[achieved.length - 1] || null;
}

export function NetworkStats({
  connectionCount,
  pendingRequestsCount,
  invitesSent = 0,
  invitesAccepted = 0,
}: NetworkStatsProps) {
  const nextMilestone = getNextMilestone(connectionCount);
  const currentMilestone = getCurrentMilestone(connectionCount);
  const progress = nextMilestone
    ? Math.min((connectionCount / nextMilestone.count) * 100, 100)
    : 100;

  return (
    <div className="bg-gradient-to-r from-[#0099F7]/5 via-[#A4FDFF]/10 to-[#0099F7]/5 rounded-xl border border-[#0099F7]/20 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Main Stat */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0099F7] to-[#0080CC] flex items-center justify-center text-white shadow-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{connectionCount}</p>
            <p className="text-sm text-slate-600">Professional Connections</p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="flex-1 lg:max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentMilestone && (
                <currentMilestone.Icon className={`w-5 h-5 ${currentMilestone.color}`} />
              )}
              <span className="text-sm font-medium text-slate-700">
                {currentMilestone?.label || "New Member"}
              </span>
            </div>
            {nextMilestone && connectionCount < nextMilestone.count && (
              <span className="text-sm text-slate-500">
                {nextMilestone.count - connectionCount} to next milestone
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          {connectionCount >= 100 && (
            <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
              <Trophy className="w-4 h-4" />
              <span>Top 1% of verified physicians on the platform!</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          {pendingRequestsCount > 0 && (
            <div className="text-center px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-2xl font-bold text-amber-700">{pendingRequestsCount}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
          )}
          {invitesSent > 0 && (
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{invitesSent}</p>
              <p className="text-xs text-blue-600">Invites Sent</p>
            </div>
          )}
          {invitesAccepted > 0 && (
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-2xl font-bold text-emerald-700">{invitesAccepted}</p>
              <p className="text-xs text-emerald-600">Joined via You</p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational CTA */}
      {connectionCount < 10 && (
        <div className="mt-4 pt-4 border-t border-[#0099F7]/10 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#0099F7]" />
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">Tip:</strong> Doctors with 10+ connections get 3x more profile views.
            Invite colleagues to boost your visibility!
          </p>
        </div>
      )}
    </div>
  );
}
