import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { z } from "zod";

const updateQueueSchema = z.object({
  status: z.enum(["pending", "cancelled"]).optional(),
  scheduledFor: z.string().datetime().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific queued email
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: queuedEmail, error } = await supabase
      .from("automation_email_queue")
      .select(`
        *,
        profile:profiles(id, full_name, handle),
        template:automation_email_templates(slug, name, subject)
      `)
      .eq("id", id)
      .single();

    if (error || !queuedEmail) {
      return NextResponse.json(
        { error: "Queued email not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ queuedEmail });
  } catch (error) {
    console.error("Get queued email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a queued email (reschedule or cancel)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, scheduledFor } = updateQueueSchema.parse(body);

    const supabase = await createClient();

    // Get current email status
    const { data: existing, error: fetchError } = await supabase
      .from("automation_email_queue")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Queued email not found" },
        { status: 404 }
      );
    }

    // Can only modify pending emails
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Can only modify pending emails" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (scheduledFor) updateData.scheduled_for = scheduledFor;

    const { data: updated, error: updateError } = await supabase
      .from("automation_email_queue")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating queued email:", updateError);
      return NextResponse.json(
        { error: "Failed to update queued email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queuedEmail: updated,
      message: status === "cancelled" ? "Email cancelled" : "Email updated",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update queued email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a queued email (only if pending)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current email status
    const { data: existing, error: fetchError } = await supabase
      .from("automation_email_queue")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Queued email not found" },
        { status: 404 }
      );
    }

    // Can only delete pending emails
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Can only delete pending emails" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("automation_email_queue")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting queued email:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete queued email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Queued email deleted",
    });
  } catch (error) {
    console.error("Delete queued email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
