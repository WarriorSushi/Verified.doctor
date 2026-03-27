import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

interface DailyStat {
  date: string;
  total_views: number;
  unique_views: number;
  verified_doctor_views: number;
  click_save_contact: number;
  click_book_appointment: number;
  click_send_inquiry: number;
  click_recommend: number;
  mobile_views: number;
  tablet_views: number;
  desktop_views: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get verification documents
    const { data: documents } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("profile_id", id)
      .order("uploaded_at", { ascending: false });

    // Get message count
    const { count: messageCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", id);

    // Get connection count
    const { count: connectionCount } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${id},receiver_id.eq.${id}`)
      .eq("status", "accepted");

    // Get analytics summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analytics } = await supabase
      .from("analytics_daily_stats")
      .select("*")
      .eq("profile_id", id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    // Calculate analytics totals
    const analyticsSummary = {
      totalViews: 0,
      uniqueViews: 0,
      verifiedDoctorViews: 0,
      totalActions: 0,
    };

    ((analytics || []) as DailyStat[]).forEach((day) => {
      analyticsSummary.totalViews += day.total_views || 0;
      analyticsSummary.uniqueViews += day.unique_views || 0;
      analyticsSummary.verifiedDoctorViews += day.verified_doctor_views || 0;
      analyticsSummary.totalActions +=
        (day.click_save_contact || 0) +
        (day.click_book_appointment || 0) +
        (day.click_send_inquiry || 0) +
        (day.click_recommend || 0);
    });

    return NextResponse.json({
      profile,
      documents: documents || [],
      stats: {
        messageCount: messageCount || 0,
        connectionCount: connectionCount || 0,
        ...analyticsSummary,
      },
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
