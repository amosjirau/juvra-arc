import { NextResponse } from "next/server";

import { verifyEvidenceGemini } from "@/lib/agent/geminiAgent";
import { verifyEvidenceMock } from "@/lib/agent/mockAgent";
import { runAgentProvider } from "@/lib/agent/provider";
import {
  normalizeAgentVerificationResult,
  validateAgentVerificationInput,
} from "@/lib/agent/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateAgentVerificationInput(body);
    const providerResult = await runAgentProvider({
      gemini: () => verifyEvidenceGemini(input),
      mock: () => verifyEvidenceMock(input),
      normalize: (result) => normalizeAgentVerificationResult(result, input),
      routeName: "verify-evidence",
    });

    return NextResponse.json({
      success: true,
      mode: providerResult.mode,
      verificationId: providerResult.result.verificationId,
      verificationCostUSDC: providerResult.result.verificationCostUSDC,
      verificationStatus: providerResult.result.verificationStatus,
      checkedSignals: providerResult.result.checkedSignals,
      findings: providerResult.result.findings,
      riskFlags: providerResult.result.riskFlags,
      settlementImpact: providerResult.result.settlementImpact,
      receipt: providerResult.result.receipt,
      safetyNotice: providerResult.result.safetyNotice,
      warning: providerResult.warning,
      geminiError: providerResult.developmentError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify evidence.",
      },
      { status: 400 }
    );
  }
}
