"use client";

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileCheck2,
  Loader2,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AgentProviderName,
  AgentRuntimeMode,
} from "@/lib/agent/provider";
import type {
  SettlementImpact,
  VerificationStatus,
} from "@/lib/agent/agentTypes";
import {
  clearAgentEconomicActions,
  loadAgentEconomicActions,
  saveAgentEconomicAction,
  type AgentEconomicAction,
} from "@/lib/agent/economicLedger";
import type { EvidenceItem } from "@/lib/agent/evidence";
import {
  getNanopaymentMemo,
  getVerificationCost,
  shouldRunVerification,
} from "@/lib/agent/nanopaymentPolicy";

type VerificationResult = {
  verificationId: string;
  verificationCostUSDC: string;
  verificationStatus: VerificationStatus;
  checkedSignals: string[];
  findings: string[];
  riskFlags: string[];
  settlementImpact: SettlementImpact;
  receipt: {
    jobId: string;
    timestamp: string;
    agent: "Juvra Verification Agent";
    costUSDC: string;
    memo: string;
  };
  safetyNotice: string;
};

type VerificationResponse =
  | {
      success: true;
      mode: AgentRuntimeMode;
      provider: AgentProviderName;
      result: VerificationResult;
    }
  | {
      success: false;
      error?: string;
      details?: string;
    };

// Flattened view stored in component state: the result payload plus the
// runtime mode and provider that produced it.
type VerificationView = VerificationResult & {
  mode: AgentRuntimeMode;
  provider: AgentProviderName;
};

type VerificationJob = {
  id?: string;
  title?: string;
  description?: string;
  descriptionURI?: string;
  status?: number;
  submissionURI?: string;
};

