import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md animate-pulse",
        "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "skeleton-shimmer 1.5s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

export { Skeleton }
