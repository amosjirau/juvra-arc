import { NextResponse } from "next/server";

import { verifyEvidenceGemini } from "@/lib/agent/geminiAgent";
import { verifyEvidenceMock } from "@/lib/agent/mockAgent";
import { verifyEvidenceOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";
import {
  normalizeAgentVerificationResult,
  validateAgentVerificationInput,
} from "@/lib/agent/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateAgentVerificationInput(body);
    const outcome = await runAgentTask({
      routeName: "verify-evidence",
      gemini: () => verifyEvidenceGemini(input),
      openaiCompat: () => verifyEvidenceOpenAICompat(input),
      mock: () => verifyEvidenceMock(input),
      normalize: (result) => normalizeAgentVerificationResult(result, input),
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
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
