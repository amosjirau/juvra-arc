import { parseEther, type Address } from "viem";

import type { EvidenceItem } from "./evidence";

export type VerificationRiskLevel = "low" | "medium" | "high" | string | undefined;
export type VerificationJobStatus = number | string | undefined;

// Recipient of the on-chain USDC verification fee. Configurable via env so the
// treasury address is not hardcoded for deployments; falls back to the project
// default. This is NOT escrow — it is a small, separate, human-confirmed fee.
const DEFAULT_VERIFICATION_FEE_RECIPIENT =
  "0x46887Ed8f4faa4193b3cD5CCCced96A63CEF4eD4";

export function getVerificationFeeRecipient(): Address {
  const raw = process.env.NEXT_PUBLIC_VERIFICATION_FEE_RECIPIENT?.trim();

  if (raw && /^0x[a-fA-F0-9]{40}$/.test(raw)) {
    return raw as Address;
  }

  return DEFAULT_VERIFICATION_FEE_RECIPIENT;
}

// On Arc, USDC is the native gas token with 18 decimals, so a "0.01" USDC fee
// maps cleanly through parseEther. Returns 0n for non-positive/invalid amounts.
export function toNativeUSDCValue(amountUSDC: string): bigint {
  const amount = Number(amountUSDC);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0n;
  }

  return parseEther(amountUSDC as `${number}`);
}

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
