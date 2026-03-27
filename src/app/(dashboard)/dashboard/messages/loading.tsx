import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      {/* Message list */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
