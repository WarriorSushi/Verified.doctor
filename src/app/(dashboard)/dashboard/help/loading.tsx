import { Skeleton } from "@/components/ui/skeleton";

export default function HelpLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
