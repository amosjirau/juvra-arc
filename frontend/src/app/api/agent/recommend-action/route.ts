import { NextResponse } from "next/server";
import {
  normalizeRecommendationResult,
  validateRecommendationInput,
} from "@/lib/agent/schemas";
import { recommendActionMock } from "@/lib/agent/mockAgent";
import { recommendActionGemini } from "@/lib/agent/geminiAgent";
import { recommendActionOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateRecommendationInput(body);
    const context = {
      ...input.legacyContext,
      job: input.job,
      riskAnalysis: input.riskAnalysis,
      deliveryReview: input.deliveryReview,
      disputeSummary: input.disputeSummary,
      evidence: input.evidence,
      walletRole: input.walletRole,
    };
    const outcome = await runAgentTask({
      routeName: "recommend-action",
      gemini: () => recommendActionGemini(context),
      openaiCompat: () => recommendActionOpenAICompat(context),
      mock: () => recommendActionMock(context),
      normalize: normalizeRecommendationResult,
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to recommend action.",
      },
      { status: 400 }
    );
  }
}
