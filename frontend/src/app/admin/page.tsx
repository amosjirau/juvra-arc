"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  AlertTriangle,
  CheckCircle2,
  Gavel,
  Loader2,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ArcscanLink } from "@/components/arcscan-link";
import { EmptyState } from "@/components/empty-state";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JobCardSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    address,
    adminAddress: arbitrator,
    arbitratorQuery,
    isAdmin: isArbitrator,
    isConnected,
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
    <main className="min-h-screen text-white">
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_15%_15%,rgba(251,191,36,0.14),transparent_24rem),radial-gradient(circle_at_88%_0%,rgba(217,70,239,0.14),transparent_24rem)]" />
        <div className="premium-panel p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-sm font-medium text-amber-100 shadow-lg shadow-amber-950/20">
                <ShieldCheck className="size-4" />
                Arbitrator console
              </div>
              <h1 className="font-display heading-gradient text-4xl font-semibold tracking-normal sm:text-5xl">
                Admin
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                Resolve disputed Juvra escrows as the configured arbitrator.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
                Arbitrator: {shortAddress(arbitrator)}
              </Badge>
            </div>
          </div>
        </div>

        {!isLoading && !isConnected && (
          <Card className="mt-8 border-rose-300/20 bg-rose-300/10 shadow-2xl shadow-rose-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-100">
                <ShieldAlert className="size-5" />
                Connect admin wallet to access this page.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-rose-100/80">
              <p>
                Required admin:{" "}
                <span className="font-mono text-rose-100">{shortAddress(arbitrator)}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && isConnected && !isArbitrator && (
          <Card className="mt-8 border-rose-300/20 bg-rose-300/10 shadow-2xl shadow-rose-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-100">
                <ShieldAlert className="size-5" />
                Access denied
              </CardTitle>
              <CardDescription className="text-rose-100/80">
                Access denied. This page is only for the Juvra admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-rose-100/80">
              <p>
                Connected wallet:{" "}
                <span className="font-mono text-rose-100">{shortAddress(address)}</span>
              </p>
              <p>
                Required arbitrator:{" "}
                <span className="font-mono text-rose-100">{shortAddress(arbitrator)}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {isArbitrator && (
          <>
            <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100 shadow-lg shadow-amber-950/10">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  Dispute decisions are final. Review the job, delivery, client, and
                  freelancer addresses before resolving funds.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <AdminStat
                icon={Gavel}
                label="Open disputes"
                loading={isLoading}
                value={String(disputedJobs.length)}
              />
              <AdminStat
                icon={Scale}
                label="Disputed value"
                loading={isLoading}
                tone="amber"
                value={formatUsdc(disputedValue)}
              />
              <AdminStat
                icon={ShieldCheck}
                label="Admin wallet"
                loading={isLoading}
                value="Authorized"
              />
            </div>

            {(resolveTx.error || receipt.error) && (
              <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                {errorMessage(resolveTx.error ?? receipt.error)}
              </div>
            )}

            {receipt.isSuccess && (
              <div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  Dispute resolved for{" "}
                  {activeResolution?.winner === "client" ? "client" : "freelancer"}.
                </div>
                <ArcscanLink className="mt-2" hash={resolveTx.data} />
              </div>
            )}

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}

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
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function AdminStat({
  icon: Icon,
  label,
  loading,
  tone = "emerald",
  value,
}: {
  icon: typeof Gavel;
  label: string;
  loading: boolean;
  tone?: "emerald" | "amber";
  value: string;
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200/20 bg-amber-200/10 text-amber-100"
      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";

  return (
    <Card className="premium-card-hover border-white/10 bg-white/[0.045]">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          {loading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-md bg-white/10" />
          ) : (
            <p className="font-display mt-2 text-2xl font-semibold tracking-normal text-white">{value}</p>
          )}
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl border shadow-lg shadow-black/10 ${toneClass}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
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
