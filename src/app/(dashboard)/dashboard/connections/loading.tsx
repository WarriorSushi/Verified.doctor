import { Skeleton } from "@/components/ui/skeleton";

export default function ConnectionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Network stats banner */}
      <Skeleton className="h-[120px] rounded-xl" />
      {/* Grid: connections + invite panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
