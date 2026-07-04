import { NextResponse } from "next/server";

import {
  burn,
  getCctpAgentAddress,
  getDirectionInfo,
  getSourceGas,
  getSourceUsdcUSDC,
  isCctpConfigured,
  sourceExplorerTx,
  type CctpDirection,
} from "@/lib/agent/cctp";

// Step 1 of the agent-driven bridge: the agent autonomously approves and burns
// USDC on the SOURCE chain (direction-aware). Returns the burn tx so the client
// can complete the mint once Circle's attestation is ready.
export async function POST(req: Request) {
  try {
    if (!isCctpConfigured()) {
      return NextResponse.json(
        { success: false, error: "Agent wallet is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const direction: CctpDirection =
      body.direction === "arc_to_sepolia" ? "arc_to_sepolia" : "sepolia_to_arc";
    const amountUSDC = String(body.amountUSDC ?? "1").trim();
    const amount = Number(amountUSDC);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("amountUSDC must be a positive number.");
    }

    const info = getDirectionInfo(direction);
    const agentAddress = getCctpAgentAddress();
    const sourceUsdc = await getSourceUsdcUSDC(direction);
    const sourceGas = await getSourceGas(direction);

    if (Number(sourceUsdc) < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent has ${sourceUsdc} USDC on ${info.sourceLabel}; need ${amountUSDC}. Fund ${agentAddress} on ${info.sourceLabel}.`,
          agentAddress,
        },
        { status: 402 }
      );
    }

    if (Number(sourceGas.gas) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent has no ${sourceGas.asset} for gas on ${info.sourceLabel}. Fund ${agentAddress} with a little ${sourceGas.asset}.`,
          agentAddress,
        },
        { status: 402 }
      );
    }

    const { burnTxHash, approveTxHash, srcDomain } = await burn(direction, amountUSDC);

    return NextResponse.json({
      success: true,
      stage: "burned",
      direction,
      srcDomain,
      amountUSDC,
      approveTxHash,
      burnTxHash,
      burnExplorerUrl: sourceExplorerTx(direction, burnTxHash),
      next: "Call /api/agent/cctp/complete with this direction + burnTxHash to mint.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "CCTP burn failed." },
      { status: 500 }
    );
  }
}
