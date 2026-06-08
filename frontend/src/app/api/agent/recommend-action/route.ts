import { NextResponse } from "next/server";
import { recommendActionMock } from "@/lib/agent/mockAgent";
import { recommendActionGemini, useGeminiAgent } from "@/lib/agent/geminiAgent";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const context = {
      riskLevel: body.riskLevel,
      completionScore: body.completionScore,
      disputeRaised: body.disputeRaised,
    };
    const isGeminiMode = useGeminiAgent();

    if (!isGeminiMode) {
      return NextResponse.json({
        success: true,
        mode: "mock",
        result: recommendActionMock(context),
      });
    }

    try {
      const result = await recommendActionGemini(context);

      return NextResponse.json({
        success: true,
        mode: "gemini",
        result,
      });
    } catch (liveError) {
      console.error("Gemini recommend-action failed:", liveError);

      const fallback = recommendActionMock(context);

      return NextResponse.json({
        success: true,
        mode: "mock_fallback",
        warning: "Gemini failed. Mock fallback was used.",
        geminiError:
          process.env.NODE_ENV === "development"
            ? getErrorMessage(liveError)
            : undefined,
        result: fallback,
      });
    }
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
