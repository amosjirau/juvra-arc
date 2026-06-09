import { NextResponse } from "next/server";
import {
  normalizeRecommendationResult,
  validateRecommendationInput,
} from "@/lib/agent/schemas";
import { recommendActionMock } from "@/lib/agent/mockAgent";
import { recommendActionGemini } from "@/lib/agent/geminiAgent";
import { runAgentProvider } from "@/lib/agent/provider";

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
    const providerResult = await runAgentProvider({
      gemini: () => recommendActionGemini(context),
      mock: () => recommendActionMock(context),
      normalize: normalizeRecommendationResult,
      routeName: "recommend-action",
    });

    return NextResponse.json({
      success: true,
      mode: providerResult.mode,
      warning: providerResult.warning,
      geminiError: providerResult.developmentError,
      result: providerResult.result,
    });
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