export function AgentVerificationPanel({
  evidence = [],
  job,
}: {
  evidence?: EvidenceItem[];
  job?: VerificationJob | null;
}) {
  const jobId = job?.id?.toString().trim() || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerificationView | null>(null);
  const [ledger, setLedger] = useState<AgentEconomicAction[]>([]);
  const localRiskFlags = useMemo(
    () => getLocalRiskFlags(job?.status, evidence),
    [evidence, job?.status]
  );
  const policyRiskLevel =
    localRiskFlags.length >= 2 || job?.status === 4
      ? "high"
      : localRiskFlags.length === 1
        ? "medium"
        : "low";
  const estimatedCost = getVerificationCost(policyRiskLevel, evidence.length);
  const verificationRecommended = shouldRunVerification(
    job?.status,
    localRiskFlags,
    evidence
  );
  const canRun = Boolean(jobId && evidence.length > 0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLedger(jobId ? loadAgentEconomicActions(jobId) : []);
    setResult(null);
    setError("");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [jobId]);

  async function runVerification() {
    if (!jobId) {
      setError("Job ID is required before verification can run.");
      return;
    }

    if (evidence.length === 0) {
      setError("Add delivery evidence before spending verification budget.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/verify-evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          jobTitle: job?.title || "Untitled job",
          deliveryText: buildDeliveryText(job, evidence),
          evidenceItems: evidence,
          verificationBudgetUSDC: estimatedCost,
        }),
      });
      const data = (await response.json()) as VerificationResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.success
            ? "Verification failed."
            : data.error ??
              "Live AI provider failed. Check API key, quota, model, or billing."
        );
      }

      const view: VerificationView = {
        ...data.result,
        mode: data.mode,
        provider: data.provider,
      };

      setResult(view);
      saveVerificationLedgerEntry(jobId, view);
      setLedger(loadAgentEconomicActions(jobId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not run verification."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearLedger() {
    clearAgentEconomicActions(jobId);
    setLedger([]);
  }

  return (
    <Card className="premium-card-hover rounded-[2rem] border-white/10 bg-white/[0.045]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileCheck2 className="size-5 text-emerald-200" />
              Agent verification
            </CardTitle>
            <p className="mt-2 text-sm leading-5 text-zinc-400">
              Juvra Agent can run a USDC-denominated verification workflow before
              recommending settlement. This does not move escrow funds.
            </p>
          </div>
          <Badge className="border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
            {estimatedCost} USDC
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <SignalMetric label="Evidence items" value={evidence.length.toString()} />
          <SignalMetric
            label="Policy"
            value={verificationRecommended ? "Recommended" : "Wait"}
          />
          <SignalMetric label="Status" value={jobStatusLabel(job?.status)} />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-white">Evidence items</h3>
            <span className="text-xs text-zinc-500">
              Testnet/demo verification payment
            </span>
          </div>
          {evidence.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No evidence is attached yet. The agent will not spend verification
              budget until delivery evidence exists.
            </p>
          ) : (
            <div className="space-y-2">
              {evidence.map((item) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
                  key={item.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-cyan-100">
                      {item.type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  {item.evidenceUrl && (
                    <p className="mt-2 break-all font-mono text-xs text-emerald-100">
                      {item.evidenceUrl}
                    </p>
                  )}
                  {item.note && (
                    <p className="mt-2 text-sm leading-5 text-zinc-300">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {localRiskFlags.length > 0 && (
          <div className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Policy signals</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {localRiskFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-zinc-500">
            Escrow funds are not controlled by the agent. Final release, refund,
            cancellation, and dispute actions still require a human click and wallet
            confirmation.
          </p>
          <Button
            className="w-full sm:w-fit"
            disabled={loading || !canRun}
            onClick={runVerification}
            type="button"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bot className="size-4" />
            )}
            {loading ? "Verifying..." : "Run agent verification"}
          </Button>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
            {error}
          </p>
        )}

        {result && <VerificationResultBlock result={result} />}

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                <ReceiptText className="size-4 text-cyan-100" />
                Agent economic action log
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Transparent local ledger for demo/testnet agent verification
                workflow.
              </p>
            </div>
            <Button
              className="h-8 px-2 text-rose-100 hover:text-rose-50"
              disabled={ledger.length === 0}
              onClick={clearLedger}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
              Clear records
            </Button>
          </div>
          {ledger.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No agent economic actions have been recorded for this job.
            </p>
          ) : (
            <div className="space-y-2">
              {ledger.map((action) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
                  key={action.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {formatActionType(action.type)}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        {action.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-sm text-emerald-100">
                        {action.amountUSDC} USDC
                      </p>
                      <p className="mt-1 text-xs capitalize text-zinc-500">
                        {action.status}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDateTime(action.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VerificationResultBlock({ result }: { result: VerificationView }) {
  return (
    <div className="space-y-3 rounded-xl border border-emerald-200/20 bg-emerald-200/10 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-50">
            <CheckCircle2 className="size-4" />
            Verification receipt
          </h3>
          <p className="mt-1 break-all font-mono text-xs text-emerald-100/80">
            {result.verificationId}
          </p>
        </div>
        <Badge className={statusBadgeClass(result.verificationStatus)}>
          {formatStatus(result.verificationStatus)}
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SignalMetric label="Mode" value={`${result.provider} · ${result.mode}`} />
        <SignalMetric label="Cost" value={`${result.verificationCostUSDC} USDC`} />
        <SignalMetric
          label="Impact"
          value={formatSettlementImpact(result.settlementImpact)}
        />
      </div>

      <ResultList items={result.findings} label="Findings" />
      <ResultList items={result.checkedSignals} label="Checked signals" />
      {result.riskFlags.length > 0 && (
        <ResultList items={result.riskFlags} label="Risk flags" />
      )}

      <p className="rounded-lg border border-amber-200/20 bg-amber-200/10 p-2 text-xs leading-5 text-amber-100">
        {result.safetyNotice}
      </p>
    </div>
  );
}

function SignalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ResultList({ items, label }: { items: string[]; label: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <ul className="list-disc space-y-1 pl-4 text-sm leading-5 text-zinc-200">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function saveVerificationLedgerEntry(
  jobId: string,
  result: VerificationView
) {
  saveAgentEconomicAction({
    id: `agent-action-${result.verificationId}`,
    jobId,
    type: "verification_payment",
    amountUSDC: result.verificationCostUSDC,
    status: "prepared",
    createdAt: result.receipt.timestamp,
    description:
      "Testnet/demo verification payment prepared by Juvra Agent. Escrow funds are not controlled by the agent.",
    receipt: {
      ...result.receipt,
      verificationId: result.verificationId,
      verificationStatus: result.verificationStatus,
      checkedSignals: result.checkedSignals,
      findings: result.findings,
      riskFlags: result.riskFlags,
      settlementImpact: result.settlementImpact,
      memo: result.receipt.memo || getNanopaymentMemo(jobId, "evidence-verification"),
    },
  });
}

function buildDeliveryText(
  job: VerificationJob | null | undefined,
  evidence: EvidenceItem[]
) {
  return [
    job?.submissionURI ? `Submission URI: ${job.submissionURI}` : "",
    job?.descriptionURI ? `Description URI: ${job.descriptionURI}` : "",
    job?.description ? `Job description: ${job.description}` : "",
    ...evidence.map((item) =>
      [
        `Evidence type: ${item.type}`,
        item.evidenceUrl ? `URL: ${item.evidenceUrl}` : "",
        item.note ? `Note: ${item.note}` : "",
      ]
        .filter(Boolean)
        .join(" | ")
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function getLocalRiskFlags(
  status: number | undefined,
  evidence: EvidenceItem[]
) {
  const flags: string[] = [];
  const combinedText = evidence
    .map((item) => `${item.evidenceUrl ?? ""} ${item.note ?? ""}`)
    .join(" ")
    .toLowerCase();

  if (evidence.length === 0) {
    flags.push("No evidence attached.");
  }

  if (evidence.length > 0 && !evidence.some((item) => item.evidenceUrl?.trim())) {
    flags.push("Evidence has no URL for external inspection.");
  }

  if (status === 4 || evidence.some((item) => item.type === "dispute")) {
    flags.push("Dispute context present.");
  }

  if (["refund", "scam", "not delivered", "missing"].some((term) => combinedText.includes(term))) {
    flags.push("High-risk delivery language detected.");
  }

  return flags;
}

function jobStatusLabel(status: number | undefined) {
  switch (status) {
    case 0:
      return "Open";
    case 1:
      return "Assigned";
    case 2:
      return "Submitted";
    case 3:
      return "Approved";
    case 4:
      return "Disputed";
    case 5:
      return "Refunded";
    case 6:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

function statusBadgeClass(status: VerificationStatus) {
  switch (status) {
    case "passed":
      return "border-emerald-200/20 bg-emerald-200/10 text-emerald-100";
    case "warning":
      return "border-amber-200/20 bg-amber-200/10 text-amber-100";
    case "failed":
      return "border-rose-300/20 bg-rose-300/10 text-rose-100";
    case "needs_review":
    default:
      return "border-cyan-200/20 bg-cyan-200/10 text-cyan-100";
  }
}

function formatStatus(status: VerificationStatus) {
  return status.replaceAll("_", " ");
}

function formatSettlementImpact(impact: SettlementImpact) {
  return impact.replaceAll("_", " ");
}

function formatActionType(type: AgentEconomicAction["type"]) {
  return type.replaceAll("_", " ");
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
