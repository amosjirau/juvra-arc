"use client";

import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgentAction,
  DeliveryReviewResult,
  DisputeSummaryResult,
  JobRiskAnalysis,
  RiskLevel,
} from "@/lib/agent/agentTypes";

type AgentMode = "risk" | "delivery" | "dispute";

type AgentJob = {
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

const modeLabels: Record<AgentMode, string> = {
  risk: "Risk",
  delivery: "Delivery",
  dispute: "Dispute",
};

export default function AgentPanel({ job }: { job?: AgentJob | null }) {
  const [mode, setMode] = useState<AgentMode>("risk");

  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<JobRiskAnalysis | null>(null);
  const [riskDetailsOpen, setRiskDetailsOpen] = useState(false);
  const [riskError, setRiskError] = useState("");

  const [deliveryText, setDeliveryText] = useState("");
  const [deliveryLink, setDeliveryLink] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] =
    useState<DeliveryReviewResult | null>(null);
  const [deliveryDetailsOpen, setDeliveryDetailsOpen] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const [clientClaim, setClientClaim] = useState("");
  const [freelancerResponse, setFreelancerResponse] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeResult, setDisputeResult] =
    useState<DisputeSummaryResult | null>(null);
  const [disputeDetailsOpen, setDisputeDetailsOpen] = useState(false);
  const [disputeError, setDisputeError] = useState("");

  const jobTitle = job?.title?.trim() || "Untitled job";
  const jobDescription = job?.description?.trim() || "";
  const jobBudget = job?.budget || job?.amount || job?.escrowAmount;
  const clientAddress = job?.clientAddress || job?.client;
  const freelancerAddress = job?.freelancerAddress || job?.freelancer;
  const expectedDeliverables = job?.deliverables || [];

  async function analyzeJob() {
    setRiskLoading(true);
    setRiskError("");
    setRiskResult(null);
    setRiskDetailsOpen(false);

    try {
      const result = await postAgent<JobRiskAnalysis>("/api/agent/analyze-job", {
        title: jobTitle,
        description: jobDescription,
        budget: jobBudget,
        deadline: job?.deadline,
        deliverables: expectedDeliverables,
        clientAddress,
        freelancerAddress,
      });

      setRiskResult(result);
    } catch (err) {
      setRiskError(err instanceof Error ? err.message : "Could not analyze job.");
    } finally {
      setRiskLoading(false);
    }
  }

  async function reviewDelivery() {
    const cleanDeliveryText = deliveryText.trim();
    const cleanDeliveryLink = deliveryLink.trim();

    if (!cleanDeliveryText) {
      setDeliveryError("Delivery notes are required.");
      return;
    }

    setDeliveryLoading(true);
    setDeliveryError("");
    setDeliveryResult(null);
    setDeliveryDetailsOpen(false);

    try {
      const result = await postAgent<DeliveryReviewResult>(
        "/api/agent/review-delivery",
        {
          jobTitle,
          jobDescription,
          expectedDeliverables,
          deliveryText: cleanDeliveryText,
          deliveryLinks: cleanDeliveryLink ? [cleanDeliveryLink] : [],
        }
      );

      setDeliveryResult(result);
    } catch (err) {
      setDeliveryError(
        err instanceof Error ? err.message : "Could not review delivery."
      );
    } finally {
      setDeliveryLoading(false);
    }
  }

  async function summarizeDispute() {
    const cleanClientClaim = clientClaim.trim();
    const cleanFreelancerResponse = freelancerResponse.trim();

    if (!cleanClientClaim || !cleanFreelancerResponse) {
      setDisputeError("Client claim and freelancer response are required.");
      return;
    }

    setDisputeLoading(true);
    setDisputeError("");
    setDisputeResult(null);
    setDisputeDetailsOpen(false);

    try {
      const result = await postAgent<DisputeSummaryResult>(
        "/api/agent/dispute-summary",
        {
          jobTitle,
          jobDescription,
          clientClaim: cleanClientClaim,
          freelancerResponse: cleanFreelancerResponse,
          deliveryEvidence: [],
          timeline: [],
        }
      );

      setDisputeResult(result);
    } catch (err) {
      setDisputeError(
        err instanceof Error ? err.message : "Could not summarize dispute."
      );
    } finally {
      setDisputeLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-cyan-200/10 bg-black/25 p-2.5 shadow-inner shadow-black/10">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-cyan-100/70">
              <Bot className="size-3.5" />
              Escrow Intelligence
            </div>
            <h3 className="font-display mt-1 text-base font-semibold text-white">
              Juvra Agent
            </h3>
            <p className="mt-0.5 max-w-2xl text-[0.72rem] leading-4 text-zinc-400">
              Job clarity and dispute-risk analysis for human review.
            </p>
          </div>
          <Badge className="h-5 shrink-0 border-cyan-200/20 bg-cyan-200/10 px-1.5 text-[0.62rem] text-cyan-100">
            Decision support
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-md border border-white/10 bg-white/[0.035] p-1">
          {(["risk", "delivery", "dispute"] as const).map((item) => (
            <button
              className={`rounded px-2 py-1 text-[0.68rem] font-medium transition ${
                mode === item
                  ? "bg-cyan-200/15 text-cyan-100"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
              key={item}
              onClick={() => setMode(item)}
              type="button"
            >
              {modeLabels[item]}
            </button>
          ))}
        </div>

        {mode === "risk" && (
          <RiskMode
            detailsOpen={riskDetailsOpen}
            error={riskError}
            loading={riskLoading}
            onAnalyze={analyzeJob}
            onToggleDetails={() => setRiskDetailsOpen((open) => !open)}
            result={riskResult}
          />
        )}

        {mode === "delivery" && (
          <DeliveryMode
            deliveryLink={deliveryLink}
            deliveryText={deliveryText}
            detailsOpen={deliveryDetailsOpen}
            error={deliveryError}
            loading={deliveryLoading}
            onDeliveryLinkChange={setDeliveryLink}
            onDeliveryTextChange={setDeliveryText}
            onReview={reviewDelivery}
            onToggleDetails={() => setDeliveryDetailsOpen((open) => !open)}
            result={deliveryResult}
          />
        )}

        {mode === "dispute" && (
          <DisputeMode
            clientClaim={clientClaim}
            detailsOpen={disputeDetailsOpen}
            error={disputeError}
            freelancerResponse={freelancerResponse}
            loading={disputeLoading}
            onClientClaimChange={setClientClaim}
            onFreelancerResponseChange={setFreelancerResponse}
            onSummarize={summarizeDispute}
            onToggleDetails={() => setDisputeDetailsOpen((open) => !open)}
            result={disputeResult}
          />
        )}

        <p className="rounded-md border border-amber-200/20 bg-amber-200/10 p-2 text-[0.66rem] leading-4 text-amber-100">
          Decision support only. The agent cannot release or refund funds.
        </p>
      </div>
    </div>
  );
}

function RiskMode({
  detailsOpen,
  error,
  loading,
  onAnalyze,
  onToggleDetails,
  result,
}: {
  detailsOpen: boolean;
  error: string;
  loading: boolean;
  onAnalyze: () => void;
  onToggleDetails: () => void;
  result: JobRiskAnalysis | null;
}) {
  return (
    <div className="space-y-2">
      <Button
        className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
        disabled={loading}
        onClick={onAnalyze}
        size="sm"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loading ? "Analyzing..." : result ? "Re-analyze risk" : "Analyze job risk"}
      </Button>

      {error && <ErrorMessage message={error} />}

      {result && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <CompactMetric
              label="Risk"
              value={capitalize(result.riskLevel)}
              valueClassName={riskTextClass(result.riskLevel)}
            />
            <CompactMetric label="Clarity" value={`${result.clarityScore}/100`} />
          </div>
          <ResultBlock label="Summary" value={result.summary} />
          <DetailsToggle
            isOpen={detailsOpen}
            onToggle={onToggleDetails}
          />
          {detailsOpen && (
            <div className="space-y-2">
              <ResultList
                emptyText="No detected issues."
                items={result.issues}
                label="Detected issues"
              />
              <ResultList
                emptyText="No suggested fixes."
                items={result.suggestedFixes}
                label="Suggested fixes"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeliveryMode({
  deliveryLink,
  deliveryText,
  detailsOpen,
  error,
  loading,
  onDeliveryLinkChange,
  onDeliveryTextChange,
  onReview,
  onToggleDetails,
  result,
}: {
  deliveryLink: string;
  deliveryText: string;
  detailsOpen: boolean;
  error: string;
  loading: boolean;
  onDeliveryLinkChange: (value: string) => void;
  onDeliveryTextChange: (value: string) => void;
  onReview: () => void;
  onToggleDetails: () => void;
  result: DeliveryReviewResult | null;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        className="min-h-[52px] resize-y rounded-md px-2 py-1.5 text-xs leading-4 md:text-xs"
        onChange={(event) => onDeliveryTextChange(event.target.value)}
        placeholder="Delivery notes"
        value={deliveryText}
      />
      <Input
        className="h-8 rounded-md px-2 text-xs md:text-xs"
        onChange={(event) => onDeliveryLinkChange(event.target.value)}
        placeholder="Optional delivery link"
        value={deliveryLink}
      />
      <Button
        className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
        disabled={loading}
        onClick={onReview}
        size="sm"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loading ? "Reviewing..." : "Review delivery"}
      </Button>

      {error && <ErrorMessage message={error} />}

      {result && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <CompactMetric
              label="Completion"
              value={`${result.completionScore}/100`}
            />
            <CompactMetric
              label="Recommendation"
              value={formatAgentAction(result.recommendation)}
            />
          </div>
          <GuidanceLabel />
          <ResultBlock label="Reasoning" value={result.reasoning} />
          <DetailsToggle
            isOpen={detailsOpen}
            onToggle={onToggleDetails}
          />
          {detailsOpen && (
            <div className="space-y-2">
              <ResultList
                emptyText="No matched requirements."
                items={result.matchedRequirements}
                label="Matched requirements"
              />
              <ResultList
                emptyText="No missing items."
                items={result.missingItems}
                label="Missing items"
              />
              <ResultList
                emptyText="No concerns."
                items={result.concerns}
                label="Concerns"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DisputeMode({
  clientClaim,
  detailsOpen,
  error,
  freelancerResponse,
  loading,
  onClientClaimChange,
  onFreelancerResponseChange,
  onSummarize,
  onToggleDetails,
  result,
}: {
  clientClaim: string;
  detailsOpen: boolean;
  error: string;
  freelancerResponse: string;
  loading: boolean;
  onClientClaimChange: (value: string) => void;
  onFreelancerResponseChange: (value: string) => void;
  onSummarize: () => void;
  onToggleDetails: () => void;
  result: DisputeSummaryResult | null;
}) {
  return (
    <div className="space-y-2">
      <Textarea
        className="min-h-[48px] resize-y rounded-md px-2 py-1.5 text-xs leading-4 md:text-xs"
        onChange={(event) => onClientClaimChange(event.target.value)}
        placeholder="Client claim"
        value={clientClaim}
      />
      <Textarea
        className="min-h-[48px] resize-y rounded-md px-2 py-1.5 text-xs leading-4 md:text-xs"
        onChange={(event) => onFreelancerResponseChange(event.target.value)}
        placeholder="Freelancer response"
        value={freelancerResponse}
      />
      <Button
        className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
        disabled={loading}
        onClick={onSummarize}
        size="sm"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loading ? "Summarizing..." : "Summarize dispute"}
      </Button>

      {error && <ErrorMessage message={error} />}

      {result && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <CompactMetric
              label="Resolution"
              value={formatAgentAction(result.recommendedResolution)}
            />
            <CompactMetric
              label="Confidence"
              value={formatConfidence(result.confidence)}
            />
          </div>
          <GuidanceLabel />
          <ResultBlock label="Summary" value={result.summary} />
          <DetailsToggle
            isOpen={detailsOpen}
            onToggle={onToggleDetails}
          />
          {detailsOpen && (
            <div className="space-y-2">
              <ResultBlock label="Client position" value={result.clientPosition} />
              <ResultBlock
                label="Freelancer position"
                value={result.freelancerPosition}
              />
              <ResultList
                emptyText="No key evidence provided."
                items={result.keyEvidence}
                label="Key evidence"
              />
              <ResultList
                emptyText="No unresolved questions."
                items={result.unresolvedQuestions}
                label="Unresolved questions"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailsToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      className="h-7 px-2 text-[0.68rem] text-zinc-300 hover:text-white"
      onClick={onToggle}
      size="sm"
      type="button"
      variant="ghost"
    >
      {isOpen ? (
        <ChevronUp className="size-3.5" />
      ) : (
        <ChevronDown className="size-3.5" />
      )}
      {isOpen ? "Hide details" : "View details"}
    </Button>
  );
}

function GuidanceLabel() {
  return (
    <p className="text-[0.64rem] font-medium uppercase tracking-[0.14em] text-amber-100/80">
      Agent guidance only
    </p>
  );
}

function formatAgentAction(action: AgentAction) {
  const labels: Record<AgentAction, string> = {
    release_full: "Release full payment",
    release_partial: "Release partial payment",
    request_revision: "Request revision",
    refund_client: "Refund client",
    escalate_admin: "Escalate to admin",
  };

  return labels[action];
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex gap-2 rounded-md border border-rose-300/20 bg-rose-300/10 p-2 text-[0.72rem] text-rose-100">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-2 py-1.5">
      <p className="text-[0.62rem] text-zinc-500">{label}</p>
      <p
        className={`font-display mt-0.5 break-words text-sm font-semibold leading-4 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-2">
      <p className="text-[0.62rem] text-zinc-500">{label}</p>
      <p className="mt-1 text-[0.72rem] leading-4 text-zinc-200">{value}</p>
    </div>
  );
}

function ResultList({
  emptyText,
  items,
  label,
}: {
  emptyText: string;
  items: string[];
  label: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-2">
      <p className="text-[0.62rem] text-zinc-500">{label}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-[0.72rem] leading-4 text-zinc-200">
          {items.map((item) => (
            <li className="flex gap-2" key={item}>
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-cyan-200" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[0.72rem] leading-4 text-zinc-400">
          {emptyText}
        </p>
      )}
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

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function riskTextClass(riskLevel: RiskLevel) {
  const classes = {
    low: "text-emerald-100",
    medium: "text-amber-100",
    high: "text-rose-100",
  } as const;

  return classes[riskLevel];
}
