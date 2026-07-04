import { NextResponse } from "next/server";

import {
  depositToGateway,
  gatewayExplorerTx,
  getGatewayAgentAddress,
  getGatewayStatus,
  isGatewayConfigured,
  type GatewayChainKey,
} from "@/lib/agent/gateway";

// The agent autonomously deposits USDC into the Gateway Wallet (approve + deposit)
// on the source chain, funding its unified balance.
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
    const amountUSDC = String(body.amountUSDC ?? "5").trim();
    const amount = Number(amountUSDC);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("amountUSDC must be a positive number.");
    }

    // Guard: the agent must hold enough USDC on the source chain.
    const status = await getGatewayStatus();
    const sourceUsdc = sourceKey === "arc" ? Number(status.onchain.arcUSDC) : 0;
    if (sourceKey === "arc" && sourceUsdc < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent has ${status.onchain.arcUSDC} USDC on Arc; need ${amountUSDC}. Fund ${getGatewayAgentAddress()} on Arc.`,
        },
        { status: 402 }
      );
    }

    const { approveTxHash, depositTxHash } = await depositToGateway(sourceKey, amountUSDC);

    return NextResponse.json({
      success: true,
      sourceKey,
      amountUSDC,
      approveTxHash,
      depositTxHash,
      depositExplorerUrl: gatewayExplorerTx(sourceKey, depositTxHash),
      note: "Deposit confirmed. The unified balance updates once Gateway observes finality (poll status).",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Gateway deposit failed." },
      { status: 500 }
    );
  }
}
