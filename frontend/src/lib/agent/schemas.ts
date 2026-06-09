import {
  AgentAction,
  DeliveryReviewInput,
  DisputeSummaryInput,
  AgentRecommendation,
  JobAnalysisInput,
} from "./agentTypes";

export function validateJobAnalysisInput(data: unknown): JobAnalysisInput {
  if (!isRecord(data)) {
    throw new Error("Request body must be a JSON object.");
  }

  if (!data.title || typeof data.title !== "string") {
    throw new Error("Job title is required.");
  }

  if (!data.description || typeof data.description !== "string") {
    throw new Error("Job description is required.");
  }

  return {
    jobId: asOptionalString(data.jobId),
    title: data.title,
    description: data.description,
    budget: asOptionalString(data.budget),
    deadline: asOptionalString(data.deadline),
    deliverables: asStringArray(data.deliverables),
    clientAddress: asOptionalString(data.clientAddress),
    freelancerAddress: asOptionalString(data.freelancerAddress),
  };
}

export function validateDeliveryReviewInput(data: unknown): DeliveryReviewInput {
  if (!isRecord(data)) {
    throw new Error("Request body must be a JSON object.");
  }

  if (!data.jobTitle || typeof data.jobTitle !== "string") {
    throw new Error("Job title is required.");
  }

  if (!data.jobDescription || typeof data.jobDescription !== "string") {
    throw new Error("Job description is required.");
  }

  if (!data.deliveryText || typeof data.deliveryText !== "string") {
    throw new Error("Delivery text is required.");
  }

  return {
    jobTitle: data.jobTitle,
    jobDescription: data.jobDescription,
    expectedDeliverables: asStringArray(data.expectedDeliverables),
    deliveryText: data.deliveryText,
    deliveryLinks: asStringArray(data.deliveryLinks),
    deliveryEvidence: asStringArray(data.deliveryEvidence),
  };
}

export function validateDisputeSummaryInput(data: unknown): DisputeSummaryInput {
  if (!isRecord(data)) {
    throw new Error("Request body must be a JSON object.");
  }

  if (!data.jobTitle || typeof data.jobTitle !== "string") {
    throw new Error("Job title is required.");
  }

  if (!data.jobDescription || typeof data.jobDescription !== "string") {
    throw new Error("Job description is required.");
  }

  if (!data.clientClaim || typeof data.clientClaim !== "string") {
    throw new Error("Client claim is required.");
  }

  if (
    !data.freelancerResponse ||
    typeof data.freelancerResponse !== "string"
  ) {
    throw new Error("Freelancer response is required.");
  }

  return {
    jobTitle: data.jobTitle,
    jobDescription: data.jobDescription,
    clientClaim: data.clientClaim,
    freelancerResponse: data.freelancerResponse,
    deliveryEvidence: asStringArray(data.deliveryEvidence),
    timeline: asStringArray(data.timeline),
  };
}

export function validateRecommendationInput(data: unknown) {
  if (!isRecord(data)) {
    throw new Error("Request body must be a JSON object.");
  }

  return {
    job: isRecord(data.job) ? data.job : {},
    riskAnalysis: isRecord(data.riskAnalysis) ? data.riskAnalysis : undefined,
    deliveryReview: isRecord(data.deliveryReview)
      ? data.deliveryReview
      : undefined,
    disputeSummary: isRecord(data.disputeSummary)
      ? data.disputeSummary
      : undefined,
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
    walletRole: asOptionalString(data.walletRole),
    legacyContext: {
      riskLevel: asOptionalString(data.riskLevel),
      completionScore:
        typeof data.completionScore === "number"
          ? data.completionScore
          : undefined,
      disputeRaised:
        typeof data.disputeRaised === "boolean" ? data.disputeRaised : undefined,
    },
  };
}

export function normalizeRecommendationResult(
  result: unknown
): AgentRecommendation {
  if (!isRecord(result)) {
    throw new Error("Recommendation result must be a JSON object.");
  }

  const rawAction = result.suggestedAction ?? result.recommendation;
  const suggestedAction =
    typeof rawAction === "string" && isAgentAction(rawAction)
      ? rawAction
      : "no_action";

  return {
    suggestedAction,
    confidence:
      typeof result.confidence === "number"
        ? Math.max(0, Math.min(1, result.confidence))
        : 0.5,
    reasoning:
      typeof result.reasoning === "string"
        ? result.reasoning
        : "The agent could not produce detailed reasoning. Treat this as advisory only.",
    requiredHumanAction:
      typeof result.requiredHumanAction === "string"
        ? result.requiredHumanAction
        : "A human must review the job and confirm any escrow action manually.",
    safetyNotice:
      typeof result.safetyNotice === "string"
        ? result.safetyNotice
        : "Juvra Agent is advisory only and cannot release, refund, sign, or resolve escrow.",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isAgentAction(value: string): value is AgentAction {
  return [
    "release_full",
    "release_partial",
    "request_revision",
    "refund_client",
    "escalate_admin",
    "no_action",
  ].includes(value);
}
