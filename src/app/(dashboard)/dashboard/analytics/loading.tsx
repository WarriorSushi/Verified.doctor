import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[160px] rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
      {/* Views chart */}
      <Skeleton className="h-[340px] rounded-xl" />
      {/* Actions + Device charts */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
      {/* Referrers */}
      <Skeleton className="h-[200px] rounded-xl" />
    </div>
  );
}
