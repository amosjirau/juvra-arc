import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="mt-4 h-4 w-5/6" />
      <div className="mt-6 flex justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="surface-2 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="size-11 rounded-xl" />
      </div>
    </div>
  );
}

/** Renders `count` job-card skeletons in a responsive grid. */
export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
