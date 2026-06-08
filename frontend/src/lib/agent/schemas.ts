import {
  DeliveryReviewInput,
  DisputeSummaryInput,
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
