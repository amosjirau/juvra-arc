"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleX,
  FileText,
  LinkIcon,
  UserCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

import AgentPanel from "@/components/agent/AgentPanel";
import { AgentFlagsPanel } from "@/components/agent/AgentFlagsPanel";
import { AgentGuidedActions } from "@/components/agent/AgentGuidedActions";
import { AgentTimeline } from "@/components/agent/AgentTimeline";
import { EvidencePanel } from "@/components/agent/EvidencePanel";
import { AgentScopeBuilder } from "@/components/agent/AgentScopeBuilder";
import { ApplyButton } from "@/components/apply-button";
import { ArcscanLink } from "@/components/arcscan-link";
import { DisputePanel } from "@/components/DisputePanel";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { SubmitWorkDialog } from "@/components/SubmitWorkDialog";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TxStatus, type TxState } from "@/components/ui/tx-status";
import type { EvidenceItem } from "@/lib/agent/evidence";
import {
  isSameAddress,
  useApplicants,
  useArbitrator,
  useEscrowWrite,
  useJob,
  useJobCount,
} from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { errorMessage, formatDate, shortAddress } from "@/lib/format";
import {
  getStatusLabel,
  isEscrowConfigured,
  juvraEscrowAbi,
  juvraEscrowAddress,
  normalizeJuvraJob,
} from "@/lib/juvraEscrow";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => {
    if (!params.id || !/^\d+$/.test(params.id)) {
      return undefined;
    }

    const id = BigInt(params.id);

    return id > 0n ? id : undefined;
  }, [params.id]);
  const { address } = useAccount();
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const jobCountQuery = useJobCount();
  const jobCount = useMemo(() => {
    const value = jobCountQuery.data;

    if (typeof value === "bigint") {
      return value;
    }

    if (typeof value === "number" && Number.isSafeInteger(value)) {
      return BigInt(value);
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      return BigInt(value);
    }

    return undefined;
  }, [jobCountQuery.data]);
  const readableJobId =
    jobId !== undefined && jobCount !== undefined && jobId <= jobCount
      ? jobId
      : undefined;
  const isKnownMissing =
    jobId !== undefined && jobCount !== undefined && jobId > jobCount;
  const jobQuery = useJob(readableJobId);
  const applicantsQuery = useApplicants(readableJobId);
  const arbitratorQuery = useArbitrator();
  const actionTx = useEscrowWrite();
  const job = useMemo(() => normalizeJuvraJob(jobQuery.data), [jobQuery.data]);
  const applicants = (applicantsQuery.data ?? []) as `0x${string}`[];
  const isClient = isSameAddress(address, job?.client);
  const isSelectedFreelancer = isSameAddress(address, job?.freelancer);

  const refresh = useCallback(async () => {
    await jobCountQuery.refetch();
    await jobQuery.refetch();
    await applicantsQuery.refetch();
  }, [applicantsQuery, jobCountQuery, jobQuery]);
  const updateEvidenceItems = useCallback((items: EvidenceItem[]) => {
    setEvidenceItems(items);
  }, []);

  useTransactionSuccess(actionTx.transactionHash, actionTx.isSuccess, refresh);

  if (!jobId) {
    return (
      <StateCard
        tone="rose"
        title="Invalid job ID"
        message="Use a positive escrow job ID to open a job workspace."
      />
    );
  }

  if (!isEscrowConfigured()) {
    return (
      <StateCard
        tone="rose"
        title="Escrow contract is not configured."
        message="Set the deployed Juvra escrow contract address before opening job workspaces."
      />
    );
  }

  if (
    jobCountQuery.isLoading ||
    (readableJobId !== undefined && jobQuery.isLoading)
  ) {
    return <JobDetailSkeleton />;
  }

  if (jobCountQuery.isError) {
    return (
      <StateCard
        tone="rose"
        title="Could not load escrow job count."
        message="Confirm the Arc RPC and escrow contract configuration."
      />
    );
  }

  if (isKnownMissing) {
    return (
      <StateCard
        tone="neutral"
        title="Job not found or no longer available."
        message="Return to the marketplace and choose another escrow-backed job."
      />
    );
  }

  if (jobQuery.isError) {
    return (
      <StateCard
        tone="rose"
        title="Could not load this escrow job."
        message="Confirm the job ID, Arc RPC, and escrow contract configuration."
      />
    );
  }

  if (!job || job.id !== jobId || job.id === 0n || !job.title.trim()) {
    return (
      <StateCard
        tone="neutral"
        title="Job not found or no longer available."
        message="Return to the marketplace and choose another escrow-backed job."
      />
    );
  }

  const formattedAmount = formatJobAmount(job.amount);
  const agentJob = {
    id: job.id?.toString?.() ?? String(jobId),
    title: job.title,
    description: job.descriptionURI,
    descriptionURI: job.descriptionURI,
    category: job.category,
    budget: formattedAmount,
    amount: job.amount?.toString?.(),
    deadline: formatDate(job.deadline),
    deliverables: [],
    clientAddress: job.client,
    freelancerAddress: job.freelancer,
    status: Number(job.status),
    submissionURI: job.submissionURI,
  };

  const actionTxState: TxState = actionTx.error
    ? "error"
    : actionTx.isSuccess
      ? "success"
      : actionTx.isPending
        ? "pending"
        : "idle";

  return (
    <AppShell>
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-sm font-medium text-cyan-100 shadow-lg shadow-black/10">
                  <FileText className="size-4" />
                  Escrow Workspace
                </div>
                <p className="text-sm font-medium text-emerald-200/80">
                  Job #{job.id.toString()}
                </p>
                <h1 className="font-display heading-gradient mt-2 text-3xl font-semibold">
                  {job.title}
                </h1>
                <p className="mt-3 text-zinc-400">{job.category}</p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Metric label="Job ID" value={job.id.toString()} />
              <Metric label="Status" value={getStatusLabel(job.status)} />
              <Metric label="Escrow amount" value={formattedAmount} />
              <Metric label="Deadline" value={formatDate(job.deadline)} />
              <Metric
                fullValue={job.client}
                label="Client address"
                value={shortAddress(job.client)}
              />
              <Metric
                fullValue={job.freelancer}
                label="Freelancer address"
                value={shortAddress(job.freelancer)}
              />
              <Metric label="Created date" value={formatDate(job.createdAt)} />
            </div>
            <div className="mt-6 space-y-6">
              <ResourceBlock
                icon={FileText}
                label="Description URI"
                tone="neutral"
                value={job.descriptionURI}
              />
              <ResourceBlock
                icon={LinkIcon}
                label="Submission URI"
                tone={job.submissionURI ? "success" : "neutral"}
                value={job.submissionURI || "No submission yet."}
              />
            </div>
          </GlassCard>

          <AgentFlagsPanel evidence={evidenceItems} job={job} />

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-white">
              <UsersRound className="size-5 text-cyan-100" />
              <h2 className="font-heading text-base font-semibold">Applicants</h2>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-400">
                {applicants.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {applicantsQuery.isLoading && (
                <p className="text-sm text-zinc-500">Loading applicants...</p>
              )}
              {applicantsQuery.isError && (
                <div className="flex gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p>Could not read applicants for this job.</p>
                </div>
              )}
              {!applicantsQuery.isLoading && applicants.length === 0 && (
                <p className="text-sm text-zinc-500">No applications yet.</p>
              )}
              {applicants.map((applicant) => (
                <div
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10 sm:flex-row sm:items-center"
                  key={applicant}
                >
                  <span
                    className="break-all font-mono text-sm text-zinc-300"
                    title={applicant}
                  >
                    {shortAddress(applicant)}
                  </span>
                  <Button
                    className="bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950"
                    disabled={!isClient || job.status !== 0 || actionTx.isPending}
                    onClick={() =>
                      actionTx.writeContract({
                        address: juvraEscrowAddress,
                        abi: juvraEscrowAbi,
                        functionName: "selectFreelancer",
                        args: [job.id, applicant],
                      })
                    }
                    size="sm"
                  >
                    <UserCheck className="size-4" />
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>

          <EvidencePanel
            jobId={job.id.toString()}
            onEvidenceChange={updateEvidenceItems}
            submittedBy={address}
          />

          <AgentTimeline evidence={evidenceItems} job={job} />
        </section>

        <aside className="space-y-5">
          <section className="space-y-3">
            <div>
              <p className="text-sm font-medium text-cyan-100/80">Escrow Intelligence</p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-white">Agent workspace</h2>
              <p className="mt-2 rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
                Juvra Agent provides decision support only. Every escrow action still requires
                explicit wallet confirmation.
              </p>
            </div>
            <AgentPanel evidence={evidenceItems} job={agentJob} />
            <AgentScopeBuilder evidence={evidenceItems} job={agentJob} />
          </section>

          <AgentGuidedActions
            arbitrator={arbitratorQuery.data as `0x${string}` | undefined}
            job={job}
            onSettled={refresh}
            walletAddress={address}
          />

          <GlassCard className="p-6">
            <h2 className="font-heading text-base font-semibold text-white">Actions</h2>
            <div className="mt-4 space-y-3">
              <ApplyButton job={job} onSettled={refresh} />
              <SubmitWorkDialog
                disabled={!isSelectedFreelancer || job.status !== 1}
                job={job}
                onSettled={refresh}
              />
              <Button
                className="w-full"
                disabled={!isClient || job.status !== 2 || actionTx.isPending}
                onClick={() =>
                  actionTx.writeContract({
                    address: juvraEscrowAddress,
                    abi: juvraEscrowAbi,
                    functionName: "approveWork",
                    args: [job.id],
                  })
                }
              >
                <CheckCircle2 className="size-4" />
                {actionTx.isPending ? "Confirming..." : "Approve work"}
              </Button>
              <Button
                className="w-full border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
                disabled={!isClient || job.status !== 0 || actionTx.isPending}
                onClick={() =>
                  actionTx.writeContract({
                    address: juvraEscrowAddress,
                    abi: juvraEscrowAbi,
                    functionName: "cancelJob",
                    args: [job.id],
                  })
                }
                variant="outline"
              >
                <CircleX className="size-4" />
                Cancel open job
              </Button>
              <TxStatus status={actionTxState} message={actionTx.error ? errorMessage(actionTx.error) : undefined} hash={actionTx.transactionHash} />
              <p className="text-xs text-zinc-500">
                Buttons unlock based on wallet role and contract status. Agent guidance cannot
                release or refund funds.
              </p>
            </div>
          </GlassCard>

          <DisputePanel
            arbitrator={arbitratorQuery.data as `0x${string}` | undefined}
            job={job}
            onSettled={refresh}
            walletAddress={address}
          />
        </aside>
      </div>
    </AppShell>
  );
}

function Metric({
  fullValue,
  label,
  value,
}: {
  fullValue?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4 shadow-inner shadow-black/10">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-white" title={fullValue}>
        {value}
      </p>
    </div>
  );
}

function ResourceBlock({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof FileText;
  label: string;
  tone: "neutral" | "success";
  value: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : "border-white/10 bg-black/20 text-zinc-300";

  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Icon className="size-4 text-cyan-100/80" />
        {label}
      </h2>
      <p className={`mt-2 break-all rounded-lg border p-4 text-sm ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="surface-2 p-6">
          <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-24 animate-pulse rounded-xl border border-white/10 bg-black/25"
                key={index}
              />
            ))}
          </div>
          <div className="mt-6 h-28 animate-pulse rounded-xl border border-white/10 bg-black/25" />
        </section>
        <aside className="surface-2 p-6">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-11 animate-pulse rounded-lg bg-white/10" key={index} />
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function StateCard({
  message,
  title,
  tone,
}: {
  message: string;
  title: string;
  tone: "neutral" | "rose";
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : "border-white/10 bg-white/[0.05] text-zinc-200";

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className={`rounded-2xl border p-8 shadow-2xl shadow-black/20 ${toneClass}`}>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm opacity-80">{message}</p>
          <Button asChild className="mt-6">
            <Link href="/jobs">
              <ArrowLeft className="size-4" />
              Back to jobs
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function formatJobAmount(amount: bigint) {
  return `${Number(formatEther(amount)).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} USDC`;
}
