import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

// GET - Fetch all appeals
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = await createClient();

    let query = supabase
      .from("appeals")
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          handle,
          profile_photo_url,
          is_banned,
          ban_reason,
          banned_at
        )
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: appeals, error } = await query;

    if (error) {
      console.error("Error fetching appeals:", error);
      return NextResponse.json(
        { error: "Failed to fetch appeals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appeals });
  } catch (error) {
    console.error("Admin appeals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateAppealSchema = z.object({
  appealId: z.string().uuid(),
  status: z.enum(["reviewed", "resolved", "rejected"]),
  adminResponse: z.string().optional(),
  unban: z.boolean().optional(), // If true, also unban the user
});

// PATCH - Update appeal status
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateAppealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { appealId, status, adminResponse, unban } = result.data;

    const supabase = await createClient();

    // Get the appeal first
    const { data: appeal, error: appealError } = await supabase
      .from("appeals")
      .select("profile_id")
      .eq("id", appealId)
      .single();

    if (appealError || !appeal) {
      return NextResponse.json(
        { error: "Appeal not found" },
        { status: 404 }
      );
    }

    // Update the appeal
    const { error: updateError } = await supabase
      .from("appeals")
      .update({
        status,
        admin_response: adminResponse || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appealId);

    if (updateError) {
      console.error("Error updating appeal:", updateError);
      return NextResponse.json(
        { error: "Failed to update appeal" },
        { status: 500 }
      );
    }

    // If resolved and unban is true, unban the user
    if (status === "resolved" && unban) {
      await supabase
        .from("profiles")
        .update({
          is_banned: false,
          banned_at: null,
          ban_reason: null,
          banned_by: null,
          is_frozen: false,
          frozen_at: null,
        })
        .eq("id", appeal.profile_id);

      // Log the unban action
      await supabase.from("admin_actions").insert({
        admin_identifier: "admin",
        action_type: "unban",
        target_profile_id: appeal.profile_id,
        details: { reason: "Appeal approved", appeal_id: appealId },
      });
    }

    return NextResponse.json({
      success: true,
      message: status === "resolved" && unban
        ? "Appeal resolved and user unbanned"
        : "Appeal status updated",
    });
  } catch (error) {
    console.error("Admin appeal update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
