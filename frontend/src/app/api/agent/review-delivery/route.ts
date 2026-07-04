import { NextResponse } from "next/server";
import { validateDeliveryReviewInput } from "@/lib/agent/schemas";
import { reviewDeliveryMock } from "@/lib/agent/mockAgent";
import { reviewDeliveryGemini } from "@/lib/agent/geminiAgent";
import { reviewDeliveryOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDeliveryReviewInput(body);
    const outcome = await runAgentTask({
      routeName: "review-delivery",
      gemini: () => reviewDeliveryGemini(input),
      openaiCompat: () => reviewDeliveryOpenAICompat(input),
      mock: () => reviewDeliveryMock(input),
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to review delivery.",
      },
      { status: 400 }
    );
  }
}
