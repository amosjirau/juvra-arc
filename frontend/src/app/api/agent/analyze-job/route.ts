import { NextResponse } from "next/server";
import { validateJobAnalysisInput } from "@/lib/agent/schemas";
import { analyzeJobMock } from "@/lib/agent/mockAgent";
import { analyzeJobGemini, useGeminiAgent } from "@/lib/agent/geminiAgent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateJobAnalysisInput(body);
    const isGeminiMode = useGeminiAgent();

    if (!isGeminiMode) {
      return NextResponse.json({
        success: true,
        mode: "mock",
        result: analyzeJobMock(input),
      });
    }

    try {
      const result = await analyzeJobGemini(input);

      return NextResponse.json({
        success: true,
        mode: "gemini",
        result,
      });
    } catch (liveError) {
      console.error("Gemini analyze-job failed:", liveError);

      const fallback = analyzeJobMock(input);

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
          error instanceof Error ? error.message : "Failed to analyze job.",
      },
      { status: 400 }
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
