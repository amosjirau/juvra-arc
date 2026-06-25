"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Scale,
  UserCheck,
} from "lucide-react";
import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { AgentFlagsPanel } from "@/components/agent/AgentFlagsPanel";
import AgentRiskPreview from "@/components/agent/AgentRiskPreview";
import { EmptyState } from "@/components/empty-state";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobCount } from "@/hooks/use-juvra-escrow";
import { getEscrowReadErrorMessage } from "@/lib/contract";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
import {
  isEscrowConfigured,
  juvraEscrowAbi,
  juvraEscrowAddress,
  normalizeJuvraJob,
  type JuvraJob,
} from "@/lib/juvraEscrow";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
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
      enabled: isEscrowConfigured() && jobCount > 0 && isConnected,
    },
  });

  const jobs = useMemo(() => {
    return (jobsQuery.data ?? [])
      .map((item) => (item.status === "success" ? normalizeJuvraJob(item.result) : null))
      .filter((job): job is JuvraJob => Boolean(job))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [jobsQuery.data]);

  const wallet = address?.toLowerCase();
  const clientJobs = useMemo(
    () => jobs.filter((job) => wallet === job.client.toLowerCase()),
    [jobs, wallet],
  );
  const freelancerJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.freelancer !== zeroAddress && wallet === job.freelancer.toLowerCase(),
      ),
    [jobs, wallet],
  );
  const involvedJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          wallet === job.client.toLowerCase() ||
          (job.freelancer !== zeroAddress && wallet === job.freelancer.toLowerCase()),
      ),
    [jobs, wallet],
  );
  const disputedJobs = involvedJobs.filter((job) => job.status === 4);
  const completedJobs = involvedJobs.filter((job) => job.status === 3);
  const totalValue = involvedJobs.reduce((total, job) => total + job.amount, 0n);
  const isLoading = isConnected && (jobCountQuery.isLoading || jobsQuery.isLoading);
  const readError = jobCountQuery.error ?? jobsQuery.error;
  const isError = !isEscrowConfigured() || jobCountQuery.isError || jobsQuery.isError;
  const readErrorMessage = getEscrowReadErrorMessage(readError);

  return (
    <main className="min-h-screen text-white">
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_12%_12%,rgba(217,70,239,0.16),transparent_25rem),radial-gradient(circle_at_88%_0%,rgba(99,102,241,0.16),transparent_24rem)]" />
        <div className="premium-panel p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="eyebrow mb-4">
                <LayoutDashboard className="size-4" />
                Mission control
              </div>
              <h1 className="font-display heading-gradient text-4xl font-semibold tracking-normal sm:text-5xl">
                Dashboard
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                Track every escrow where your wallet is the client or selected freelancer.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              {address && (
                <Badge className="border-white/10 bg-white/5 font-mono text-zinc-300">
                  {shortAddress(address)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {!isConnected && (
          <Card className="mt-8 border-amber-200/20 bg-amber-200/10 shadow-2xl shadow-amber-950/10">
            <CardHeader>
              <CardTitle className="text-amber-100">Connect wallet required</CardTitle>
              <CardDescription className="text-amber-100/80">
                Connect your Arc Testnet wallet to load your client jobs, freelancer
                assignments, disputes, and escrow totals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton accountStatus="address" chainStatus="full" showBalance={false} />
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <>
            {isError && (
              <div className="mt-6 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                {readErrorMessage}
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <DashboardStat
                icon={BriefcaseBusiness}
                isLoading={isLoading}
                label="Jobs posted by me"
                value={String(clientJobs.length)}
                wide
              />
              <DashboardStat
                icon={UserCheck}
                isLoading={isLoading}
                label="Jobs assigned to me"
                tone="cyan"
                value={String(freelancerJobs.length)}
              />
              <DashboardStat
                icon={CheckCircle2}
                isLoading={isLoading}
                label="Completed jobs"
                value={String(completedJobs.length)}
              />
              <DashboardStat
                icon={Scale}
                isLoading={isLoading}
                label="Disputed jobs"
                tone="amber"
                value={String(disputedJobs.length)}
              />
              <DashboardStat
                icon={Banknote}
                isLoading={isLoading}
                label="Total value involved"
                tone="cyan"
                value={formatUsdc(totalValue)}
                wide
              />
            </div>

            <Tabs className="mt-8" defaultValue="client">
              <TabsList className="h-auto w-full justify-start overflow-x-auto border border-white/10 bg-white/[0.04] p-1 sm:w-fit">
                <TabsTrigger className="min-w-fit px-3 py-1.5" value="client">
                  Client Jobs
                  <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                    {clientJobs.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger className="min-w-fit px-3 py-1.5" value="freelancer">
                  Freelancer Jobs
                  <Badge className="border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
                    {freelancerJobs.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger className="min-w-fit px-3 py-1.5" value="disputes">
                  Disputes
                  <Badge className="border-amber-200/20 bg-amber-200/10 text-amber-100">
                    {disputedJobs.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent className="mt-5" value="client">
                <JobGrid
                  emptyDescription="Jobs you post and fund from this wallet will appear here."
                  emptyTitle="No client jobs"
                  isLoading={isLoading}
                  jobs={clientJobs}
                />
              </TabsContent>
              <TabsContent className="mt-5" value="freelancer">
                <JobGrid
                  emptyDescription="When a client selects this wallet, assigned work will appear here."
                  emptyTitle="No freelancer jobs"
                  isLoading={isLoading}
                  jobs={freelancerJobs}
                />
              </TabsContent>
              <TabsContent className="mt-5" value="disputes">
                <JobGrid
                  emptyDescription="Disputed client or freelancer jobs will appear here."
                  emptyTitle="No disputes"
                  isLoading={isLoading}
                  jobs={disputedJobs}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </section>
    </main>
  );
}

function DashboardStat({
  icon: Icon,
  isLoading,
  label,
  tone = "emerald",
  value,
  wide = false,
}: {
  icon: typeof Clock3;
  isLoading: boolean;
  label: string;
  tone?: "emerald" | "cyan" | "amber";
  value: string;
  wide?: boolean;
}) {
  const toneClass = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    cyan: "border-cyan-200/20 bg-cyan-200/10 text-cyan-100",
    amber: "border-amber-200/20 bg-amber-200/10 text-amber-100",
  }[tone];

  return (
    <Card className={`premium-card-hover border-white/10 bg-white/[0.045] ${wide ? "xl:col-span-2" : ""}`}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          {isLoading ? (
            <div className="mt-3 h-7 w-20 animate-pulse rounded-md bg-white/10" />
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

function JobGrid({
  emptyDescription,
  emptyTitle,
  isLoading,
  jobs,
}: {
  emptyDescription: string;
  emptyTitle: string;
  isLoading: boolean;
  jobs: JuvraJob[];
}) {
  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => {
        const mappedJob = {
          id: job.id.toString(),
          title: job.title,
          description: job.descriptionURI,
          budget: formatUsdc(job.amount),
          deadline: formatDate(job.deadline),
          deliverables: [],
          clientAddress: job.client,
          freelancerAddress: job.freelancer,
        };

        return (
          <JobCard job={job} key={job.id.toString()}>
            <AgentFlagsPanel compact job={job} />
            <AgentRiskPreview job={mappedJob} />
          </JobCard>
        );
      })}
    </div>
  );
}
