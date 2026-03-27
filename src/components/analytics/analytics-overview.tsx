"use client";

import { Eye, ThumbsUp, Users, MousePointer, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsOverviewProps {
  totals: {
    totalViews: number;
    uniqueViews: number;
    verifiedDoctorViews: number;
    clickSaveContact: number;
    clickBookAppointment: number;
    clickSendInquiry: number;
    clickRecommend: number;
    inquiriesReceived: number;
    recommendationsReceived: number;
  };
  changes: {
    totalViews: number;
    uniqueViews: number;
    verifiedDoctorViews: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ title, value, change, icon, iconBg }: MetricCardProps) {
  const showChange = change !== undefined && change !== 0;
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {value.toLocaleString()}
            </p>
            {showChange && (
              <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{isPositive ? "+" : ""}{change}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview({ totals, changes }: AnalyticsOverviewProps) {
  const totalActions =
    totals.clickSaveContact +
    totals.clickBookAppointment +
    totals.clickSendInquiry +
    totals.clickRecommend;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        title="Total Views"
        value={totals.totalViews}
        change={changes.totalViews}
        icon={<Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
        iconBg="bg-blue-100"
      />
      <MetricCard
        title="Unique Visitors"
        value={totals.uniqueViews}
        change={changes.uniqueViews}
        icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />}
        iconBg="bg-teal-100"
      />
      <MetricCard
        title="Doctor Views"
        value={totals.verifiedDoctorViews}
        change={changes.verifiedDoctorViews}
        icon={<ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
        iconBg="bg-emerald-100"
      />
      <MetricCard
        title="Total Actions"
        value={totalActions}
        icon={<MousePointer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
        iconBg="bg-amber-100"
      />
    </div>
  );
}
