"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Scale,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { AgentFlagsPanel } from "@/components/agent/AgentFlagsPanel";
import AgentRiskPreview from "@/components/agent/AgentRiskPreview";
import { EmptyState } from "@/components/empty-state";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton, MetricCardSkeleton } from "@/components/loading-skeleton";
import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobCount } from "@/hooks/use-juvra-escrow";
import { getEscrowReadErrorMessage } from "@/lib/contract";
import { formatDate, formatUsdc } from "@/lib/format";
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
    <EditorialShell>
      <EditorialHeader
        actions={<ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />}
        description="Track every escrow where your wallet is the client or the selected freelancer."
        eyebrow="Mission control"
        title="Dashboard"
      />

      {!isConnected && (
        <div className="mt-12 rounded-2xl border border-line bg-paper-raised p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-line text-ink">
            <Wallet className="size-6" />
          </div>
          <h2 className="mt-5 font-serif text-2xl text-ink">Connect your wallet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
            Connect your Arc Testnet wallet to load your client jobs, freelancer assignments,
            disputes, and escrow totals.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton accountStatus="address" chainStatus="full" showBalance={false} />
          </div>
        </div>
      )}

      {isConnected && (
        <>
          {isError && (
            <div className="mt-6">
              <ErrorState title="Couldn't load your dashboard" description={readErrorMessage} />
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
            ) : (
              <>
                <MetricCard
                  icon={BriefcaseBusiness}
                  label="Jobs posted by me"
                  countTo={clientJobs.length}
                  tone="emerald"
                />
                <MetricCard
                  icon={UserCheck}
                  label="Jobs assigned to me"
                  countTo={freelancerJobs.length}
                  tone="sky"
                />
                <MetricCard
                  icon={CheckCircle2}
                  label="Completed jobs"
                  countTo={completedJobs.length}
                  tone="emerald"
                />
                <MetricCard
                  icon={Scale}
                  label="Disputed jobs"
                  countTo={disputedJobs.length}
                  tone="amber"
                />
                <MetricCard
                  icon={Banknote}
                  label="Total value involved"
                  value={formatUsdc(totalValue)}
                  tone="teal"
                />
              </>
            )}
          </div>

          <Tabs className="mt-8" defaultValue="client">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-full border border-line bg-paper-raised p-1 sm:w-fit">
              <TabsTrigger
                className="min-w-fit rounded-full px-4 py-1.5 text-ink-soft data-[state=active]:bg-ink data-[state=active]:text-paper data-[state=active]:shadow-none"
                value="client"
              >
                Client Jobs
                <Badge className="border-line bg-transparent text-current">
                  {clientJobs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                className="min-w-fit rounded-full px-4 py-1.5 text-ink-soft data-[state=active]:bg-ink data-[state=active]:text-paper data-[state=active]:shadow-none"
                value="freelancer"
              >
                Freelancer Jobs
                <Badge className="border-line bg-transparent text-current">
                  {freelancerJobs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                className="min-w-fit rounded-full px-4 py-1.5 text-ink-soft data-[state=active]:bg-ink data-[state=active]:text-paper data-[state=active]:shadow-none"
                value="disputes"
              >
                Disputes
                <Badge className="border-line bg-transparent text-current">
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
    </EditorialShell>
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
