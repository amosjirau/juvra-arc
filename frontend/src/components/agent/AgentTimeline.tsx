"use client";

import {
  Bot,
  CheckCircle2,
  CircleDot,
  FileText,
  LinkIcon,
  Scale,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { zeroAddress } from "viem";

import {
  EVIDENCE_CHANGED_EVENT,
  type EvidenceItem,
} from "@/lib/agent/evidence";
import type {
  AgentRecommendation,
  DeliveryReviewResult,
  DisputeSummaryResult,
  JobRiskAnalysis,
} from "@/lib/agent/agentTypes";
import {
  AGENT_RESULT_CHANGED_EVENT,
  type AgentStorageType,
} from "@/lib/agent/storage";
import { formatUsdc, shortAddress } from "@/lib/format";
import {
  loadAgentRun,
  loadEvidenceItems,
} from "@/lib/persistence/agentPersistence";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { cn } from "@/lib/utils";

type TimelineItem = {
  detail?: string;
  icon: typeof CircleDot;
  order: number;
  timestamp?: string;
  title: string;
  tone: "cyan" | "emerald" | "amber" | "rose" | "zinc";
};

export function AgentTimeline({
  evidence,
  job,
}: {
  evidence?: EvidenceItem[];
  job: JuvraJob;
}) {
  const [savedState, setSavedState] = useState(() => loadSavedState(job.id));

  useEffect(() => {
    function refresh() {
      setSavedState(loadSavedState(job.id));
    }

    function onAgentChanged(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { jobId?: string; type?: AgentStorageType }
        | undefined;

      if (detail?.jobId === job.id.toString()) {
        refresh();
      }
    }

    function onEvidenceChanged(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { jobId?: string }
        | undefined;

      if (detail?.jobId === job.id.toString()) {
        refresh();
      }
    }

    refresh();
    window.addEventListener(AGENT_RESULT_CHANGED_EVENT, onAgentChanged);
    window.addEventListener(EVIDENCE_CHANGED_EVENT, onEvidenceChanged);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(AGENT_RESULT_CHANGED_EVENT, onAgentChanged);
      window.removeEventListener(EVIDENCE_CHANGED_EVENT, onEvidenceChanged);
      window.removeEventListener("storage", refresh);
    };
  }, [job.id]);

  const items = useMemo(
    () =>
      buildTimelineItems({
        evidence: evidence ?? savedState.evidence,
        job,
        savedState,
      }),
    [evidence, job, savedState]
  );

  return (
    <section className="rounded-[2rem] border border-line bg-paper-raised p-4 shadow-xl shadow-black/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-purple">
            Activity
          </p>
          <h2 className="font-serif mt-1 text-xl font-semibold text-ink">
            Agent timeline
          </h2>
        </div>
        <span className="rounded-full border border-line bg-paper px-2 py-1 text-xs text-ink-soft">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-paper p-3 text-sm text-ink-soft">
          No timeline events are available yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li className="flex gap-3" key={`${item.title}-${item.order}`}>
              <div
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                  toneClass(item.tone)
                )}
              >
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-line bg-paper p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-ink-soft">
                    {item.timestamp ? formatTimelineDate(item.timestamp) : "Time not indexed"}
                  </p>
                </div>
                {item.detail && (
                  <p className="mt-1 break-words text-xs leading-5 text-ink-soft">
                    {item.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function buildTimelineItems({
  evidence,
  job,
  savedState,
}: {
  evidence: EvidenceItem[];
  job: JuvraJob;
  savedState: ReturnType<typeof loadSavedState>;
}) {
  const items: TimelineItem[] = [
    {
      detail: `${formatUsdc(job.amount)} funded by ${shortAddress(job.client)}`,
      icon: FileText,
      order: 0,
      timestamp: timestampFromSeconds(job.createdAt),
      title: "Job posted",
      tone: "emerald",
    },
  ];

  if (job.freelancer !== zeroAddress) {
    items.push({
      detail: shortAddress(job.freelancer),
      icon: UserCheck,
      order: 10,
      title: "Freelancer selected",
      tone: "cyan",
    });
  }

  if (job.submissionURI) {
    items.push({
      detail: job.submissionURI,
      icon: LinkIcon,
      order: 20,
      title: "Work submitted",
      tone: "cyan",
    });
  }

  if (savedState.risk?.createdAt) {
    items.push({
      detail: savedState.risk.result.summary,
      icon: Bot,
      order: 30,
      timestamp: savedState.risk.createdAt,
      title: "Agent risk analysis generated",
      tone: "cyan",
    });
  }

  if (savedState.delivery?.createdAt) {
    items.push({
      detail: `${savedState.delivery.result.completionScore}/100 completion score`,
      icon: Bot,
      order: 40,
      timestamp: savedState.delivery.createdAt,
      title: "Agent delivery review generated",
      tone: "cyan",
    });
  }

  if (job.status === 4) {
    items.push({
      detail: "The escrow is currently disputed.",
      icon: Scale,
      order: 50,
      title: "Dispute raised",
      tone: "amber",
    });
  }

  if (savedState.dispute?.createdAt) {
    items.push({
      detail: savedState.dispute.result.summary,
      icon: Bot,
      order: 60,
      timestamp: savedState.dispute.createdAt,
      title: "Agent dispute summary generated",
      tone: "amber",
    });
  }

  if (savedState.recommendation?.createdAt) {
    items.push({
      detail: savedState.recommendation.result.requiredHumanAction,
      icon: Bot,
      order: 70,
      timestamp: savedState.recommendation.createdAt,
      title: "Agent recommendation generated",
      tone: "cyan",
    });
  }

  evidence.forEach((item, index) => {
    items.push({
      detail: item.note ?? item.evidenceUrl,
      icon: FileText,
      order: 80 + index,
      timestamp: item.createdAt,
      title: `Evidence note added (${item.type})`,
      tone: "zinc",
    });
  });

  if (job.status === 7) {
    items.push({
      detail: "The client approved the work on-chain. The agent settles the release.",
      icon: CheckCircle2,
      order: 95,
      title: "Client verdict: approve — awaiting agent settlement",
      tone: "emerald",
    });
  }

  if (job.status === 8) {
    items.push({
      detail: "The client rejected the work on-chain. The agent settles the refund.",
      icon: Scale,
      order: 96,
      title: "Client verdict: reject — awaiting agent settlement",
      tone: "rose",
    });
  }

  if (job.status === 3) {
    items.push({
      detail: "Contract status indicates work has been approved.",
      icon: CheckCircle2,
      order: 100,
      title: "Payment released / approved",
      tone: "emerald",
    });
  }

  if (job.status === 5) {
    items.push({
      detail: "Contract status indicates funds were refunded/resolved to the client.",
      icon: CheckCircle2,
      order: 110,
      title: "Job refunded / resolved",
      tone: "rose",
    });
  }

  if (job.status === 6) {
    items.push({
      detail: "Contract status indicates the job was cancelled.",
      icon: CheckCircle2,
      order: 120,
      title: "Job cancelled",
      tone: "rose",
    });
  }

  return items.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : Number.NaN;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : Number.NaN;

    if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
      return aTime - bTime;
    }

    return a.order - b.order;
  });
}

function loadSavedState(jobId?: bigint | string | number) {
  return {
    delivery: loadAgentRun<DeliveryReviewResult>("delivery", jobId),
    dispute: loadAgentRun<DisputeSummaryResult>("dispute", jobId),
    evidence: loadEvidenceItems(jobId),
    recommendation: loadAgentRun<AgentRecommendation>("recommendation", jobId),
    risk: loadAgentRun<JobRiskAnalysis>("risk", jobId),
  };
}

function timestampFromSeconds(timestamp: number) {
  return timestamp > 0 ? new Date(timestamp * 1000).toISOString() : undefined;
}

function formatTimelineDate(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Time not indexed";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toneClass(tone: TimelineItem["tone"]) {
  return {
    amber: "border-accent-orange/30 bg-accent-orange/[0.06] text-accent-orange",
    cyan: "border-accent-purple/25 bg-accent-purple/[0.06] text-accent-purple",
    emerald: "border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700",
    rose: "border-rose-300/40 bg-rose-500/[0.06] text-rose-700",
    zinc: "border-line bg-paper text-ink",
  }[tone];
}
