import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";

const createConnectionSchema = z.object({
  receiverId: z.string().uuid(),
});

// GET - List all connections for current user
export async function GET() {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get all accepted connections (where user is requester or receiver)
    // Query both directions separately to avoid SQL injection via string interpolation
    const { data: asRequester, error: err1 } = await supabase
      .from("connections")
      .select(`
        id,
        status,
        created_at,
        requester:profiles!connections_requester_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified
        ),
        receiver:profiles!connections_receiver_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified
        )
      `)
      .eq("requester_id", profile.id)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    const { data: asReceiver, error: err2 } = await supabase
      .from("connections")
      .select(`
        id,
        status,
        created_at,
        requester:profiles!connections_requester_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified
        ),
        receiver:profiles!connections_receiver_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified
        )
      `)
      .eq("receiver_id", profile.id)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    const error = err1 || err2;
    // Merge and deduplicate connections
    const connections = [...(asRequester || []), ...(asReceiver || [])];

    if (error) {
      console.error("Get connections error:", error);
      return NextResponse.json(
        { error: "Failed to fetch connections" },
        { status: 500 }
      );
    }

    // Transform to show the "other" person in each connection
    const transformedConnections = connections?.map((conn) => {
      const isRequester = conn.requester?.id === profile.id;
      return {
        id: conn.id,
        connectedAt: conn.created_at,
        profile: isRequester ? conn.receiver : conn.requester,
      };
    });

    // Get pending requests received
    const { data: pendingRequests } = await supabase
      .from("connections")
      .select(`
        id,
        created_at,
        requester:profiles!connections_requester_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified
        )
      `)
      .eq("receiver_id", profile.id)
      .eq("status", "pending");

    return NextResponse.json({
      connections: transformedConnections || [],
      pendingRequests: pendingRequests || [],
    });
  } catch (error) {
    console.error("Get connections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a connection request
export async function POST(request: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createConnectionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the requester's profile
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!requesterProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Can't connect to yourself
    if (requesterProfile.id === result.data.receiverId) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400 }
      );
    }

    // Check if connection already exists
    // Query both directions separately to avoid complex .or() with string interpolation
    const { data: existingAsRequester } = await supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", requesterProfile.id)
      .eq("receiver_id", result.data.receiverId)
      .single();

    const { data: existingAsReceiver } = await supabase
      .from("connections")
      .select("id, status")
      .eq("requester_id", result.data.receiverId)
      .eq("receiver_id", requesterProfile.id)
      .single();

    const existingConnection = existingAsRequester || existingAsReceiver;

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists", status: existingConnection.status },
        { status: 400 }
      );
    }

    // Create the connection request
    const { data: connection, error } = await supabase
      .from("connections")
      .insert({
        requester_id: requesterProfile.id,
        receiver_id: result.data.receiverId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Create connection error:", error);
      return NextResponse.json(
        { error: "Failed to create connection request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connection });
  } catch (error) {
    console.error("Create connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
