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

import { AgentConsole } from "@/components/agent/AgentConsole";
import { AgentFlagsPanel } from "@/components/agent/AgentFlagsPanel";
import { ApplyButton } from "@/components/apply-button";
import { DisputePanel } from "@/components/DisputePanel";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { SubmitWorkDialog } from "@/components/SubmitWorkDialog";
import { EditorialShell } from "@/components/shell/EditorialShell";
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
    <EditorialShell>
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-purple/25 bg-accent-purple/[0.06] px-3 py-1 text-sm font-medium text-accent-purple shadow-lg shadow-black/10">
                  <FileText className="size-4" />
                  Escrow Workspace
                </div>
                <p className="text-sm font-medium text-emerald-700">
                  Job #{job.id.toString()}
                </p>
                <h1 className="font-serif text-ink mt-2 text-3xl font-semibold">
                  {job.title}
                </h1>
                <p className="mt-3 text-ink-soft">{job.category}</p>
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
            <div className="flex items-center gap-2 text-ink">
              <UsersRound className="size-5 text-accent-purple" />
              <h2 className="font-serif text-base font-semibold">Applicants</h2>
              <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft">
                {applicants.length}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {applicantsQuery.isLoading && (
                <p className="text-sm text-ink-soft">Loading applicants...</p>
              )}
              {applicantsQuery.isError && (
                <div className="flex gap-2 rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <p>Could not read applicants for this job.</p>
                </div>
              )}
              {!applicantsQuery.isLoading && applicants.length === 0 && (
                <p className="text-sm text-ink-soft">No applications yet.</p>
              )}
              {applicants.map((applicant) => (
                <div
                  className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-paper p-3 sm:flex-row sm:items-center"
                  key={applicant}
                >
                  <span
                    className="break-all font-mono text-sm text-ink"
                    title={applicant}
                  >
                    {shortAddress(applicant)}
                  </span>
                  <Button
                    className="bg-gradient-to-r from-accent-purple to-accent-purple text-white"
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

          <AgentConsole
            agentJob={agentJob}
            arbitrator={arbitratorQuery.data as `0x${string}` | undefined}
            address={address}
            evidence={evidenceItems}
            job={job}
            onEvidenceChange={updateEvidenceItems}
            onSettled={refresh}
          />
        </section>

        <aside className="space-y-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">Escrow Intelligence</p>
            <h2 className="font-serif mt-1 text-2xl font-semibold text-ink">Agent workspace</h2>
            <p className="mt-3 rounded-xl border border-accent-orange/30 bg-accent-orange/[0.06] p-3 text-sm leading-6 text-accent-orange">
              The Juvra agent provides decision support and runs its own budgeted payments.
              Every escrow release, refund, or dispute action still requires an explicit
              human wallet confirmation.
            </p>
          </div>

          <GlassCard className="p-6">
            <h2 className="font-serif text-base font-semibold text-ink">Actions</h2>
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
                className="w-full border-rose-300/40 bg-rose-500/[0.06] text-rose-700 hover:bg-rose-500/[0.06]"
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
              <p className="text-xs text-ink-soft">
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
    </EditorialShell>
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
    <div className="rounded-xl border border-line bg-paper p-4 ">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-ink" title={fullValue}>
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
      ? "border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700"
      : "border-line bg-paper text-ink";

  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
        <Icon className="size-4 text-accent-purple" />
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
    <EditorialShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="surface-2 p-6">
          <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-32 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-24 animate-pulse rounded-xl border border-line bg-paper"
                key={index}
              />
            ))}
          </div>
          <div className="mt-6 h-28 animate-pulse rounded-xl border border-line bg-paper" />
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
    </EditorialShell>
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
      ? "border-rose-300/40 bg-rose-500/[0.06] text-rose-700"
      : "border-line bg-paper-raised text-ink";

  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl">
        <div className={`rounded-2xl border p-8 shadow-2xl shadow-black/20 ${toneClass}`}>
          <h1 className="font-serif text-2xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm opacity-80">{message}</p>
          <Button asChild className="mt-6">
            <Link href="/jobs">
              <ArrowLeft className="size-4" />
              Back to jobs
            </Link>
          </Button>
        </div>
      </div>
    </EditorialShell>
  );
}

function formatJobAmount(amount: bigint) {
  return `${Number(formatEther(amount)).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} USDC`;
}
