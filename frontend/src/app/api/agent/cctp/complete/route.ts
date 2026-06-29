import { NextResponse } from "next/server";

import {
  CCTP,
  arcExplorerTx,
  fetchAttestation,
  isCctpConfigured,
  mintOnArc,
} from "@/lib/agent/cctp";

// Step 2 of the bridge: poll Circle's attestation for the Sepolia burn, then
// the agent autonomously mints USDC on Arc via receiveMessage. If the
// attestation is not ready yet, returns { pending: true } so the client retries.
export async function POST(req: Request) {
  try {
    if (!isCctpConfigured()) {
      return NextResponse.json(
        { success: false, error: "Agent wallet is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const burnTxHash = String(body.burnTxHash ?? "").trim();

    if (!/^0x[0-9a-fA-F]{64}$/.test(burnTxHash)) {
      throw new Error("A valid burnTxHash is required.");
    }

    // Bounded polling within the request.
    let attestation = await fetchAttestation(
      CCTP.sepolia.domain,
      burnTxHash as `0x${string}`
    );

    for (let i = 0; i < 8 && attestation.status !== "complete"; i++) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      attestation = await fetchAttestation(
        CCTP.sepolia.domain,
        burnTxHash as `0x${string}`
      );
    }

    if (attestation.status !== "complete" || !attestation.message || !attestation.attestation) {
      return NextResponse.json({
        success: true,
        pending: true,
        attestationStatus: attestation.status,
        message: "Attestation not ready yet. Retry shortly.",
      });
    }

    const mintTxHash = await mintOnArc(attestation.message, attestation.attestation);

    return NextResponse.json({
      success: true,
      pending: false,
      stage: "minted",
      mintTxHash,
      mintExplorerUrl: arcExplorerTx(mintTxHash),
      safetyNotice:
        "Autonomous cross-chain settlement by the agent (CCTP). Escrow funds are not controlled by the agent and remain human-confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "CCTP mint failed.",
      },
      { status: 500 }
    );
  }
}
