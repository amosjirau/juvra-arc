"use client";

import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EvidenceItem } from "@/lib/agent/evidence";
import { normalizeRecommendationResult } from "@/lib/agent/schemas";
import {
  clearAgentResult,
  clearAllAgentResults,
  loadAgentResult,
  saveAgentResult,
} from "@/lib/agent/storage";
import type {
  AgentAction,
  AgentRecommendation,
  DeliveryReviewResult,
  DisputeSummaryResult,
  JobRiskAnalysis,
  RiskLevel,
} from "@/lib/agent/agentTypes";
import { getAgentStatusGuidance, getStatusLabel } from "@/lib/job-status";

type AgentMode = "risk" | "delivery" | "dispute" | "recommendation";

type AgentJob = {
  id?: string;
  title?: string;
  description?: string;
  descriptionURI?: string;
  budget?: string;
  amount?: string;
  escrowAmount?: string;
  deadline?: string;
  deliverables?: string[];
  clientAddress?: string;
  client?: string;
  freelancerAddress?: string;
  freelancer?: string;
  status?: number;
  submissionURI?: string;
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
  delivery: "Delivery",
  dispute: "Dispute",
  recommendation: "Recommend",
  risk: "Risk",
};

export default function AgentPanel({
  evidence = [],
  job,
}: {
  evidence?: EvidenceItem[];
  job?: AgentJob | null;
}) {
  const { address } = useAccount();
  const [mode, setMode] = useState<AgentMode>("risk");
  const jobId = job?.id?.toString().trim() || "";
  const [savedAt, setSavedAt] = useState<Partial<Record<AgentMode, string>>>({});

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

  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] =
    useState<AgentRecommendation | null>(null);
  const [recommendationError, setRecommendationError] = useState("");

  const jobTitle = job?.title?.trim() || "Untitled job";
  const jobDescription = job?.description?.trim() || "";
  const jobBudget = job?.budget || job?.amount || job?.escrowAmount;
  const clientAddress = job?.clientAddress || job?.client;
  const freelancerAddress = job?.freelancerAddress || job?.freelancer;
  const expectedDeliverables = job?.deliverables || [];
  const statusGuidance = getAgentStatusGuidance(job?.status);
  const walletRole = getWalletRole(address, clientAddress, freelancerAddress);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedRisk = loadAgentResult<JobRiskAnalysis>("risk", jobId);
    const savedDelivery = loadAgentResult<DeliveryReviewResult>("delivery", jobId);
    const savedDispute = loadAgentResult<DisputeSummaryResult>("dispute", jobId);
    const savedRecommendation = loadAgentResult<AgentRecommendation>(
      "recommendation",
      jobId
    );

    setRiskResult(savedRisk?.result ?? null);
    setRiskDetailsOpen(false);
    setRiskError("");
    setRiskLoading(false);

    setDeliveryText("");
    setDeliveryLink("");
    setDeliveryResult(savedDelivery?.result ?? null);
    setDeliveryDetailsOpen(false);
    setDeliveryError("");
    setDeliveryLoading(false);

    setClientClaim("");
    setFreelancerResponse("");
    setDisputeResult(savedDispute?.result ?? null);
    setDisputeDetailsOpen(false);
    setDisputeError("");
    setDisputeLoading(false);

    setRecommendationResult(
      savedRecommendation?.result
        ? normalizeRecommendationResult(savedRecommendation.result)
        : null
    );
    setRecommendationError("");
    setRecommendationLoading(false);

    setSavedAt({
      delivery: savedDelivery?.createdAt,
      dispute: savedDispute?.createdAt,
      recommendation: savedRecommendation?.createdAt,
      risk: savedRisk?.createdAt,
    });
    setMode(statusGuidance.defaultMode);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [jobId, statusGuidance.defaultMode]);

  function saveRiskResult(result: JobRiskAnalysis) {
    const saved = saveAgentResult("risk", jobId, result);

    setSavedAt((current) => ({ ...current, risk: saved?.createdAt }));
  }

  function saveDeliveryResult(result: DeliveryReviewResult) {
    const saved = saveAgentResult("delivery", jobId, result);

    setSavedAt((current) => ({ ...current, delivery: saved?.createdAt }));
  }

  function saveDisputeResult(result: DisputeSummaryResult) {
    const saved = saveAgentResult("dispute", jobId, result);

    setSavedAt((current) => ({ ...current, dispute: saved?.createdAt }));
  }

  function saveRecommendationResult(result: AgentRecommendation) {
    const saved = saveAgentResult("recommendation", jobId, result);

    setSavedAt((current) => ({
      ...current,
      recommendation: saved?.createdAt,
    }));
  }

  function clearSavedRisk() {
    clearAgentResult("risk", jobId);
    setRiskResult(null);
    setRiskDetailsOpen(false);
    setRiskError("");
    setSavedAt((current) => ({ ...current, risk: undefined }));
  }

  function clearSavedDelivery() {
    clearAgentResult("delivery", jobId);
    setDeliveryResult(null);
    setDeliveryDetailsOpen(false);
    setDeliveryError("");
    setSavedAt((current) => ({ ...current, delivery: undefined }));
  }

  function clearSavedDispute() {
    clearAgentResult("dispute", jobId);
    setDisputeResult(null);
    setDisputeDetailsOpen(false);
    setDisputeError("");
    setSavedAt((current) => ({ ...current, dispute: undefined }));
  }

  function clearSavedRecommendation() {
    clearAgentResult("recommendation", jobId);
    setRecommendationResult(null);
    setRecommendationError("");
    setSavedAt((current) => ({ ...current, recommendation: undefined }));
  }

  function clearAllSavedResultsForJob() {
    clearAllAgentResults(jobId);
    setRiskResult(null);
    setRiskDetailsOpen(false);
    setRiskError("");
    setDeliveryResult(null);
    setDeliveryDetailsOpen(false);
    setDeliveryError("");
    setDisputeResult(null);
    setDisputeDetailsOpen(false);
    setDisputeError("");
    setRecommendationResult(null);
    setRecommendationError("");
    setSavedAt({});
  }

  async function analyzeJob() {
    setRiskLoading(true);
    setRiskError("");
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
      saveRiskResult(result);
    } catch (err) {
      setRiskError(err instanceof Error ? err.message : "Could not analyze job.");
    } finally {
      setRiskLoading(false);
    }
  }

  async function reviewDelivery() {
    const cleanDeliveryText = deliveryText.trim();
    const cleanDeliveryLink = deliveryLink.trim();
    const deliveryEvidence = evidence.filter((item) =>
      ["delivery", "revision"].includes(item.type)
    );

    if (!cleanDeliveryText && deliveryEvidence.length === 0) {
      setDeliveryError("Delivery notes or saved delivery evidence are required.");
      return;
    }

    setDeliveryLoading(true);
    setDeliveryError("");
    setDeliveryDetailsOpen(false);

    try {
      const evidenceSummary = formatEvidenceForAgent(deliveryEvidence);
      const result = await postAgent<DeliveryReviewResult>(
        "/api/agent/review-delivery",
        {
          jobTitle,
          jobDescription,
          expectedDeliverables,
          deliveryText: [cleanDeliveryText, evidenceSummary]
            .filter(Boolean)
            .join("\n\n"),
          deliveryLinks: uniqueStrings([
            cleanDeliveryLink,
            ...deliveryEvidence.map((item) => item.evidenceUrl),
          ]),
          deliveryEvidence: evidenceSummary ? [evidenceSummary] : [],
        }
      );

      setDeliveryResult(result);
      saveDeliveryResult(result);
    } catch (err) {
      setDeliveryError(
        err instanceof Error ? err.message : "Could not review delivery."
      );
    } finally {
      setDeliveryLoading(false);
    }
  }

  async function summarizeDispute() {
    const savedClientClaim = getEvidenceNotesWithPrefix(
      evidence,
      "Client complaint:"
    ).join("\n");
    const savedFreelancerResponse = getEvidenceNotesWithPrefix(
      evidence,
      "Freelancer response:"
    ).join("\n");
    const cleanClientClaim = clientClaim.trim() || savedClientClaim;
    const cleanFreelancerResponse =
      freelancerResponse.trim() || savedFreelancerResponse;

    if (!cleanClientClaim || !cleanFreelancerResponse) {
      setDisputeError("Client claim and freelancer response are required.");
      return;
    }

    setDisputeLoading(true);
    setDisputeError("");
    setDisputeDetailsOpen(false);

    try {
      const disputeEvidence = evidence.filter((item) =>
        ["delivery", "dispute", "revision", "admin"].includes(item.type)
      );
      const result = await postAgent<DisputeSummaryResult>(
        "/api/agent/dispute-summary",
        {
          jobTitle,
          jobDescription,
          clientClaim: cleanClientClaim,
          freelancerResponse: cleanFreelancerResponse,
          deliveryEvidence: formatEvidenceForAgent(disputeEvidence)
            ? [formatEvidenceForAgent(disputeEvidence)]
            : [],
          timeline: buildEvidenceTimeline(disputeEvidence),
        }
      );

      setDisputeResult(result);
      saveDisputeResult(result);
    } catch (err) {
      setDisputeError(
        err instanceof Error ? err.message : "Could not summarize dispute."
      );
    } finally {
      setDisputeLoading(false);
    }
  }

  async function recommendAction() {
    setRecommendationLoading(true);
    setRecommendationError("");

    try {
      const result = await postAgent<AgentRecommendation>(
        "/api/agent/recommend-action",
        {
          job: {
            id: jobId,
            title: jobTitle,
            description: jobDescription,
            budget: jobBudget,
            status: job?.status,
            statusLabel: getStatusLabel(job?.status),
            deadline: job?.deadline,
            submissionURI: job?.submissionURI,
            clientAddress,
            freelancerAddress,
          },
          riskAnalysis: riskResult,
          deliveryReview: deliveryResult,
          disputeSummary: disputeResult,
          evidence,
          walletRole,
        }
      );
      const normalized = normalizeRecommendationResult(result);

      setRecommendationResult(normalized);
      saveRecommendationResult(normalized);
    } catch (err) {
      setRecommendationError(
        err instanceof Error ? err.message : "Could not recommend an action."
      );
    } finally {
      setRecommendationLoading(false);
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
              {statusGuidance.guidance}
            </p>
          </div>
          <Badge className="h-5 shrink-0 border-cyan-200/20 bg-cyan-200/10 px-1.5 text-[0.62rem] text-cyan-100">
            {statusGuidance.title}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-white/[0.035] p-1 sm:grid-cols-4">
          {(["risk", "delivery", "dispute", "recommendation"] as const).map((item) => (
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
            onClearSaved={clearSavedRisk}
            onToggleDetails={() => setRiskDetailsOpen((open) => !open)}
            result={riskResult}
            savedAt={savedAt.risk}
          />
        )}

        {mode === "delivery" && (
          <DeliveryMode
            deliveryLink={deliveryLink}
            deliveryText={deliveryText}
            detailsOpen={deliveryDetailsOpen}
            error={deliveryError}
            loading={deliveryLoading}
            onClearSaved={clearSavedDelivery}
            onDeliveryLinkChange={setDeliveryLink}
            onDeliveryTextChange={setDeliveryText}
            onReview={reviewDelivery}
            onToggleDetails={() => setDeliveryDetailsOpen((open) => !open)}
            result={deliveryResult}
            savedAt={savedAt.delivery}
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
            onClearSaved={clearSavedDispute}
            onFreelancerResponseChange={setFreelancerResponse}
            onSummarize={summarizeDispute}
            onToggleDetails={() => setDisputeDetailsOpen((open) => !open)}
            result={disputeResult}
            savedAt={savedAt.dispute}
          />
        )}

        {mode === "recommendation" && (
          <RecommendationMode
            error={recommendationError}
            loading={recommendationLoading}
            onClearSaved={clearSavedRecommendation}
            onRecommend={recommendAction}
            result={recommendationResult}
            savedAt={savedAt.recommendation}
          />
        )}

        <p className="rounded-md border border-amber-200/20 bg-amber-200/10 p-2 text-[0.66rem] leading-4 text-amber-100">
          Decision support only. The agent cannot release or refund funds.
        </p>

        <Button
          className="h-8 w-full border-rose-300/20 bg-rose-300/5 px-2 text-[0.68rem] text-rose-100 hover:bg-rose-300/10"
          disabled={
            !jobId ||
            (!riskResult &&
              !deliveryResult &&
              !disputeResult &&
              !recommendationResult)
          }
          onClick={clearAllSavedResultsForJob}
          size="sm"
          type="button"
          variant="outline"
        >
          <Trash2 className="size-3.5" />
          Clear all saved agent results for this job
        </Button>
      </div>
    </div>
  );
}

function RiskMode({
  detailsOpen,
  error,
  loading,
  onAnalyze,
  onClearSaved,
  onToggleDetails,
  result,
  savedAt,
}: {
  detailsOpen: boolean;
  error: string;
  loading: boolean;
  onAnalyze: () => void;
  onClearSaved: () => void;
  onToggleDetails: () => void;
  result: JobRiskAnalysis | null;
  savedAt?: string;
}) {
  return (
    <div className="space-y-2">
      <ActionRow
        clearLabel="Clear saved risk"
        loading={loading}
        onClearSaved={result ? onClearSaved : undefined}
        savedAt={savedAt}
      >
        <Button
          className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
          disabled={loading}
          onClick={onAnalyze}
          size="sm"
          type="button"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading ? "Analyzing..." : result ? "Re-run risk analysis" : "Analyze job risk"}
        </Button>
      </ActionRow>

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
  onClearSaved,
  onDeliveryLinkChange,
  onDeliveryTextChange,
  onReview,
  onToggleDetails,
  result,
  savedAt,
}: {
  deliveryLink: string;
  deliveryText: string;
  detailsOpen: boolean;
  error: string;
  loading: boolean;
  onClearSaved: () => void;
  onDeliveryLinkChange: (value: string) => void;
  onDeliveryTextChange: (value: string) => void;
  onReview: () => void;
  onToggleDetails: () => void;
  result: DeliveryReviewResult | null;
  savedAt?: string;
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
      <ActionRow
        clearLabel="Clear saved delivery review"
        loading={loading}
        onClearSaved={result ? onClearSaved : undefined}
        savedAt={savedAt}
      >
        <Button
          className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
          disabled={loading}
          onClick={onReview}
          size="sm"
          type="button"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading ? "Reviewing..." : result ? "Re-run delivery review" : "Review delivery"}
        </Button>
      </ActionRow>

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
  onClearSaved,
  onFreelancerResponseChange,
  onSummarize,
  onToggleDetails,
  result,
  savedAt,
}: {
  clientClaim: string;
  detailsOpen: boolean;
  error: string;
  freelancerResponse: string;
  loading: boolean;
  onClientClaimChange: (value: string) => void;
  onClearSaved: () => void;
  onFreelancerResponseChange: (value: string) => void;
  onSummarize: () => void;
  onToggleDetails: () => void;
  result: DisputeSummaryResult | null;
  savedAt?: string;
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
      <ActionRow
        clearLabel="Clear saved dispute summary"
        loading={loading}
        onClearSaved={result ? onClearSaved : undefined}
        savedAt={savedAt}
      >
        <Button
          className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
          disabled={loading}
          onClick={onSummarize}
          size="sm"
          type="button"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading ? "Summarizing..." : result ? "Re-run dispute summary" : "Summarize dispute"}
        </Button>
      </ActionRow>

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

