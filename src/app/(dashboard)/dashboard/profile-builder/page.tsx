import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile-cache";
import { ProfileBuilder } from "@/components/dashboard/profile-builder/profile-builder";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfileBuilderPage({ searchParams }: PageProps) {
  const { profile, userId } = await getProfile();
  const params = await searchParams;

  if (!userId) {
    redirect("/sign-in");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return <ProfileBuilder profile={profile} initialTab={params.tab} />;
}
