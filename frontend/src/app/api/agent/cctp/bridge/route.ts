import { NextResponse } from "next/server";

import {
  CCTP,
  burnOnSepolia,
  getCctpStatus,
  isCctpConfigured,
} from "@/lib/agent/cctp";

// Step 1 of the agent-driven Sepolia -> Arc bridge: the agent autonomously
// approves and burns USDC on Sepolia. Returns the burn tx so the client can
// complete the mint once Circle's attestation is ready.
export async function POST(req: Request) {
  try {
    if (!isCctpConfigured()) {
      return NextResponse.json(
        { success: false, error: "Agent wallet is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const amountUSDC = String(body.amountUSDC ?? "1").trim();
    const amount = Number(amountUSDC);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("amountUSDC must be a positive number.");
    }

    // Guard: ensure the agent actually holds enough Sepolia USDC + gas.
    const status = await getCctpStatus();

    if (Number(status.sepolia.usdcUSDC) < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent has ${status.sepolia.usdcUSDC} USDC on Sepolia; need ${amountUSDC}. Fund ${status.agentAddress} on Sepolia (faucet.circle.com).`,
          agentAddress: status.agentAddress,
        },
        { status: 402 }
      );
    }

    if (Number(status.sepolia.ethBalance) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent has no Sepolia ETH for gas. Fund ${status.agentAddress} with a little Sepolia ETH.`,
          agentAddress: status.agentAddress,
        },
        { status: 402 }
      );
    }

    const { burnTxHash, approveTxHash } = await burnOnSepolia(amountUSDC);

    return NextResponse.json({
      success: true,
      stage: "burned",
      srcDomain: CCTP.sepolia.domain,
      amountUSDC,
      approveTxHash,
      burnTxHash,
      burnExplorerUrl: `https://sepolia.etherscan.io/tx/${burnTxHash}`,
      next: "Call /api/agent/cctp/complete with this burnTxHash to mint on Arc.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "CCTP burn failed.",
      },
      { status: 500 }
    );
  }
}
