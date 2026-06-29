// Autonomy policy: budget caps, recipient allowlist, and the decision logic the
// agent uses to autonomously spend USDC. Guardrails so the agent can act without
// a human signature while staying bounded and safe. Escrow is never in scope.

import type { Address } from "viem";

import type { EvidenceItem } from "./evidence";
import {
  getVerificationCost,
  getVerificationFeeRecipient,
} from "./nanopaymentPolicy";

export type AutonomousPurpose = "verification" | "service";

function envUSDC(name: string, fallback: string): string {
  const raw = process.env[name]?.trim();
  const value = Number(raw);

  return raw && Number.isFinite(value) && value > 0 ? value.toFixed(2) : fallback;
}

/** Maximum any single autonomous payment may spend. */
export function getPerTxCapUSDC(): string {
  return envUSDC("AGENT_MAX_PAYMENT_USDC", "0.10");
}

/** Maximum the agent may spend across the running server session. */
export function getSessionBudgetUSDC(): string {
  return envUSDC("AGENT_SESSION_BUDGET_USDC", "1.00");
}

/** Extra distinct service/agent recipients allowed for agent-to-agent payments. */
export function getServiceRecipients(): Address[] {
  const raw = process.env.AGENT_SERVICE_RECIPIENTS?.trim();

  return (raw ? raw.split(",") : [])
    .map((item) => item.trim())
    .filter((item) => /^0x[a-fA-F0-9]{40}$/.test(item)) as Address[];
}

/** The agent may only autonomously pay addresses on this allowlist. */
export function getRecipientAllowlist(): Address[] {
  const byKey = new Map<string, Address>();
  const fee = getVerificationFeeRecipient();

  byKey.set(fee.toLowerCase(), fee);

  for (const recipient of getServiceRecipients()) {
    byKey.set(recipient.toLowerCase(), recipient);
  }

  return [...byKey.values()];
}

export function isAllowedRecipient(address: string): boolean {
  return getRecipientAllowlist().some(
    (allowed) => allowed.toLowerCase() === address.toLowerCase()
  );
}

export type AutonomyDecision = {
  approved: boolean;
  amountUSDC: string;
  recipient: Address;
  purpose: "verification";
  signals: string[];
  reason: string;
};

/**
 * Decide whether to autonomously pay a verification nanopayment, tied to real
 * job signals (submitted evidence, submission status, dispute state). The amount
 * is the policy cost, hard-capped by the per-transaction cap.
 */
export function decideVerificationPayment(input: {
  jobStatus?: number | string;
  riskFlags?: string[];
  evidenceItems: EvidenceItem[];
}): AutonomyDecision {
  const recipient = getVerificationFeeRecipient();
  const flags = input.riskFlags ?? [];
  const status = Number(input.jobStatus);
  const evidenceCount = input.evidenceItems.length;
  const hasEvidence = evidenceCount > 0;
  const submitted = status === 2;
  const disputed = status === 4;

  const signals: string[] = [];
  if (hasEvidence) signals.push(`${evidenceCount} delivery evidence item(s) present`);
  if (submitted) signals.push("job submitted for review");
  if (disputed) signals.push("dispute open");
  if (flags.length > 0) signals.push(`${flags.length} risk flag(s)`);

  const cap = Number(getPerTxCapUSDC());
  const riskLevel =
    flags.length >= 2 || disputed ? "high" : flags.length === 1 ? "medium" : "low";
  const policyCost = Number(
    getVerificationCost(riskLevel, Math.max(1, evidenceCount))
  );
  const amount = Math.min(policyCost > 0 ? policyCost : 0.01, cap);

  if (!hasEvidence && !submitted && !disputed) {
    return {
      approved: false,
      amountUSDC: amount.toFixed(2),
      recipient,
      purpose: "verification",
      signals,
      reason:
        "No verifiable signal: no delivery evidence and the job is not submitted or disputed. The agent withholds spending.",
    };
  }

  return {
    approved: true,
    amountUSDC: amount.toFixed(2),
    recipient,
    purpose: "verification",
    signals,
    reason: `Verification warranted by real signals (${signals.join(
      ", "
    )}). Paying a capped USDC nanopayment autonomously.`,
  };
}
