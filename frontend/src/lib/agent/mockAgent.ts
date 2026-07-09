import {
  AgentRecommendation,
  AgentVerificationInput,
  AgentVerificationResult,
  DeliveryReviewInput,
  DeliveryReviewResult,
  DisputeSummaryInput,
  DisputeSummaryResult,
  JobAnalysisInput,
  JobRiskAnalysis,
  ScopeBuilderInput,
  ScopeBuilderResult,
} from "./agentTypes";
import {
  getNanopaymentMemo,
  getVerificationCost,
} from "./nanopaymentPolicy";
import { VERIFICATION_SAFETY_NOTICE } from "./schemas";

import {
  calculateClarityScore,
  detectJobIssues,
  getRiskLevel,
  suggestJobFixes,
} from "./risk";

export function analyzeJobMock(input: JobAnalysisInput): JobRiskAnalysis {
  const score = calculateClarityScore(
    input.description,
    input.deadline,
    input.deliverables
  );

  const issues = detectJobIssues(
    input.description,
    input.deadline,
    input.deliverables
  );

  return {
    riskLevel: getRiskLevel(score),
    clarityScore: score,
    issues,
    suggestedFixes: suggestJobFixes(issues),
    summary:
      score >= 75
        ? "This job is reasonably clear and has low escrow dispute risk."
        : score >= 45
          ? "This job has some unclear terms that may create dispute risk."
          : "This job is vague and has high escrow dispute risk.",
  };
}

export function reviewDeliveryMock(
  input: DeliveryReviewInput
): DeliveryReviewResult {
  let score = 50;
  const matchedRequirements: string[] = [];
  const missingItems: string[] = [];
  const concerns: string[] = [];

  const delivery = input.deliveryText.toLowerCase();

  if (delivery.includes("link") || delivery.includes("deployed")) {
    score += 20;
    matchedRequirements.push("Delivery includes a visible link or deployment reference.");
  } else if ((input.deliveryEvidence ?? []).length > 0) {
    score += 10;
    matchedRequirements.push("Saved delivery evidence is available for review.");
  } else {
    missingItems.push("No deployment or preview link was provided.");
  }

  if (delivery.includes("github") || delivery.includes("repo")) {
    score += 15;
    matchedRequirements.push("Delivery includes a repository reference.");
  } else {
    concerns.push("No source repository was mentioned.");
  }

  if (delivery.length > 120) {
    score += 15;
    matchedRequirements.push("Delivery explanation is detailed.");
  } else {
    concerns.push("Delivery explanation is too short.");
  }

  score = Math.max(0, Math.min(100, score));

  return {
    completionScore: score,
    matchedRequirements,
    missingItems,
    concerns,
    recommendation:
      score >= 80
        ? "release_full"
        : score >= 55
          ? "request_revision"
          : "escalate_admin",
    reasoning:
      score >= 80
        ? "The submission appears complete based on the provided delivery information."
        : score >= 55
          ? "The submission has partial evidence but still needs clarification or revision."
          : "The submission does not provide enough evidence for safe release.",
  };
}

