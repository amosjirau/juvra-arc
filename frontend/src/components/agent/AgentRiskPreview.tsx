"use client";

import { AlertTriangle, Bot, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  loadAgentResult,
  saveAgentResult,
} from "@/lib/agent/storage";
import type { JobRiskAnalysis, RiskLevel } from "@/lib/agent/agentTypes";

type AgentJob = {
  id?: string;
  title?: string;
  description?: string;
  budget?: string;
  amount?: string;
  escrowAmount?: string;
  deadline?: string;
  deliverables?: string[];
  clientAddress?: string;
  client?: string;
  freelancerAddress?: string;
  freelancer?: string;
};

type AgentResponse<T> =
  | {
      success: true;
      result: T;
    }
  | {
      success: false;
      error?: string;
    };

export default function AgentRiskPreview({ job }: { job?: AgentJob | null }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobRiskAnalysis | null>(null);
  const [error, setError] = useState("");
  const jobId = job?.id?.toString().trim() || "";

  useEffect(() => {
    // Sync local state from the persisted (localStorage) store on job change.
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = loadAgentResult<JobRiskAnalysis>("risk", jobId);

    setResult(saved?.result ?? null);
    setError("");
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [jobId]);

  async function analyzeRisk() {
    setLoading(true);
    setError("");

    try {
      const data = await postAgent<JobRiskAnalysis>("/api/agent/analyze-job", {
        title: job?.title?.trim() || "Untitled job",
        description: job?.description?.trim() || "",
        budget: job?.budget || job?.amount || job?.escrowAmount,
        deadline: job?.deadline,
        deliverables: job?.deliverables || [],
        clientAddress: job?.clientAddress || job?.client,
        freelancerAddress: job?.freelancerAddress || job?.freelancer,
      });

      setResult(data);
      saveRiskResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze risk.");
    } finally {
      setLoading(false);
    }
  }

  function saveRiskResult(data: JobRiskAnalysis) {
    saveAgentResult("risk", jobId, data);
  }

  return (
    <div className="rounded-lg border border-line bg-paper p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
            <Bot className="size-3.5 shrink-0" />
            Agent risk
          </div>
          {result ? (
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <MiniMetric
                label="Risk"
                value={capitalize(result.riskLevel)}
                valueClassName={riskTextClass(result.riskLevel)}
              />
              <MiniMetric label="Clarity" value={`${result.clarityScore}/100`} />
            </div>
          ) : (
            <p className="mt-1 text-[0.72rem] leading-4 text-ink-soft">
              Compact decision-support check.
            </p>
          )}
        </div>
        <Button
          className="h-7 shrink-0 border-line bg-paper-raised px-2 text-[0.68rem] text-ink hover:bg-ink/[0.04]"
          disabled={loading}
          onClick={analyzeRisk}
          size="sm"
          type="button"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {result ? "Refresh" : "Analyze"}
        </Button>
      </div>

      {result && (
        <p className="mt-2 line-clamp-2 text-[0.72rem] leading-4 text-ink">
          {result.summary}
        </p>
      )}

      {error && (
        <div className="mt-2 flex gap-1.5 rounded-md border border-rose-300/40 bg-rose-500/[0.06] p-2 text-[0.68rem] leading-4 text-rose-700">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <p className="mt-2 text-[0.62rem] leading-4 text-ink-soft">
        Decision support only. No fund movement.
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  valueClassName = "text-ink",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-paper-raised px-2 py-1">
      <p className="text-[0.58rem] text-ink-soft">{label}</p>
      <p className={`mt-0.5 text-xs font-semibold leading-4 ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

async function postAgent<T>(url: string, payload: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as AgentResponse<T>;

  if (!data.success) {
    throw new Error(data.error || "Agent request failed.");
  }

  if (!res.ok) {
    throw new Error("Agent request failed.");
  }

  return data.result;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function riskTextClass(riskLevel: RiskLevel) {
  const classes = {
    low: "text-emerald-100",
    medium: "text-amber-100",
    high: "text-rose-100",
  } as const;

  return classes[riskLevel];
}
