import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";

const updateConnectionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Accept or reject a connection request
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateConnectionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get the connection request
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 }
      );
    }

    // Only the receiver can accept/reject
    if (connection.receiver_id !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Must be pending to update
    if (connection.status !== "pending") {
      return NextResponse.json(
        { error: "Connection request already processed" },
        { status: 400 }
      );
    }

    if (result.data.action === "accept") {
      // Update connection status
      const { error: updateError } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", id);

      if (updateError) {
        console.error("Accept connection error:", updateError);
        return NextResponse.json(
          { error: "Failed to accept connection" },
          { status: 500 }
        );
      }

      // Increment connection count for both users
      await supabase.rpc("increment_connection_counts", {
        profile1_uuid: connection.requester_id,
        profile2_uuid: connection.receiver_id,
      });

      return NextResponse.json({ success: true, status: "accepted" });
    } else {
      // Delete the connection request
      const { error: deleteError } = await supabase
        .from("connections")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Reject connection error:", deleteError);
        return NextResponse.json(
          { error: "Failed to reject connection" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, status: "rejected" });
    }
  } catch (error) {
    console.error("Update connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a connection
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

    const rl = await rateLimit(`connection-delete:${userId}`, 30, 60 * 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get the connection
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Must be part of the connection to delete it
    if (
      connection.requester_id !== profile.id &&
      connection.receiver_id !== profile.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only decrement counts if this was an accepted connection
    const wasAccepted = connection.status === "accepted";

    // Delete the connection
    const { error: deleteError } = await supabase
      .from("connections")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete connection error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete connection" },
        { status: 500 }
      );
    }

    // Decrement connection counts for both users if it was an accepted connection
    if (wasAccepted) {
      // Get current counts and decrement
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, connection_count")
        .in("id", [connection.requester_id, connection.receiver_id]);

      if (profiles) {
        for (const p of profiles) {
          await supabase
            .from("profiles")
            .update({ connection_count: Math.max(0, (p.connection_count || 0) - 1) })
            .eq("id", p.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
