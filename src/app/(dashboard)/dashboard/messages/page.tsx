import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile-cache";
import { MessageList } from "@/components/dashboard/message-list";

export default async function MessagesPage() {
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  // Get messages
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_name, sender_phone, message_content, is_read, reply_content, reply_sent_at, created_at, is_admin_message, is_pinned, admin_sender_name, profile_id")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-600 mt-1">
          Patient inquiries sent through your profile
        </p>
      </div>

      <MessageList messages={messages || []} profileId={profile.id} />
    </div>
  );
}