function RecommendationMode({
  error,
  loading,
  onClearSaved,
  onRecommend,
  result,
  savedAt,
}: {
  error: string;
  loading: boolean;
  onClearSaved: () => void;
  onRecommend: () => void;
  result: AgentRecommendation | null;
  savedAt?: string;
}) {
  return (
    <div className="space-y-2">
      <ActionRow
        clearLabel="Clear saved recommendation"
        loading={loading}
        onClearSaved={result ? onClearSaved : undefined}
        savedAt={savedAt}
      >
        <Button
          className="h-8 w-full bg-gradient-to-r from-cyan-300 to-sky-400 px-3 text-[0.72rem] text-slate-950 hover:from-cyan-200 hover:to-sky-300 sm:w-fit"
          disabled={loading}
          onClick={onRecommend}
          size="sm"
          type="button"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading
            ? "Recommending..."
            : result
              ? "Re-run recommendation"
              : "Recommend action"}
        </Button>
      </ActionRow>

      {error && <ErrorMessage message={error} />}

      {result ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <CompactMetric
              label="Suggested"
              value={formatAgentAction(result.suggestedAction)}
            />
            <CompactMetric
              label="Confidence"
              value={formatConfidence(result.confidence)}
            />
          </div>
          <GuidanceLabel />
          <ResultBlock label="Reasoning" value={result.reasoning} />
          <ResultBlock
            label="Required human action"
            value={result.requiredHumanAction}
          />
          <ResultBlock label="Safety notice" value={result.safetyNotice} />
        </div>
      ) : (
        <p className="rounded-md border border-white/10 bg-white/[0.035] p-2 text-[0.72rem] leading-4 text-zinc-400">
          Uses the job status, deadline, submission URI, connected wallet role,
          saved agent results, and local evidence. It never triggers a contract write.
        </p>
      )}
    </div>
  );
}

