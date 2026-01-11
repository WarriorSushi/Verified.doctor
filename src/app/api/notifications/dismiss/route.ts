import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const dismissSchema = z.object({
  notificationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = dismissSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const { notificationId } = result.data;

    const supabase = await createClient();

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, dismissed_notifications")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Add notification ID to dismissed list if not already there
    const currentDismissed = (profile.dismissed_notifications as string[]) || [];
    if (!currentDismissed.includes(notificationId)) {
      const updatedDismissed = [...currentDismissed, notificationId];

      await supabase
        .from("profiles")
        .update({ dismissed_notifications: updatedDismissed })
        .eq("id", profile.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dismiss notification error:", error);
    return NextResponse.json(
      { error: "Failed to dismiss notification" },
      { status: 500 }
    );
  }
}
