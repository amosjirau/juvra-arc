import { NextResponse } from "next/server";
import { formatEther } from "viem";

import { getAgentWallet } from "@/lib/agent/agentWallet";
import {
  getPerTxCapUSDC,
  getRecipientAllowlist,
  getSessionBudgetUSDC,
} from "@/lib/agent/autonomyPolicy";
import {
  getAutonomousPayments,
  getSessionSpentUSDC,
} from "@/lib/agent/autonomousLedger";
import {
  getServiceAgentAddress,
  getServiceFeeUSDC,
  isServiceAgentConfigured,
} from "@/lib/agent/serviceAgent";
import { arcTestnet } from "@/lib/arc";

// Reports the autonomous agent wallet status. Never returns the private key.
export async function GET() {
  const wallet = getAgentWallet();
  const configured = wallet.isConfigured();
  const address = wallet.getAddress();

  let balanceUSDC = "0.0000";
  let balanceError: string | undefined;

  if (configured && address) {
    try {
      balanceUSDC = Number(formatEther(await wallet.getBalance())).toFixed(4);
    } catch (error) {
      balanceError =
        error instanceof Error ? error.message : "Failed to read balance.";
    }
  }

  const sessionBudget = Number(getSessionBudgetUSDC());
  const spent = getSessionSpentUSDC();

  return NextResponse.json({
    success: true,
    configured,
    kind: wallet.kind,
    address,
    network: "Arc Testnet",
    chainId: arcTestnet.id,
    balanceUSDC,
    balanceError,
    perTxCapUSDC: getPerTxCapUSDC(),
    sessionBudgetUSDC: getSessionBudgetUSDC(),
    sessionSpentUSDC: spent.toFixed(2),
    sessionRemainingUSDC: Math.max(0, sessionBudget - spent).toFixed(2),
    allowlist: getRecipientAllowlist(),
    serviceAgent: {
      configured: isServiceAgentConfigured(),
      address: getServiceAgentAddress(),
      feeUSDC: getServiceFeeUSDC(),
    },
    recentPayments: getAutonomousPayments().slice(0, 10),
  });
}
