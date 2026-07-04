import { ArrowUpRight, CalendarDays, Layers3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatEther } from "viem";

import { getStatusLabel, type JuvraJob } from "@/lib/juvraEscrow";

export function JobCard({ children, job }: { children?: ReactNode; job: JuvraJob }) {
  const deadline = new Date(job.deadline * 1000).toLocaleDateString();

  return (
    <div className="group/card flex flex-col rounded-2xl border border-line bg-paper-raised p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl text-ink">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Layers3 className="size-3.5" />
            {job.category || "Uncategorized"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft">
          {getStatusLabel(job.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-xs text-ink-soft">Escrow</p>
          <p className="mt-1 font-serif text-lg text-ink">{formatEther(job.amount)} USDC</p>
        </div>
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-xs text-ink-soft">Deadline</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink">
            <CalendarDays className="size-4 text-ink-soft" />
            {deadline}
          </p>
        </div>
      </div>

      <p className="mt-4 break-all text-sm text-ink-soft">{job.descriptionURI}</p>
      {children}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-xs text-ink-soft">Job #{job.id.toString()}</span>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink"
          href={`/jobs/${job.id.toString()}`}
        >
          View job
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
