import { CalendarDays, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatEther } from "viem";

import { JobStatusBadge } from "@/components/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { JuvraJob } from "@/lib/juvraEscrow";

export function JobCard({ children, job }: { children?: ReactNode; job: JuvraJob }) {
  const deadline = new Date(job.deadline * 1000).toLocaleDateString();

  return (
    <Card className="premium-card-hover border-white/10 bg-white/[0.045]">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-white transition-colors group-hover/card:text-emerald-50">
              {job.title}
            </CardTitle>
            <p className="mt-2 text-sm text-zinc-400">{job.category}</p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
            <p className="text-xs text-zinc-500">Escrow</p>
            <p className="mt-1 font-mono text-base text-emerald-200">
              {formatEther(job.amount)} USDC
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
            <p className="text-xs text-zinc-500">Deadline</p>
            <p className="mt-1 flex items-center gap-2">
              <CalendarDays className="size-4 text-sky-300" />
              {deadline}
            </p>
          </div>
        </div>
        <p className="break-all text-sm text-zinc-400">{job.descriptionURI}</p>
        {children}
      </CardContent>
      <CardFooter className="justify-between border-white/10 bg-black/25">
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <UsersRound className="size-4" />
          Job #{job.id.toString()}
        </span>
        <Button asChild>
          <Link href={`/jobs/${job.id.toString()}`}>View job</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
