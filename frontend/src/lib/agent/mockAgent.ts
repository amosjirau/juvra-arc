import {
  AgentRecommendation,
  DeliveryReviewInput,
  DeliveryReviewResult,
  DisputeSummaryInput,
  DisputeSummaryResult,
  JobAnalysisInput,
  JobRiskAnalysis,
} from "./agentTypes";

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
}): AgentRecommendation {
  if (context.disputeRaised) {
    return {
      recommendation: "escalate_admin",
      confidence: 0.72,
      reasoning:
        "A dispute exists, so a human admin should review evidence before funds move.",
      requiredHumanAction:
        "Admin should review job terms, delivery evidence, and both parties' claims.",
    };
  }

  if ((context.completionScore || 0) >= 80) {
    return {
      recommendation: "release_full",
      confidence: 0.84,
      reasoning:
        "Delivery appears substantially complete based on available information.",
      requiredHumanAction:
        "Client or admin must confirm release with wallet signature.",
    };
  }

  return {
    recommendation: "request_revision",
    confidence: 0.7,
    reasoning:
      "The job needs more evidence or clarification before escrow can be safely released.",
    requiredHumanAction:
      "Client should request missing items or admin should inspect the delivery.",
  };
}
