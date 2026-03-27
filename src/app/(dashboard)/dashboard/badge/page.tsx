import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile-cache";
import { BadgePageClient } from "./badge-client";

export default async function BadgePage() {
  const { profile, userId } = await getProfile();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <BadgePageClient
      handle={profile.handle}
      fullName={profile.full_name}
      isVerified={profile.is_verified ?? false}
    />
  );
}
