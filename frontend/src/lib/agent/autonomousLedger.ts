// Server-side, in-process ledger of autonomous agent payments.
//
// This records the agent's own autonomous USDC spends and tracks the running
// session budget. It persists for the lifetime of the server process (fine for
// a single-server demo). The real hard guards are the per-tx cap, the recipient
// allowlist, and the agent wallet's actual on-chain balance.

import type { Address } from "viem";

import type { AutonomousPurpose } from "./autonomyPolicy";

export type AutonomousPayment = {
  id: string;
  jobId: string;
  purpose: AutonomousPurpose;
  amountUSDC: string;
  to: Address;
  txHash: string;
  explorerUrl: string;
  reason: string;
  createdAt: string;
};

const payments: AutonomousPayment[] = [];
let sessionSpentUSDC = 0;

export function recordAutonomousPayment(payment: AutonomousPayment): void {
  payments.unshift(payment);
  sessionSpentUSDC += Number(payment.amountUSDC) || 0;
}

export function getAutonomousPayments(jobId?: string): AutonomousPayment[] {
  return jobId ? payments.filter((item) => item.jobId === jobId) : payments;
}

export function getSessionSpentUSDC(): number {
  return sessionSpentUSDC;
}

// Escrow settlements the agent executed. These move ESCROW funds along the
// direction the parties recorded on-chain — they are not agent spends, so they
// never count against the agent's session budget.
export type AgentSettlement = {
  id: string;
  jobId: string;
  direction: "release" | "refund";
  amountUSDC: string;
  recipient: Address;
  txHash: string;
  explorerUrl: string;
  createdAt: string;
};

const settlements: AgentSettlement[] = [];

export function recordAgentSettlement(settlement: AgentSettlement): void {
  settlements.unshift(settlement);
}

export function getAgentSettlements(jobId?: string): AgentSettlement[] {
  return jobId ? settlements.filter((item) => item.jobId === jobId) : settlements;
}
