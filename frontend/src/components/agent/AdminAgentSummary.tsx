"use client";

import { Bot, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AgentFlagsPanel } from "@/components/agent/AgentFlagsPanel";
import { Button } from "@/components/ui/button";
import {
  EVIDENCE_CHANGED_EVENT,
  type EvidenceItem,
} from "@/lib/agent/evidence";
import type {
  AgentRecommendation,
  DisputeSummaryResult,
} from "@/lib/agent/agentTypes";
import {
  AGENT_RESULT_CHANGED_EVENT,
  type AgentStorageType,
} from "@/lib/agent/storage";
import {
  loadAgentRun,
  loadEvidenceItems,
} from "@/lib/persistence/agentPersistence";
import type { JuvraJob } from "@/lib/juvraEscrow";

type SavedAdminState = {
  disputeSummary: DisputeSummaryResult | null;
  evidence: EvidenceItem[];
  recommendation: AgentRecommendation | null;
};

export function AdminAgentSummary({ job }: { job: JuvraJob }) {
  const [saved, setSaved] = useState<SavedAdminState>(() =>
    loadSavedAdminState(job.id)
  );

  useEffect(() => {
    function refresh() {
      setSaved(loadSavedAdminState(job.id));
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

  return (
    <div className="space-y-3 rounded-xl border border-cyan-200/10 bg-black/20 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100/70">
            <Bot className="size-3.5" />
            Agent context
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Saved locally from the job workspace.
          </p>
        </div>
        <Button asChild className="w-full sm:w-fit" size="sm" variant="outline">
          <Link href={`/jobs/${job.id.toString()}`}>
            <ExternalLink className="size-3.5" />
            Open Agent Workspace
          </Link>
        </Button>
      </div>

      <AgentFlagsPanel compact evidence={saved.evidence} job={job} />

      <SavedBlock
        emptyText="No saved dispute summary yet."
        label="Saved dispute summary"
        value={saved.disputeSummary?.summary}
      />
      <SavedBlock
        emptyText="No saved recommendation yet."
        label="Saved recommendation"
        value={
          saved.recommendation
            ? `${formatAction(saved.recommendation.suggestedAction)} - ${saved.recommendation.requiredHumanAction}`
            : undefined
        }
      />
    </div>
  );
}

function SavedBlock({
  emptyText,
  label,
  value,
}: {
  emptyText: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm leading-5 text-zinc-300">
        {value || emptyText}
      </p>
    </div>
  );
}

function loadSavedAdminState(jobId: bigint | string | number): SavedAdminState {
  return {
    disputeSummary:
      loadAgentRun<DisputeSummaryResult>("dispute", jobId)?.result ?? null,
    evidence: loadEvidenceItems(jobId),
    recommendation:
      loadAgentRun<AgentRecommendation>("recommendation", jobId)?.result ??
      null,
  };
}

function formatAction(action: AgentRecommendation["suggestedAction"]) {
  const labels: Record<AgentRecommendation["suggestedAction"], string> = {
    escalate_admin: "Escalate to admin",
    no_action: "No action needed",
    refund_client: "Refund client",
    release_full: "Release full payment",
    release_partial: "Release partial payment",
    request_revision: "Request revision",
  };

  return labels[action];
}
