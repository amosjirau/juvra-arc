import type {
  AgentRecommendation,
  DeliveryReviewResult,
  DisputeSummaryResult,
  JobRiskAnalysis,
} from "@/lib/agent/agentTypes";
import type { EvidenceItem } from "@/lib/agent/evidence";

export type AgentFlagType =
  | "vague_scope"
  | "missing_deadline"
  | "overdue_job"
  | "submitted_without_evidence"
  | "dispute_needs_admin"
  | "delivery_ready_for_review"
  | "high_risk_escrow"
  | "stale_submission";

export type AgentFlag = {
  type: AgentFlagType;
  label: string;
  detail: string;
  severity: "info" | "warning" | "critical";
};

export type FlagJob = {
  createdAt?: number;
  deadline?: number;
  descriptionURI?: string;
  status?: number;
  submissionURI?: string;
  title?: string;
};

export function getAgentFlags({
  deliveryReview,
  disputeSummary,
  evidence = [],
  job,
  now = Date.now(),
  recommendation,
  riskAnalysis,
}: {
  deliveryReview?: DeliveryReviewResult | null;
  disputeSummary?: DisputeSummaryResult | null;
  evidence?: EvidenceItem[];
  job: FlagJob;
  now?: number;
  recommendation?: AgentRecommendation | null;
  riskAnalysis?: JobRiskAnalysis | null;
}) {
  const flags: AgentFlag[] = [];
  const deadlineMs = job.deadline ? job.deadline * 1000 : 0;
  const hasEvidence = evidence.length > 0;
  const hasDeliveryEvidence = evidence.some((item) => item.type === "delivery");
  const scopeText = `${job.title ?? ""} ${job.descriptionURI ?? ""}`.trim();

  if (
    riskAnalysis?.clarityScore !== undefined
      ? riskAnalysis.clarityScore < 45
      : scopeText.length < 24
  ) {
    flags.push({
      type: "vague_scope",
      label: "Vague scope",
      detail: "The job may need clearer deliverables or acceptance criteria.",
      severity: "warning",
    });
  }

  if (!job.deadline || job.deadline <= 0) {
    flags.push({
      type: "missing_deadline",
      label: "Missing deadline",
      detail: "No reliable deadline is available for this escrow.",
      severity: "warning",
    });
  }

  if (deadlineMs > 0 && now > deadlineMs && [0, 1, 2].includes(job.status ?? -1)) {
    flags.push({
      type: "overdue_job",
      label: "Overdue job",
      detail: "The deadline has passed while the escrow is still active.",
      severity: "critical",
    });
  }

  if (job.status === 2 && job.submissionURI && !hasDeliveryEvidence) {
    flags.push({
      type: "submitted_without_evidence",
      label: "Submitted without local evidence",
      detail: "Work is submitted, but no local delivery evidence has been saved.",
      severity: "warning",
    });
  }

  if (
    job.status === 4 ||
    disputeSummary?.recommendedResolution === "escalate_admin" ||
    recommendation?.suggestedAction === "escalate_admin"
  ) {
    flags.push({
      type: "dispute_needs_admin",
      label: "Admin review needed",
      detail: "A human arbitrator should review the dispute and saved evidence.",
      severity: "critical",
    });
  }

  if (
    job.status === 2 &&
    (deliveryReview?.completionScore ?? 0) >= 80 &&
    job.submissionURI
  ) {
    flags.push({
      type: "delivery_ready_for_review",
      label: "Delivery ready for review",
      detail: "The delivery review suggests the client can manually inspect the work.",
      severity: "info",
    });
  }

  if (riskAnalysis?.riskLevel === "high") {
    flags.push({
      type: "high_risk_escrow",
      label: "High-risk escrow",
      detail: "The risk analysis marked this job as high risk.",
      severity: "critical",
    });
  }

  if (job.status === 2 && job.submissionURI && deadlineMs > 0) {
    const staleAfterMs = 3 * 24 * 60 * 60 * 1000;

    if (now - Math.max(deadlineMs, (job.createdAt ?? 0) * 1000) > staleAfterMs && hasEvidence) {
      flags.push({
        type: "stale_submission",
        label: "Stale submission",
        detail: "A submitted job has been waiting several days with saved evidence.",
        severity: "warning",
      });
    }
  }

  return dedupeFlags(flags);
}

function dedupeFlags(flags: AgentFlag[]) {
  return flags.filter(
    (flag, index, all) =>
      all.findIndex((candidate) => candidate.type === flag.type) === index
  );
}
