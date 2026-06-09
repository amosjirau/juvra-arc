import { NextResponse } from "next/server";
import { validateJobAnalysisInput } from "@/lib/agent/schemas";
import { analyzeJobMock } from "@/lib/agent/mockAgent";
import { analyzeJobGemini } from "@/lib/agent/geminiAgent";
import { runAgentProvider } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateJobAnalysisInput(body);
    const providerResult = await runAgentProvider({
      gemini: () => analyzeJobGemini(input),
      mock: () => analyzeJobMock(input),
      routeName: "analyze-job",
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
          error instanceof Error ? error.message : "Failed to analyze job.",
      },
      { status: 400 }
    );
  }
}