function ActionRow({
  children,
  clearLabel,
  loading,
  onClearSaved,
  savedAt,
}: {
  children: ReactNode;
  clearLabel: string;
  loading: boolean;
  onClearSaved?: () => void;
  savedAt?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onClearSaved && (
          <Button
            className="h-8 px-2 text-[0.68rem] text-zinc-300 hover:text-white"
            disabled={loading}
            onClick={onClearSaved}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
            {clearLabel}
          </Button>
        )}
      </div>
      {savedAt && (
        <span
          className="w-fit rounded-full border border-emerald-200/15 bg-emerald-200/10 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-100"
          title={formatSavedTimestamp(savedAt)}
        >
          Saved result • last updated {formatSavedInlineDate(savedAt)}
        </span>
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
    escalate_admin: "Escalate to admin",
    no_action: "No action needed",
    refund_client: "Refund client",
    release_full: "Release full payment",
    release_partial: "Release partial payment",
    request_revision: "Request revision",
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

function formatSavedTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Saved result";
  }

  return `Saved ${date.toLocaleString()}`;
}

function formatSavedInlineDate(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getWalletRole(
  address?: string,
  clientAddress?: string,
  freelancerAddress?: string
) {
  const wallet = address?.toLowerCase();

  if (!wallet) {
    return "not_connected";
  }

  if (clientAddress && wallet === clientAddress.toLowerCase()) {
    return "client";
  }

  if (freelancerAddress && wallet === freelancerAddress.toLowerCase()) {
    return "freelancer";
  }

  return "viewer";
}

function formatEvidenceForAgent(items: EvidenceItem[]) {
  return items
    .map((item) => {
      const parts = [
        `${item.type} evidence`,
        item.evidenceUrl ? `url: ${item.evidenceUrl}` : "",
        item.note ? `note: ${item.note}` : "",
        item.submittedBy ? `submittedBy: ${item.submittedBy}` : "",
        `createdAt: ${item.createdAt}`,
      ].filter(Boolean);

      return parts.join(" | ");
    })
    .join("\n");
}

function buildEvidenceTimeline(items: EvidenceItem[]) {
  return items.map((item) => `${item.createdAt}: ${item.type} evidence added`);
}

function uniqueStrings(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

function getEvidenceNotesWithPrefix(items: EvidenceItem[], prefix: string) {
  return items
    .map((item) => item.note?.trim())
    .filter((note): note is string => Boolean(note?.startsWith(prefix)))
    .map((note) => note.slice(prefix.length).trim())
    .filter(Boolean);
}

function riskTextClass(riskLevel: RiskLevel) {
  const classes = {
    low: "text-emerald-100",
    medium: "text-amber-100",
    high: "text-rose-100",
  } as const;

  return classes[riskLevel];
}
