import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { hasProAccess, FREE_LIMITS } from "@/lib/subscription/check-access";

interface DailyStat {
  date: string;
  total_views: number;
  unique_views: number;
  verified_doctor_views: number;
  click_save_contact: number;
  click_book_appointment: number;
  click_send_inquiry: number;
  click_recommend: number;
  inquiries_received: number;
  recommendations_received: number;
  mobile_views: number;
  tablet_views: number;
  desktop_views: number;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    let days = parseInt(searchParams.get("days") || "1");

    // Enforce Pro-only restriction for analytics beyond today
    const isPro = await hasProAccess(profile.id);
    if (!isPro && days > FREE_LIMITS.analytics_days) {
      days = FREE_LIMITS.analytics_days; // Limit to today only for free users
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily stats for the date range
    const { data: dailyStats, error: statsError } = await supabase
      .from("analytics_daily_stats")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (statsError) {
      console.error("Error fetching daily stats:", statsError);
    }

    // Calculate totals and aggregates
    const totals = {
      totalViews: 0,
      uniqueViews: 0,
      verifiedDoctorViews: 0,
      clickSaveContact: 0,
      clickBookAppointment: 0,
      clickSendInquiry: 0,
      clickRecommend: 0,
      inquiriesReceived: 0,
      recommendationsReceived: 0,
      mobileViews: 0,
      tabletViews: 0,
      desktopViews: 0,
    };

    ((dailyStats || []) as DailyStat[]).forEach((day) => {
      totals.totalViews += day.total_views || 0;
      totals.uniqueViews += day.unique_views || 0;
      totals.verifiedDoctorViews += day.verified_doctor_views || 0;
      totals.clickSaveContact += day.click_save_contact || 0;
      totals.clickBookAppointment += day.click_book_appointment || 0;
      totals.clickSendInquiry += day.click_send_inquiry || 0;
      totals.clickRecommend += day.click_recommend || 0;
      totals.inquiriesReceived += day.inquiries_received || 0;
      totals.recommendationsReceived += day.recommendations_received || 0;
      totals.mobileViews += day.mobile_views || 0;
      totals.tabletViews += day.tablet_views || 0;
      totals.desktopViews += day.desktop_views || 0;
    });

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const { data: previousStats } = await supabase
      .from("analytics_daily_stats")
      .select("total_views, unique_views, verified_doctor_views")
      .eq("profile_id", profile.id)
      .gte("date", previousStartDate.toISOString().split("T")[0])
      .lt("date", startDate.toISOString().split("T")[0]);

    const previousTotals = {
      totalViews: 0,
      uniqueViews: 0,
      verifiedDoctorViews: 0,
    };

    ((previousStats || []) as Pick<DailyStat, "total_views" | "unique_views" | "verified_doctor_views">[]).forEach((day) => {
      previousTotals.totalViews += day.total_views || 0;
      previousTotals.uniqueViews += day.unique_views || 0;
      previousTotals.verifiedDoctorViews += day.verified_doctor_views || 0;
    });

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const changes = {
      totalViews: calculateChange(totals.totalViews, previousTotals.totalViews),
      uniqueViews: calculateChange(totals.uniqueViews, previousTotals.uniqueViews),
      verifiedDoctorViews: calculateChange(totals.verifiedDoctorViews, previousTotals.verifiedDoctorViews),
    };

    // Get top referrers from events
    const { data: referrerData } = await supabase
      .from("analytics_events")
      .select("referrer")
      .eq("profile_id", profile.id)
      .eq("event_type", "profile_view")
      .gte("created_at", startDate.toISOString())
      .not("referrer", "is", null);

    // Count referrers
    const referrerCounts: Record<string, number> = {};
    ((referrerData || []) as { referrer: string | null }[]).forEach((event) => {
      const referrer = event.referrer || "direct";
      // Extract domain from URL
      let domain = referrer;
      try {
        if (referrer !== "direct" && referrer.startsWith("http")) {
          domain = new URL(referrer).hostname;
        }
      } catch {
        domain = referrer;
      }
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
    });

    // Sort and get top 10 referrers
    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));

    return new NextResponse(JSON.stringify({
      profileId: profile.id,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
        days,
      },
      totals,
      changes,
      dailyStats: ((dailyStats || []) as DailyStat[]).map((day) => ({
        date: day.date,
        views: day.total_views,
        uniqueViews: day.unique_views,
        verifiedDoctorViews: day.verified_doctor_views,
        actions: day.click_save_contact + day.click_book_appointment + day.click_send_inquiry + day.click_recommend,
      })),
      deviceBreakdown: {
        mobile: totals.mobileViews,
        tablet: totals.tabletViews,
        desktop: totals.desktopViews,
      },
      actionsBreakdown: {
        saveContact: totals.clickSaveContact,
        bookAppointment: totals.clickBookAppointment,
        sendInquiry: totals.clickSendInquiry,
        recommend: totals.clickRecommend,
      },
      topReferrers,
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache for 60s on client, allow stale for 5 min while revalidating
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
