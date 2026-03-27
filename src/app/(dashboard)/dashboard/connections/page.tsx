import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile-cache";
import { ConnectionsList } from "@/components/dashboard/connections-list";
import { NetworkStats } from "@/components/dashboard/network-stats";
import { InvitePanel } from "@/components/dashboard/invite-panel";

export default async function ConnectionsPage() {
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  const supabase = await createClient();

  // Run all queries in parallel for performance
  const [connectionsResult, pendingResult, invitesResult, suggestedResult] = await Promise.all([
    // Get all accepted connections
    supabase
      .from("connections")
      .select(`
        id,
        status,
        created_at,
        requester:profiles!connections_requester_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified, clinic_location
        ),
        receiver:profiles!connections_receiver_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified, clinic_location
        )
      `)
      .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false }),
    // Get pending requests received
    supabase
      .from("connections")
      .select(`
        id,
        created_at,
        requester:profiles!connections_requester_id_fkey(
          id, full_name, handle, specialty, profile_photo_url, is_verified, clinic_location
        )
      `)
      .eq("receiver_id", profile.id)
      .eq("status", "pending"),
    // Get all invites
    supabase
      .from("invites")
      .select("used")
      .eq("inviter_profile_id", profile.id),
    // Suggested connections: same specialty or location, not already connected
    supabase
      .from("profiles")
      .select("id, full_name, handle, specialty, profile_photo_url, is_verified, clinic_location")
      .neq("id", profile.id)
      .eq("is_banned", false)
      .eq("is_frozen", false)
      .limit(6),
  ]);

  const connections = connectionsResult.data;
  const pendingRequests = pendingResult.data;
  const invites = invitesResult.data || [];
  const invitesSent = invites.length;
  const invitesAccepted = invites.filter(i => i.used).length;

  // Transform to show the "other" person
  const transformedConnections = connections?.map((conn) => {
    const isRequester = conn.requester?.id === profile.id;
    return {
      id: conn.id,
      connectedAt: conn.created_at,
      profile: isRequester ? conn.receiver : conn.requester,
    };
  }) || [];

  // Filter suggested connections - exclude already connected
  const connectedIds = new Set(transformedConnections.map(c => c.profile?.id));
  const pendingIds = new Set(pendingRequests?.map(p => p.requester?.id) || []);
  const suggestedConnections = (suggestedResult.data || [])
    .filter(p => !connectedIds.has(p.id) && !pendingIds.has(p.id))
    .filter(p => {
      // Prioritize same specialty or location
      if (profile.specialty && p.specialty === profile.specialty) return true;
      if (profile.clinic_location && p.clinic_location === profile.clinic_location) return true;
      return true;
    })
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Connections</h1>
        <p className="text-sm text-slate-600 mt-1">
          Build your professional network with verified physicians
        </p>
      </div>

      {/* Network Stats */}
      <NetworkStats
        connectionCount={profile.connection_count || transformedConnections.length}
        pendingRequestsCount={pendingRequests?.length || 0}
        invitesSent={invitesSent || 0}
        invitesAccepted={invitesAccepted || 0}
      />

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Connections List - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <ConnectionsList
            connections={transformedConnections}
            pendingRequests={pendingRequests || []}
            suggestedConnections={suggestedConnections}
            currentSpecialty={profile.specialty}
            currentLocation={profile.clinic_location}
          />
        </div>

        {/* Invite Panel - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <InvitePanel
            doctorName={profile.full_name}
            currentConnectionCount={profile.connection_count || transformedConnections.length}
          />
        </div>
      </div>
    </div>
  );
}
