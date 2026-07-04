import { NextResponse } from "next/server";
import { validateJobAnalysisInput } from "@/lib/agent/schemas";
import { analyzeJobMock } from "@/lib/agent/mockAgent";
import { analyzeJobGemini } from "@/lib/agent/geminiAgent";
import { analyzeJobOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateJobAnalysisInput(body);
    const outcome = await runAgentTask({
      routeName: "analyze-job",
      gemini: () => analyzeJobGemini(input),
      openaiCompat: () => analyzeJobOpenAICompat(input),
      mock: () => analyzeJobMock(input),
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
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
