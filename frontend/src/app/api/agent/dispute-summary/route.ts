import { NextResponse } from "next/server";
import { validateDisputeSummaryInput } from "@/lib/agent/schemas";
import { summarizeDisputeMock } from "@/lib/agent/mockAgent";
import { summarizeDisputeGemini } from "@/lib/agent/geminiAgent";
import { summarizeDisputeOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDisputeSummaryInput(body);
    const outcome = await runAgentTask({
      routeName: "dispute-summary",
      gemini: () => summarizeDisputeGemini(input),
      openaiCompat: () => summarizeDisputeOpenAICompat(input),
      mock: () => summarizeDisputeMock(input),
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
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
