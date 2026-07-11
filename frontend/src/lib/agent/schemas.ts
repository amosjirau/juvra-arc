import {
  AgentAction,
  AgentVerificationInput,
  AgentVerificationResult,
  DeliveryReviewInput,
  DisputeSummaryInput,
  AgentRecommendation,
  JobAnalysisInput,
  SettlementImpact,
  ScopeBuilderInput,
  ScopeBuilderResult,
  VerificationStatus,
} from "./agentTypes";
import type { EvidenceItem, EvidenceType } from "./evidence";

export const VERIFICATION_SAFETY_NOTICE =
  "Verification is advisory only. Escrow actions require manual wallet confirmation.";

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

export function validateScopeBuilderInput(data: unknown): ScopeBuilderInput {
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
    category: asOptionalString(data.category),
    budget: asOptionalString(data.budget),
    deadline: asOptionalString(data.deadline),
    status: typeof data.status === "number" ? data.status : undefined,
    submissionURI: asOptionalString(data.submissionURI),
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
  };
}

export function validateAgentVerificationInput(
  data: unknown
): AgentVerificationInput {
  if (!isRecord(data)) {
    throw new Error("Request body must be a JSON object.");
  }

  if (!data.jobId || typeof data.jobId !== "string") {
    throw new Error("Job ID is required.");
  }

  if (!data.jobTitle || typeof data.jobTitle !== "string") {
    throw new Error("Job title is required.");
  }

  if (typeof data.deliveryText !== "string") {
    throw new Error("Delivery text is required.");
  }

  return {
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    deliveryText: data.deliveryText,
    evidenceItems: asEvidenceItems(data.evidenceItems),
    verificationBudgetUSDC: asOptionalString(data.verificationBudgetUSDC),
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
        : "Juvra Agent settles escrow only along a party-recorded on-chain verdict; it cannot choose recipients, sign for users, or resolve disputes.",
  };
}

export function normalizeScopeBuilderResult(
  result: unknown
): ScopeBuilderResult {
  if (!isRecord(result)) {
    throw new Error("Scope builder result must be a JSON object.");
  }

  return {
    suggestedMilestones: withFallbackStrings(
      result.suggestedMilestones,
      ["Discovery and scope confirmation", "Build and delivery", "Final review"]
    ),
    acceptanceCriteria: withFallbackStrings(result.acceptanceCriteria, [
      "Client and freelancer agree on visible completion criteria before work begins.",
    ]),
    deliveryRequirements: withFallbackStrings(result.deliveryRequirements, [
      "Delivery includes links, notes, and evidence needed for client review.",
    ]),
    revisionTerms: withFallbackStrings(result.revisionTerms, [
      "One revision cycle should clarify missing or incomplete deliverables before any dispute escalation.",
    ]),
    riskNotes: withFallbackStrings(result.riskNotes, [
      "Ambiguous scope can increase dispute risk; confirm milestones manually before funding or release.",
    ]),
    suggestedEscrowStructure:
      typeof result.suggestedEscrowStructure === "string"
        ? result.suggestedEscrowStructure
        : "Split escrow across scope confirmation, implementation, and final review milestones.",
    reasoning:
      typeof result.reasoning === "string"
        ? result.reasoning
        : "The agent generated a conservative milestone structure from the available job context.",
    safetyNotice:
      typeof result.safetyNotice === "string"
        ? result.safetyNotice
        : "These suggestions do not modify escrow. Client and freelancer must agree manually before any wallet-confirmed action.",
  };
}

export function normalizeAgentVerificationResult(
  result: unknown,
  input?: AgentVerificationInput
): AgentVerificationResult {
  if (!isRecord(result)) {
    throw new Error("Verification result must be a JSON object.");
  }

  const receipt = isRecord(result.receipt) ? result.receipt : {};
  // The USDC verification cost is bound to the deterministic nanopayment policy
  // budget supplied by the caller, NOT to an arbitrary number a live model may
  // invent. Budget wins when present; otherwise we use the model's value, then a
  // safe default. This keeps live receipts consistent with the UI cost estimate.
  const budgetCost = toUSDCAmount(input?.verificationBudgetUSDC);
  const modelCost = toUSDCAmount(
    typeof result.verificationCostUSDC === "string"
      ? result.verificationCostUSDC
      : receipt.costUSDC
  );
  const costUSDC =
    budgetCost ?? modelCost ?? (input?.evidenceItems.length ? "0.01" : "0.00");
  const jobId =
    typeof receipt.jobId === "string" && receipt.jobId.trim()
      ? receipt.jobId
      : input?.jobId ?? "unknown";
  const timestamp =
    typeof receipt.timestamp === "string" && receipt.timestamp.trim()
      ? receipt.timestamp
      : new Date().toISOString();
  const memo =
    typeof receipt.memo === "string" && receipt.memo.trim()
      ? receipt.memo
      : `Juvra evidence verification for Arc job ${jobId}`;
  const verificationStatus = isVerificationStatus(result.verificationStatus)
    ? result.verificationStatus
    : "needs_review";
  const settlementImpact = isSettlementImpact(result.settlementImpact)
    ? result.settlementImpact
    : "inconclusive";

  return {
    verificationId:
      typeof result.verificationId === "string" && result.verificationId.trim()
        ? result.verificationId
        : getRandomId("ver"),
    verificationCostUSDC: costUSDC,
    verificationStatus,
    checkedSignals: withFallbackStrings(result.checkedSignals, [
      "Delivery text",
      "Evidence items",
      "Evidence links",
    ]),
    findings: withFallbackStrings(result.findings, [
      "The verification agent could not produce detailed findings. Human review is required.",
    ]),
    riskFlags: asStringArray(result.riskFlags)
      .map((item) => item.trim())
      .filter(Boolean),
    settlementImpact,
    receipt: {
      jobId,
      timestamp,
      agent: "Juvra Verification Agent",
      costUSDC,
      memo,
    },
    safetyNotice: VERIFICATION_SAFETY_NOTICE,
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

function asEvidenceItems(value: unknown): EvidenceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isEvidenceItem);
}

function withFallbackStrings(value: unknown, fallback: string[]) {
  const items = asStringArray(value).map((item) => item.trim()).filter(Boolean);

  return items.length > 0 ? items : fallback;
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

function isEvidenceItem(value: unknown): value is EvidenceItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isEvidenceType(value.type) &&
    typeof value.createdAt === "string" &&
    (value.submittedBy === undefined || typeof value.submittedBy === "string") &&
    (value.evidenceUrl === undefined || typeof value.evidenceUrl === "string") &&
    (value.note === undefined || typeof value.note === "string")
  );
}

function isEvidenceType(value: unknown): value is EvidenceType {
  return (
    typeof value === "string" &&
    ["delivery", "dispute", "revision", "admin"].includes(value)
  );
}

function isVerificationStatus(value: unknown): value is VerificationStatus {
  return (
    typeof value === "string" &&
    ["passed", "warning", "failed", "needs_review"].includes(value)
  );
}

function isSettlementImpact(value: unknown): value is SettlementImpact {
  return (
    typeof value === "string" &&
    [
      "supports_release",
      "supports_revision",
      "supports_dispute_review",
      "inconclusive",
    ].includes(value)
  );
}

function toUSDCAmount(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return amount.toFixed(2);
}

function getRandomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
