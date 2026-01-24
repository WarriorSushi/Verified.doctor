import { Skeleton } from "@/components/ui/skeleton";

export default function UpgradeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
