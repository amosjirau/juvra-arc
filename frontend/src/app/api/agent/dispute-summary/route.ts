import { NextResponse } from "next/server";
import { validateDisputeSummaryInput } from "@/lib/agent/schemas";
import { summarizeDisputeMock } from "@/lib/agent/mockAgent";
import { summarizeDisputeGemini } from "@/lib/agent/geminiAgent";
import { runAgentProvider } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDisputeSummaryInput(body);
    const providerResult = await runAgentProvider({
      gemini: () => summarizeDisputeGemini(input),
      mock: () => summarizeDisputeMock(input),
      routeName: "dispute-summary",
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
            : "Failed to summarize dispute.",
      },
      { status: 400 }
    );
  }
}
