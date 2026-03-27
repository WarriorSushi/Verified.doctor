import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      {/* Edit Profile link */}
      <Skeleton className="h-[72px] rounded-xl" />
      {/* Notification section */}
      <Skeleton className="h-[240px] rounded-xl" />
      {/* Email preferences */}
      <Skeleton className="h-[120px] rounded-xl" />
      {/* Privacy */}
      <Skeleton className="h-[200px] rounded-xl" />
      {/* Language */}
      <Skeleton className="h-[100px] rounded-xl" />
      {/* Account */}
      <Skeleton className="h-[160px] rounded-xl" />
    </div>
  );
}
