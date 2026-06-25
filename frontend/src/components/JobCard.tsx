import { CalendarDays, Layers3, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatEther } from "viem";

import { JobStatusBadge } from "@/components/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { JuvraJob } from "@/lib/juvraEscrow";

export function JobCard({ children, job }: { children?: ReactNode; job: JuvraJob }) {
  const deadline = new Date(job.deadline * 1000).toLocaleDateString();

  return (
    <GlassCard interactive className="group/card flex flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover/card:text-emerald-50">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <Layers3 className="size-3.5 text-[#34d399]" />
            {job.category || "Uncategorized"}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
          <p className="text-xs text-zinc-500">Escrow</p>
          <p className="mt-1 font-mono text-base text-[#34d399]">{formatEther(job.amount)} USDC</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
          <p className="text-xs text-zinc-500">Deadline</p>
          <p className="mt-1 flex items-center gap-2">
            <CalendarDays className="size-4 text-[#38bdf8]" />
            {deadline}
          </p>
        </div>
      </div>

      <p className="mt-4 break-all text-sm text-zinc-400">{job.descriptionURI}</p>
      {children}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <UsersRound className="size-4" />
          Job #{job.id.toString()}
        </span>
        <Button asChild size="sm">
          <Link href={`/jobs/${job.id.toString()}`}>View job</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
