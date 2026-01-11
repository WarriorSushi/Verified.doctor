"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Calendar, Loader2, RefreshCw, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AnalyticsOverview,
  ViewsChart,
  ActionsChart,
  DeviceChart,
  ReferrersTable,
} from "@/components/analytics";
import { useSubscription } from "@/components/subscription/use-subscription";
import { toast } from "sonner";

interface AnalyticsData {
  profileId: string;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
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
    mobileViews: number;
    tabletViews: number;
    desktopViews: number;
  };
  changes: {
    totalViews: number;
    uniqueViews: number;
    verifiedDoctorViews: number;
  };
  dailyStats: Array<{
    date: string;
    views: number;
    uniqueViews: number;
    verifiedDoctorViews: number;
    actions: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  actionsBreakdown: {
    saveContact: number;
    bookAppointment: number;
    sendInquiry: number;
    recommend: number;
  };
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState("1"); // Default to today for all users
  const { subscription } = useSubscription();
  const isPro = subscription?.isPro ?? false;

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/dashboard?days=${days}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0099F7] animate-spin mb-4" />
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Unable to load analytics
          </h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          No analytics data available
        </h2>
        <p className="text-slate-500">
          Analytics will appear once you receive profile views.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your profile performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={days}
            onValueChange={(value) => {
              const isProOnly = value !== "1";
              if (isProOnly && !isPro) {
                toast.error("Upgrade to Pro for extended date ranges");
                return;
              }
              setDays(value);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7" disabled={!isPro}>
                <span className="flex items-center gap-2">
                  Last 7 days
                  {!isPro && <Lock className="w-3 h-3 text-slate-400" />}
                </span>
              </SelectItem>
              <SelectItem value="30" disabled={!isPro}>
                <span className="flex items-center gap-2">
                  Last 30 days
                  {!isPro && <Lock className="w-3 h-3 text-slate-400" />}
                </span>
              </SelectItem>
              <SelectItem value="90" disabled={!isPro}>
                <span className="flex items-center gap-2">
                  Last 90 days
                  {!isPro && <Lock className="w-3 h-3 text-slate-400" />}
                </span>
              </SelectItem>
              <SelectItem value="365" disabled={!isPro}>
                <span className="flex items-center gap-2">
                  Last year
                  {!isPro && <Lock className="w-3 h-3 text-slate-400" />}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <AnalyticsOverview totals={data.totals} changes={data.changes} />

      {/* Views Chart */}
      <ViewsChart dailyStats={data.dailyStats} />

      {/* Actions and Device Charts */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <ActionsChart actionsBreakdown={data.actionsBreakdown} />
        <DeviceChart deviceBreakdown={data.deviceBreakdown} />
      </div>

      {/* Referrers Table */}
      <ReferrersTable topReferrers={data.topReferrers} />

      {/* Pro Upsell Banner - Hide for Pro users */}
      {!isPro && (
        <div className="mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-[#0099F7]/10 to-[#A4FDFF]/10 border border-[#0099F7]/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800">
                  Unlock Advanced Analytics
                </h3>
              </div>
              <p className="text-sm text-slate-600">
                Extended date ranges, export data, and detailed insights with Pro.
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-[#0099F7] to-[#0080CC] hover:from-[#0088E0] hover:to-[#0070B8] text-white">
              <Link href="/dashboard/upgrade">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
