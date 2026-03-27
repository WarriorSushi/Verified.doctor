import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import { createLogger } from "@/lib/logger";



const updateSchema = z.object({
  isRead: z.boolean().optional(),
  replied: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) {
      return csrfError as NextResponse;
    }

    const rl = await rateLimit(`message-patch:${userId}`, 60, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update message
    const updates: Record<string, unknown> = {};
    if (result.data.isRead !== undefined) {
      updates.is_read = result.data.isRead;
    }
    if (result.data.replied) {
      updates.reply_sent_at = new Date().toISOString();
      updates.is_read = true;
    }

    const { error } = await supabase
      .from("messages")
      .update(updates)
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: message, error } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .single();

    if (error || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Get message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const csrfError = await requireCsrf(request);
    if (csrfError) {
      return csrfError as NextResponse;
    }

    const rl = await rateLimit(`message-delete:${userId}`, 30, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Soft delete message by setting deleted_at
    const { error } = await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
