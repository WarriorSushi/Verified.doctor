import { Skeleton } from "@/components/ui/skeleton";

export default function UpgradeLoading() {
  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Back button */}
      <Skeleton className="h-4 w-32" />
      {/* Hero */}
      <div className="text-center space-y-4">
        <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
        <Skeleton className="h-9 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
      {/* Trust indicators */}
      <div className="flex justify-center gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-5 w-32" />
        ))}
      </div>
      {/* Sale banner */}
      <Skeleton className="h-[88px] rounded-2xl" />
      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
      {/* CTA button */}
      <Skeleton className="h-[56px] w-full rounded-lg" />
    </div>
  );
}
