import { NextResponse } from "next/server";

import {
  GATEWAY_MINTER_ADDRESS,
  GATEWAY_WALLET_ADDRESS,
  getGatewayStatus,
  isGatewayConfigured,
} from "@/lib/agent/gateway";

// Unified Gateway balance + the agent's on-chain funds available to deposit/mint.
export async function GET() {
  if (!isGatewayConfigured()) {
    return NextResponse.json(
      { success: false, configured: false, error: "Agent wallet is not configured." },
      { status: 503 }
    );
  }

  try {
    const status = await getGatewayStatus();
    return NextResponse.json({
      success: true,
      ...status,
      contracts: {
        gatewayWallet: GATEWAY_WALLET_ADDRESS,
        gatewayMinter: GATEWAY_MINTER_ADDRESS,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to read Gateway status." },
      { status: 500 }
    );
  }
}
