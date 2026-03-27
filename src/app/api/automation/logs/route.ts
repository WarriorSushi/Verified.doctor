import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";

// GET - List email logs (sent emails history)
export async function GET(request: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const templateSlug = searchParams.get("templateSlug");
    const status = searchParams.get("status"); // sent, failed, bounced
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = await createClient();

    // Get user's profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    let query = supabase
      .from("automation_email_log")
      .select(`
        *,
        profile:profiles(id, full_name, handle)
      `)
      .order("sent_at", { ascending: false })
      .limit(limit);

    // Filter by profile if specified, otherwise show user's own
    if (profileId) {
      query = query.eq("profile_id", profileId);
    } else if (userProfile) {
      query = query.eq("profile_id", userProfile.id);
    }

    if (templateSlug) {
      query = query.eq("template_slug", templateSlug);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("Error fetching email logs:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Email logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
