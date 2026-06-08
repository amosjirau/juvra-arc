import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/10", className)} />;
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
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="mt-3 h-4 w-5/6" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
