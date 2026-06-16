"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  AlertTriangle,
  Gavel,
  Loader2,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { AdminAgentSummary } from "@/components/agent/AdminAgentSummary";
import { EmptyState } from "@/components/empty-state";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JobCardSkeleton } from "@/components/loading-skeleton";
import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { AdminGate } from "@/components/ui/admin-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { TxStatus, type TxState } from "@/components/ui/tx-status";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { useJobCount } from "@/hooks/use-juvra-escrow";
import { errorMessage, formatUsdc, shortAddress } from "@/lib/format";
import {
  isEscrowConfigured,
  juvraEscrowAbi,
  juvraEscrowAddress,
  normalizeJuvraJob,
  type JuvraJob,
} from "@/lib/juvraEscrow";

type Resolution = "client" | "freelancer";

export default function AdminPage() {
  const {
    adminAddress: arbitrator,
    arbitratorQuery,
    isAdmin: isArbitrator,
  } = useAdminAccess();
  const [activeResolution, setActiveResolution] = useState<{
    jobId: bigint;
    winner: Resolution;
  } | null>(null);

  const jobCountQuery = useJobCount();
  const jobCount = jobCountQuery.data ? Number(jobCountQuery.data) : 0;

  const jobIds = useMemo(
    () => Array.from({ length: jobCount }, (_, index) => index + 1),
    [jobCount],
  );

  const jobContracts = useMemo(
    () =>
      jobIds.map((id) => ({
        address: juvraEscrowAddress,
        abi: juvraEscrowAbi,
        functionName: "getJob",
        args: [BigInt(id)],
      })),
    [jobIds],
  );

  const jobsQuery = useReadContracts({
    contracts: jobContracts,
    query: {
      enabled: isEscrowConfigured() && isArbitrator && jobCount > 0,
    },
  });

  const disputedJobs = useMemo(() => {
    return (jobsQuery.data ?? [])
      .map((item) => (item.status === "success" ? normalizeJuvraJob(item.result) : null))
      .filter((job): job is JuvraJob => job !== null)
      .filter((job) => job.status === 4)
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [jobsQuery.data]);

  const resolveTx = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: resolveTx.data,
  });

  const disputedValue = disputedJobs.reduce((total, job) => total + job.amount, 0n);
  const isLoading =
    arbitratorQuery.isLoading ||
    jobCountQuery.isLoading ||
    (isArbitrator && jobsQuery.isLoading);
  const isBusy = resolveTx.isPending || receipt.isLoading;

  const resolveError = resolveTx.error ?? receipt.error;
  const txState: TxState = resolveError
    ? "error"
    : receipt.isSuccess
      ? "success"
      : isBusy
        ? "pending"
        : "idle";
  const txMessage = resolveError
    ? errorMessage(resolveError)
    : receipt.isSuccess
      ? `Dispute resolved in favor of the ${activeResolution?.winner === "client" ? "client (refund)" : "freelancer (release)"}.`
      : isBusy
        ? "Submitting resolution — confirm in your wallet…"
        : undefined;

  function resolveDispute(job: JuvraJob, winner: Resolution) {
    setActiveResolution({ jobId: job.id, winner });
    resolveTx.writeContract({
      address: juvraEscrowAddress,
      abi: juvraEscrowAbi,
      functionName: "resolveDispute",
      args: [job.id, winner === "client"],
    });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Arbitrator console"
        eyebrowIcon={ShieldCheck}
        title="Admin"
        description="Resolve disputed Juvra escrows as the configured on-chain arbitrator."
        actions={<ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />}
      />

      <div className="mt-8">
        <AdminGate>
          <Badge className="mb-6 border-white/10 bg-white/5 font-mono text-zinc-300">
            Arbitrator: {shortAddress(arbitrator)}
          </Badge>

          <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100 shadow-lg shadow-amber-950/10">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                Agent summaries are advisory. Admin resolution still requires manual wallet
                confirmation. Review the job, delivery, client, and freelancer addresses before
                resolving funds — this action moves escrowed USDC and cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={Gavel}
              label="Open disputes"
              countTo={disputedJobs.length}
              tone="amber"
            />
            <MetricCard
              icon={Scale}
              label="Disputed value"
              value={formatUsdc(disputedValue)}
              tone="orange"
            />
            <MetricCard
              icon={ShieldCheck}
              label="Admin wallet"
              value="Authorized"
              tone="emerald"
            />
          </div>

          <TxStatus className="mt-6" status={txState} message={txMessage} hash={resolveTx.data} />

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => <JobCardSkeleton key={index} />)}

            {!isLoading &&
              disputedJobs.map((job) => {
                const isActiveJob = activeResolution?.jobId === job.id;

                return (
                  <Card className="premium-card-hover border-white/10 bg-white/[0.045]" key={job.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                          <CardDescription className="mt-2 text-zinc-400">
                            Job #{job.id.toString()}
                          </CardDescription>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <AdminMetric label="Client" value={shortAddress(job.client)} />
                        <AdminMetric label="Freelancer" value={shortAddress(job.freelancer)} />
                        <AdminMetric label="Amount" value={formatUsdc(job.amount)} />
                        <AdminMetric label="Submission URI" value={job.submissionURI || "No submission"} />
                      </div>

                      <AdminAgentSummary job={job} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          className="border-sky-300/30 bg-sky-300/10 text-sky-100 hover:bg-sky-300/20"
                          disabled={isBusy}
                          onClick={() => resolveDispute(job, "client")}
                          variant="outline"
                        >
                          {isBusy && isActiveJob && activeResolution?.winner === "client" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Gavel className="size-4" />
                          )}
                          Resolve for Client
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-emerald-300 to-cyan-300 text-slate-950"
                          disabled={isBusy}
                          onClick={() => resolveDispute(job, "freelancer")}
                        >
                          {isBusy && isActiveJob && activeResolution?.winner === "freelancer" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Gavel className="size-4" />
                          )}
                          Resolve for Freelancer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {!isLoading && disputedJobs.length === 0 && (
            <div className="mt-8">
              <EmptyState
                description="Disputed jobs will appear here when clients or freelancers escalate an assigned escrow."
                title="No active disputes"
                icon={ShieldCheck}
              />
            </div>
          )}
        </AdminGate>
      </div>
    </AppShell>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-all font-mono text-sm text-zinc-200">{value}</p>
    </div>
  );
}
