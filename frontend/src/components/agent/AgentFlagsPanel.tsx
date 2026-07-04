"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  EVIDENCE_CHANGED_EVENT,
  type EvidenceItem,
} from "@/lib/agent/evidence";
import {
  getAgentFlags,
  type AgentFlag,
  type FlagJob,
} from "@/lib/agent/flags";
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
import {
  loadAgentRun,
  loadEvidenceItems,
} from "@/lib/persistence/agentPersistence";
import { cn } from "@/lib/utils";

export function AgentFlagsPanel({
  className,
  compact = false,
  evidence,
  job,
}: {
  className?: string;
  compact?: boolean;
  evidence?: EvidenceItem[];
  job: FlagJob & { id?: bigint | string | number };
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

      if (detail?.jobId === job.id?.toString()) {
        refresh();
      }
    }

    function onEvidenceChanged(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { jobId?: string }
        | undefined;

      if (detail?.jobId === job.id?.toString()) {
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

  const flags = useMemo(
    () =>
      getAgentFlags({
        deliveryReview: savedState.deliveryReview,
        disputeSummary: savedState.disputeSummary,
        evidence: evidence ?? savedState.evidence,
        job,
        recommendation: savedState.recommendation,
        riskAnalysis: savedState.riskAnalysis,
      }),
    [evidence, job, savedState]
  );

  if (flags.length === 0) {
    return compact ? null : (
      <div className={cn("rounded-xl border border-line bg-paper p-3 text-sm text-ink-soft", className)}>
        No advisory flags for this job.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
          Advisory flags
        </p>
      )}
      <div className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
        {flags.map((flag) => (
          <FlagBadge compact={compact} flag={flag} key={flag.type} />
        ))}
      </div>
    </div>
  );
}

function FlagBadge({ compact, flag }: { compact: boolean; flag: AgentFlag }) {
  const Icon =
    flag.severity === "critical"
      ? ShieldAlert
      : flag.severity === "warning"
        ? AlertTriangle
        : Info;
  const toneClass = {
    critical: "border-rose-300/40 bg-rose-500/[0.06] text-rose-700",
    info: "border-line bg-paper text-ink-soft",
    warning: "border-accent-orange/30 bg-accent-orange/[0.06] text-ink",
  }[flag.severity];

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.65rem] font-medium",
          toneClass
        )}
        title={flag.detail}
      >
        <Icon className="size-3" />
        {flag.label}
      </span>
    );
  }

  return (
    <div className={cn("flex gap-2 rounded-xl border p-3 text-sm", toneClass)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">{flag.label}</p>
        <p className="mt-1 text-xs opacity-80">{flag.detail}</p>
      </div>
    </div>
  );
}

function loadSavedState(jobId?: bigint | string | number) {
  return {
    deliveryReview:
      loadAgentRun<DeliveryReviewResult>("delivery", jobId)?.result ?? null,
    disputeSummary:
      loadAgentRun<DisputeSummaryResult>("dispute", jobId)?.result ?? null,
    evidence: loadEvidenceItems(jobId),
    recommendation:
      loadAgentRun<AgentRecommendation>("recommendation", jobId)?.result ?? null,
    riskAnalysis: loadAgentRun<JobRiskAnalysis>("risk", jobId)?.result ?? null,
  };
}
