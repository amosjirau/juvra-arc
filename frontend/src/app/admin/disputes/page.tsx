"use client";

import { Gavel, ShieldCheck } from "lucide-react";
import { AdminAgentSummary } from "@/components/agent/AdminAgentSummary";
import { DisputePanel } from "@/components/DisputePanel";
import { EmptyState } from "@/components/empty-state";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JobCardSkeleton } from "@/components/loading-skeleton";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { useJobs } from "@/hooks/use-juvra-escrow";
import { formatUsdc, shortAddress } from "@/lib/format";

export default function AdminDisputesPage() {
  const {
    address,
    adminAddress: arbitrator,
    isAdmin: isArbitrator,
    isConnected,
  } = useAdminAccess();
  const { jobs, isLoading, refetch } = useJobs();
  const disputedJobs = jobs.filter((job) => job.status === 4);
  const disputedValue = disputedJobs.reduce((total, job) => total + job.amount, 0n);

  if (!isConnected) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-6 text-rose-100 shadow-2xl shadow-rose-950/10">
          Connect admin wallet to access this page.
        </div>
      </main>
    );
  }

  if (!isArbitrator) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-6 text-rose-100 shadow-2xl shadow-rose-950/10">
          Access denied. This page is only for the Juvra admin.
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_18%_8%,rgba(251,191,36,0.12),transparent_24rem),radial-gradient(circle_at_82%_0%,rgba(52,211,153,0.12),transparent_24rem)]" />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-gradient text-3xl font-semibold">Admin disputes</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Resolve disputed Juvra escrows as the configured arbitrator.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-zinc-300 shadow-lg shadow-black/10 backdrop-blur">
          Arbitrator: <span className="font-mono text-emerald-200">{shortAddress(arbitrator)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatsCard icon={Gavel} label="Open disputes" value={String(disputedJobs.length)} />
        <StatsCard icon={ShieldCheck} label="Disputed value" tone="blue" value={formatUsdc(disputedValue)} />
        <StatsCard icon={ShieldCheck} label="Admin wallet" value={isArbitrator ? "Authorized" : "Read only"} />
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100 shadow-lg shadow-amber-950/10">
        Agent summaries are advisory. Admin resolution still requires manual wallet confirmation.
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => <JobCardSkeleton key={index} />)}
        {!isLoading &&
          disputedJobs.map((job) => (
            <Card className="premium-card-hover border-white/10 bg-white/[0.045]" key={job.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">{job.title}</CardTitle>
                    <p className="mt-2 text-sm text-zinc-400">Job #{job.id.toString()}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
                    <p className="text-xs text-zinc-500">Amount</p>
                    <p className="mt-1 font-mono text-sm text-zinc-200">{formatUsdc(job.amount)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
                    <p className="text-xs text-zinc-500">Client</p>
                    <p className="mt-1 font-mono text-sm text-zinc-200">{shortAddress(job.client)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
                    <p className="text-xs text-zinc-500">Freelancer</p>
                    <p className="mt-1 font-mono text-sm text-zinc-200">{shortAddress(job.freelancer)}</p>
                  </div>
                </div>
                <AdminAgentSummary job={job} />
                <DisputePanel
                  arbitrator={arbitrator}
                  job={job}
                  onSettled={refetch}
                  walletAddress={address}
                />
              </CardContent>
            </Card>
          ))}
      </div>

      {!isLoading && disputedJobs.length === 0 && (
        <div className="mt-8">
          <EmptyState
            description="Raised disputes will appear here for arbitrator review."
            title="No active disputes"
          />
        </div>
      )}
    </main>
  );
}
