"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  MessageSquare,
  UserCheck,
  ThumbsUp,
  Activity,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "view" | "message" | "connection" | "recommendation";
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  weeklyRecommendations: number;
}

const iconMap = {
  eye: Eye,
  message: MessageSquare,
  connection: UserCheck,
  recommendation: ThumbsUp,
};

const colorMap = {
  view: { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-400" },
  message: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  connection: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-400" },
  recommendation: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
};

export function RecentActivity({ activities, weeklyRecommendations }: RecentActivityProps) {
  const displayActivities = activities.slice(0, 6);

  if (displayActivities.length === 0 && weeklyRecommendations === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Activity</h3>
        </div>
        <div className="text-center py-6">
          <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No recent activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Share your profile to start getting views!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0099F7]" />
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Activity</h3>
        </div>
        {weeklyRecommendations > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full">
            <ThumbsUp className="w-3 h-3" />
            +{weeklyRecommendations} this week
          </span>
        )}
      </div>

      <div className="space-y-1">
        {displayActivities.map((activity, index) => {
          const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Activity;
          const colors = colorMap[activity.type] || colorMap.view;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 py-2.5 group"
            >
              <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <IconComponent className={`w-3.5 h-3.5 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium truncate">{activity.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{activity.description}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-2 opacity-60`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
