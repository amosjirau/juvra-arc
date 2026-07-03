"use client";

import { Gavel, ShieldCheck } from "lucide-react";

import { AdminAgentSummary } from "@/components/agent/AdminAgentSummary";
import { DisputePanel } from "@/components/DisputePanel";
import { EmptyState } from "@/components/empty-state";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JobCardSkeleton } from "@/components/loading-skeleton";
import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";
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

  if (!isConnected || !isArbitrator) {
    return (
      <EditorialShell>
        <div className="rounded-2xl border border-rose-300/40 bg-rose-500/[0.06] p-6 text-sm text-rose-700">
          {isConnected
            ? "Access denied. This page is only for the Juvra admin."
            : "Connect the admin wallet to access this page."}
        </div>
      </EditorialShell>
    );
  }

  return (
    <EditorialShell>
      <EditorialHeader
        actions={
          <div className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft">
            Arbitrator: <span className="font-mono text-ink">{shortAddress(arbitrator)}</span>
          </div>
        }
        description="Resolve disputed Juvra escrows as the configured arbitrator."
        eyebrow="Arbitrator console"
        title="Admin disputes"
      />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <StatsCard icon={Gavel} label="Open disputes" value={String(disputedJobs.length)} />
        <StatsCard icon={ShieldCheck} label="Disputed value" value={formatUsdc(disputedValue)} />
        <StatsCard icon={ShieldCheck} label="Admin wallet" value={isArbitrator ? "Authorized" : "Read only"} />
      </div>

      <div className="mt-6 rounded-2xl border border-accent-orange/30 bg-accent-orange/[0.06] p-4 text-sm text-ink">
        Agent summaries are advisory. Admin resolution still requires manual wallet confirmation.
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => <JobCardSkeleton key={index} />)}
        {!isLoading &&
          disputedJobs.map((job) => (
            <Card className="border-line bg-paper-raised" key={job.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-serif text-xl text-ink">{job.title}</CardTitle>
                    <p className="mt-2 text-sm text-ink-soft">Job #{job.id.toString()}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-paper p-3">
                    <p className="text-xs text-ink-soft">Amount</p>
                    <p className="mt-1 font-mono text-sm text-ink">{formatUsdc(job.amount)}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-paper p-3">
                    <p className="text-xs text-ink-soft">Client</p>
                    <p className="mt-1 font-mono text-sm text-ink">{shortAddress(job.client)}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-paper p-3">
                    <p className="text-xs text-ink-soft">Freelancer</p>
                    <p className="mt-1 font-mono text-sm text-ink">{shortAddress(job.freelancer)}</p>
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
    </EditorialShell>
  );
}
