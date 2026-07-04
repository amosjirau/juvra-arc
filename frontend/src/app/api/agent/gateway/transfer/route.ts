import { NextResponse } from "next/server";

import {
  gatewayExplorerTx,
  getGatewayAgentAddress,
  getUnifiedBalances,
  isGatewayConfigured,
  transferUnified,
  type GatewayChainKey,
} from "@/lib/agent/gateway";

// The agent autonomously spends its unified Gateway balance: sign a burn intent
// on the source domain, get Circle's attestation, and mint on the destination.
export async function POST(req: Request) {
  try {
    if (!isGatewayConfigured()) {
      return NextResponse.json(
        { success: false, error: "Agent wallet is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const sourceKey: GatewayChainKey = body.sourceKey === "sepolia" ? "sepolia" : "arc";
    const destKey: GatewayChainKey = body.destKey === "arc" ? "arc" : "sepolia";
    const amountUSDC = String(body.amountUSDC ?? "1").trim();
    const amount = Number(amountUSDC);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("amountUSDC must be a positive number.");
    }
    if (sourceKey === destKey) {
      throw new Error("Source and destination must differ.");
    }

    // Guard: the unified balance on the source domain must cover the transfer.
    const agentAddress = getGatewayAgentAddress();
    const unified = await getUnifiedBalances(agentAddress!);
    if (Number(unified[sourceKey]) < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Unified balance on ${sourceKey} is ${unified[sourceKey]} USDC; need ${amountUSDC}. Deposit first (balance updates after finality).`,
          unified,
        },
        { status: 402 }
      );
    }

    const { mintTxHash } = await transferUnified(sourceKey, destKey, amountUSDC);

    return NextResponse.json({
      success: true,
      sourceKey,
      destKey,
      amountUSDC,
      mintTxHash,
      mintExplorerUrl: gatewayExplorerTx(destKey, mintTxHash),
      safetyNotice:
        "Autonomous Gateway transfer by the agent (unified USDC balance). Escrow funds are not controlled by the agent and remain human-confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Gateway transfer failed." },
      { status: 500 }
    );
  }
}
