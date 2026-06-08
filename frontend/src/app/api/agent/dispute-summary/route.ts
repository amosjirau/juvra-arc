import { NextResponse } from "next/server";
import { validateDisputeSummaryInput } from "@/lib/agent/schemas";
import { summarizeDisputeMock } from "@/lib/agent/mockAgent";
import { summarizeDisputeGemini, useGeminiAgent } from "@/lib/agent/geminiAgent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDisputeSummaryInput(body);
    const isGeminiMode = useGeminiAgent();

    if (!isGeminiMode) {
      return NextResponse.json({
        success: true,
        mode: "mock",
        result: summarizeDisputeMock(input),
      });
    }

    try {
      const result = await summarizeDisputeGemini(input);

      return NextResponse.json({
        success: true,
        mode: "gemini",
        result,
      });
    } catch (liveError) {
      console.error("Gemini dispute-summary failed:", liveError);

      const fallback = summarizeDisputeMock(input);

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
            : "Failed to summarize dispute.",
      },
      { status: 400 }
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