export function verifyEvidenceMock(
  input: AgentVerificationInput
): AgentVerificationResult {
  const evidenceItems = input.evidenceItems ?? [];
  const deliveryText = input.deliveryText.trim();
  const combinedText = [
    deliveryText,
    ...evidenceItems.map((item) => `${item.evidenceUrl ?? ""} ${item.note ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();
  const evidenceUrls = evidenceItems
    .map((item) => item.evidenceUrl?.trim())
    .filter((item): item is string => Boolean(item));
  const hasRepoSignal =
    combinedText.includes("github") ||
    combinedText.includes("repo") ||
    evidenceUrls.some((url) => url.includes("github.com"));
  const hasDeploymentSignal =
    combinedText.includes("deployed") ||
    combinedText.includes("preview") ||
    combinedText.includes("demo") ||
    evidenceUrls.some((url) =>
      ["vercel.app", "netlify.app", "arcscan", "ipfs"].some((term) =>
        url.toLowerCase().includes(term)
      )
    );
  const hasScreenshotSignal =
    combinedText.includes("screenshot") ||
    evidenceUrls.some((url) =>
      [".png", ".jpg", ".jpeg", ".webp"].some((extension) =>
        url.toLowerCase().includes(extension)
      )
    );
  const hasDisputeSignal =
    evidenceItems.some((item) => item.type === "dispute") ||
    ["refund", "scam", "not delivered", "broken", "missing"].some((term) =>
      combinedText.includes(term)
    );
  const riskFlags: string[] = [];
  const findings: string[] = [];

  if (!deliveryText) {
    riskFlags.push("Delivery text is missing.");
  } else if (deliveryText.length < 80) {
    riskFlags.push("Delivery text is short and may not explain completion.");
  }

  if (evidenceItems.length === 0) {
    riskFlags.push("No evidence items were submitted for verification.");
  } else {
    findings.push(
      `Reviewed ${evidenceItems.length} local evidence item${
        evidenceItems.length === 1 ? "" : "s"
      } for job ${input.jobId}.`
    );
  }

  if (evidenceUrls.length === 0) {
    riskFlags.push("No external evidence URL was attached.");
  } else {
    findings.push(
      `${evidenceUrls.length} evidence URL${
        evidenceUrls.length === 1 ? "" : "s"
      } available for human inspection.`
    );
  }

  if (hasRepoSignal) {
    findings.push("Repository or source-control signal found.");
  }

  if (hasDeploymentSignal) {
    findings.push("Deployment, demo, preview, Arcscan, or IPFS signal found.");
  }

  if (hasScreenshotSignal) {
    findings.push("Screenshot or visual proof signal found.");
  }

  if (hasDisputeSignal) {
    riskFlags.push("Dispute or refund language appears in the delivery context.");
  }

  if (findings.length === 0) {
    findings.push(
      "Verification could not confirm strong delivery signals from the current evidence."
    );
  }

  const inferredRisk =
    hasDisputeSignal || riskFlags.length >= 3
      ? "high"
      : riskFlags.length > 0
        ? "medium"
        : "low";
  const policyCost = getVerificationCost(inferredRisk, evidenceItems.length);
  const budgetCost = normalizeUSDCBudget(input.verificationBudgetUSDC);
  const verificationCostUSDC = budgetCost ?? policyCost;

  if (
    budgetCost &&
    Number.isFinite(Number(policyCost)) &&
    Number(budgetCost) < Number(policyCost)
  ) {
    riskFlags.push(
      `Verification budget ${budgetCost} USDC is below policy estimate ${policyCost} USDC.`
    );
  }

  const verificationStatus = getVerificationStatus({
    evidenceCount: evidenceItems.length,
    hasDisputeSignal,
    hasStrongSignal: hasRepoSignal || hasDeploymentSignal || hasScreenshotSignal,
    riskFlagCount: riskFlags.length,
  });
  const timestamp = new Date().toISOString();
  const memo = getNanopaymentMemo(input.jobId, "evidence-verification");

  return {
    verificationId: getVerificationId(input.jobId),
    verificationCostUSDC,
    verificationStatus,
    checkedSignals: [
      "Delivery note length and clarity",
      "Submitted local evidence items",
      "External evidence URLs",
      "Repository and deployment indicators",
      "Screenshot or visual proof indicators",
      "Dispute and refund language",
      "USDC verification budget policy",
    ],
    findings,
    riskFlags,
    settlementImpact: getSettlementImpact(verificationStatus),
    receipt: {
      jobId: input.jobId,
      timestamp,
      agent: "Juvra Verification Agent",
      costUSDC: verificationCostUSDC,
      memo,
    },
    safetyNotice: VERIFICATION_SAFETY_NOTICE,
  };
}

export function summarizeDisputeMock(
  input: DisputeSummaryInput
): DisputeSummaryResult {
  const combinedText =
    `${input.clientClaim} ${input.freelancerResponse}`.toLowerCase();

  const severeDispute =
    combinedText.includes("not delivered") ||
    combinedText.includes("scam") ||
    combinedText.includes("refund");

  return {
    summary:
      "A dispute has been raised between the client and freelancer. The client claim and freelancer response should be reviewed against the original job scope and delivery evidence.",
    clientPosition: input.clientClaim,
    freelancerPosition: input.freelancerResponse,
    keyEvidence: input.deliveryEvidence || [],
    unresolvedQuestions: [
      "Does the submitted work match the original job scope?",
      "Was the deadline respected?",
      "Were the acceptance criteria clearly defined before funding?",
    ],
    recommendedResolution: severeDispute ? "escalate_admin" : "request_revision",
    confidence: severeDispute ? 0.68 : 0.74,
  };
}

export function recommendActionMock(context: {
  riskLevel?: string;
  completionScore?: number;
  disputeRaised?: boolean;
  job?: Record<string, unknown>;
  riskAnalysis?: Record<string, unknown>;
  deliveryReview?: Record<string, unknown>;
  disputeSummary?: Record<string, unknown>;
  evidence?: unknown[];
  walletRole?: string;
}): AgentRecommendation {
  const status = Number(context.job?.status);
  const hasSubmission = Boolean(context.job?.submissionURI);
  const riskLevel =
    context.riskLevel ??
    (typeof context.riskAnalysis?.riskLevel === "string"
      ? context.riskAnalysis.riskLevel
      : undefined);
  const completionScore =
    context.completionScore ??
    (typeof context.deliveryReview?.completionScore === "number"
      ? context.deliveryReview.completionScore
      : undefined);
  const disputeRaised = context.disputeRaised ?? status === 4;

  if (status === 3 || status === 5 || status === 6) {
    return {
      suggestedAction: "no_action",
      confidence: 0.86,
      reasoning:
        "This escrow is already in a final state, so the agent should only preserve historical analysis.",
      requiredHumanAction:
        "No escrow action is suggested. Humans may review the record for audit purposes.",
      safetyNotice:
        "Juvra Agent settles escrow only along a party-recorded on-chain verdict; it cannot choose recipients, sign for users, or resolve disputes.",
    };
  }

  if (disputeRaised) {
    return {
      suggestedAction: "escalate_admin",
      confidence: 0.72,
      reasoning:
        "A dispute exists, so a human admin should review evidence before funds move.",
      requiredHumanAction:
        "Admin should review job terms, delivery evidence, and both parties' claims.",
      safetyNotice:
        "Juvra Agent cannot resolve disputes. Any admin resolution requires an explicit wallet confirmation.",
    };
  }

  if (status === 2 && (completionScore || 0) >= 80 && hasSubmission) {
    return {
      suggestedAction: "release_full",
      confidence: 0.84,
      reasoning:
        "Delivery appears substantially complete based on available information.",
      requiredHumanAction:
        "The authorized client must inspect the delivery and confirm release with a wallet signature.",
      safetyNotice:
        "The agent executes settlement only after the client records an on-chain verdict fixing the direction; it never chooses where funds go.",
    };
  }

  if (status === 2 && (completionScore || 0) >= 55) {
    return {
      suggestedAction: "request_revision",
      confidence: 0.74,
      reasoning:
        "The submitted work has some supporting evidence but still needs clarification before release.",
      requiredHumanAction:
        "The client should send an offchain revision note describing the missing items.",
      safetyNotice:
        "Revision notes are offchain guidance only and do not move escrow funds.",
    };
  }

  if (status === 0 && riskLevel === "high") {
    return {
      suggestedAction: "no_action",
      confidence: 0.78,
      reasoning:
        "The job scope appears high risk while the job is still open, so the safest step is to clarify terms before selecting anyone.",
      requiredHumanAction:
        "The client should update the job scope, deadline, and acceptance criteria before selecting a freelancer.",
      safetyNotice:
        "The agent cannot select freelancers or alter escrow state.",
    };
  }

  return {
    suggestedAction: "no_action",
    confidence: 0.7,
    reasoning:
      "There is not enough reliable context to suggest a contract action safely.",
    requiredHumanAction:
      "A human should gather more evidence or run the relevant risk, delivery, and dispute analyses.",
    safetyNotice:
      "Juvra Agent is advisory only. Every escrow write still requires explicit wallet confirmation.",
  };
}

export function buildScopeMock(input: ScopeBuilderInput): ScopeBuilderResult {
  const title = input.title.trim() || "Freelance escrow job";
  const description = input.description.toLowerCase();
  const hasEvidence =
    Array.isArray(input.evidence) && input.evidence.length > 0;
  const needsEvidence =
    !description.includes("evidence") &&
    !description.includes("github") &&
    !description.includes("deliverable");

  return {
    suggestedMilestones: [
      `Scope alignment for ${title}`,
      "Core delivery with reviewable evidence",
      "Final QA, revision window, and settlement review",
    ],
    acceptanceCriteria: [
      "Client and freelancer agree on the exact deliverables, deadline, and review method before work starts.",
      "Each milestone has a visible artifact such as a deployment, repository, checklist, design file, or written report.",
      "Client approval is based on submitted evidence matching the agreed scope, not informal expectations added later.",
    ],
    deliveryRequirements: [
      "Delivery note with a concise completion summary.",
      "Public or permissioned evidence URL for the completed work.",
      "Repository, screenshot, document, or deployment link where relevant.",
      hasEvidence
        ? "Reference the saved evidence already attached to this job."
        : "Attach evidence before requesting release or dispute review.",
    ],
    revisionTerms: [
      "Client should request revisions with specific missing criteria and evidence references.",
      "Freelancer should respond with a revised delivery note and updated evidence URL.",
      "Escalate only if the parties cannot agree after a clear revision request.",
    ],
    riskNotes: [
      needsEvidence
        ? "The current scope should state what evidence proves completion."
        : "Evidence expectations are present, but should still be tied to each milestone.",
      input.deadline
        ? "Deadline exists; confirm whether it applies to all milestones or only final delivery."
        : "Missing or vague deadlines can create avoidable settlement disputes.",
      "AI suggestions are coordination support only and do not select freelancers or move escrow.",
    ],
    suggestedEscrowStructure:
      "Suggested split: 25% scope confirmation, 45% core build delivery, 30% final review and revisions.",
    reasoning:
      "The structure separates agreement, delivery evidence, and final review so the agent can reason about scope while humans retain wallet-confirmed settlement control.",
    safetyNotice:
      "These suggestions do not modify escrow. Client and freelancer must agree manually before any wallet-confirmed action.",
  };
}

function normalizeUSDCBudget(value?: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return amount.toFixed(2);
}

function getVerificationStatus({
  evidenceCount,
  hasDisputeSignal,
  hasStrongSignal,
  riskFlagCount,
}: {
  evidenceCount: number;
  hasDisputeSignal: boolean;
  hasStrongSignal: boolean;
  riskFlagCount: number;
}): AgentVerificationResult["verificationStatus"] {
  if (evidenceCount === 0 && riskFlagCount > 0) {
    return "needs_review";
  }

  if (hasDisputeSignal) {
    return riskFlagCount >= 3 ? "failed" : "warning";
  }

  if (hasStrongSignal && riskFlagCount === 0) {
    return "passed";
  }

  if (hasStrongSignal || riskFlagCount <= 2) {
    return "warning";
  }

  return "needs_review";
}

function getSettlementImpact(
  status: AgentVerificationResult["verificationStatus"]
): AgentVerificationResult["settlementImpact"] {
  switch (status) {
    case "passed":
      return "supports_release";
    case "warning":
      return "supports_revision";
    case "failed":
      return "supports_dispute_review";
    case "needs_review":
    default:
      return "inconclusive";
  }
}

function getVerificationId(jobId: string) {
  return `ver-${jobId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
