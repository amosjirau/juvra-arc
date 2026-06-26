import type { EvidenceItem } from "./evidence";

export type VerificationRiskLevel = "low" | "medium" | "high" | string | undefined;
export type VerificationJobStatus = number | string | undefined;

export function getVerificationCost(
  jobRiskLevel: VerificationRiskLevel,
  evidenceCount: number
) {
  const normalizedRisk = normalizeRiskLevel(jobRiskLevel);
  const safeEvidenceCount = Math.max(0, Math.floor(evidenceCount || 0));

  if (safeEvidenceCount === 0) {
    return "0.00";
  }

  let cost = 0.01;

  if (normalizedRisk === "medium") {
    cost += 0.01;
  }

  if (normalizedRisk === "high") {
    cost += 0.02;
  }

  if (safeEvidenceCount >= 4) {
    cost += 0.01;
  }

  if (safeEvidenceCount >= 8) {
    cost += 0.01;
  }

  return cost.toFixed(2);
}

export function shouldRunVerification(
  jobStatus: VerificationJobStatus,
  riskFlags: string[],
  evidenceItems: EvidenceItem[]
) {
  const hasEvidence = evidenceItems.length > 0;
  const hasEvidenceLink = evidenceItems.some((item) => Boolean(item.evidenceUrl?.trim()));
  const status = normalizeStatus(jobStatus);

  if (!hasEvidence) {
    return false;
  }

  if (status === 4 || status === "disputed") {
    return true;
  }

  if (riskFlags.some((flag) => isHighRiskFlag(flag))) {
    return true;
  }

  if (status === 2 || status === "submitted") {
    return hasEvidenceLink;
  }

  return hasEvidenceLink && riskFlags.length > 0;
}

export function getNanopaymentMemo(jobId: string, verificationType: string) {
  const cleanJobId = jobId.trim() || "unknown";
  const cleanType = verificationType.trim() || "evidence-verification";

  return `Juvra ${cleanType} for Arc job ${cleanJobId}`;
}

function normalizeRiskLevel(value: VerificationRiskLevel) {
  const cleanValue = value?.toString().trim().toLowerCase();

  if (cleanValue === "high" || cleanValue === "medium") {
    return cleanValue;
  }

  return "low";
}

function normalizeStatus(status: VerificationJobStatus) {
  if (typeof status === "number") {
    return status;
  }

  const cleanStatus = status?.trim().toLowerCase();

  if (!cleanStatus) {
    return undefined;
  }

  if (["submitted", "disputed"].includes(cleanStatus)) {
    return cleanStatus;
  }

  return undefined;
}

function isHighRiskFlag(flag: string) {
  const cleanFlag = flag.toLowerCase();

  return [
    "dispute",
    "refund",
    "missing",
    "no evidence",
    "high risk",
    "scam",
    "not delivered",
  ].some((term) => cleanFlag.includes(term));
}
