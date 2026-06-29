import { NextResponse } from "next/server";

import { getCctpStatus, isCctpConfigured } from "@/lib/agent/cctp";

// Cross-chain treasury status for the agent: Sepolia USDC/ETH and Arc USDC.
export async function GET() {
  if (!isCctpConfigured()) {
    return NextResponse.json(
      { success: false, configured: false, error: "Agent wallet is not configured." },
      { status: 503 }
    );
  }

  try {
    const status = await getCctpStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to read CCTP status.",
      },
      { status: 500 }
    );
  }
}
