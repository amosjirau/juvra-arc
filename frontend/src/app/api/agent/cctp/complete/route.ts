import { NextResponse } from "next/server";

import {
  destExplorerTx,
  fetchAttestation,
  getDirectionInfo,
  isCctpConfigured,
  mint,
  type CctpDirection,
} from "@/lib/agent/cctp";

// Step 2 of the bridge: poll Circle's attestation for the source burn, then the
// agent autonomously mints USDC on the destination chain via receiveMessage. If
// the attestation is not ready, returns { pending: true } so the client retries.
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
    const burnTxHash = String(body.burnTxHash ?? "").trim();

    if (!/^0x[0-9a-fA-F]{64}$/.test(burnTxHash)) {
      throw new Error("A valid burnTxHash is required.");
    }

    const { sourceDomain } = getDirectionInfo(direction);

    // Bounded polling within the request.
    let attestation = await fetchAttestation(sourceDomain, burnTxHash as `0x${string}`);

    for (let i = 0; i < 8 && attestation.status !== "complete"; i++) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      attestation = await fetchAttestation(sourceDomain, burnTxHash as `0x${string}`);
    }

    if (
      attestation.status !== "complete" ||
      !attestation.message ||
      !attestation.attestation
    ) {
      return NextResponse.json({
        success: true,
        pending: true,
        attestationStatus: attestation.status,
        message: "Attestation not ready yet. Retry shortly.",
      });
    }

    const mintTxHash = await mint(direction, attestation.message, attestation.attestation);

    return NextResponse.json({
      success: true,
      pending: false,
      stage: "minted",
      direction,
      mintTxHash,
      mintExplorerUrl: destExplorerTx(direction, mintTxHash),
      safetyNotice:
        "Autonomous cross-chain settlement by the agent (CCTP). Escrow funds are not controlled by the agent and remain human-confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "CCTP mint failed." },
      { status: 500 }
    );
  }
}
