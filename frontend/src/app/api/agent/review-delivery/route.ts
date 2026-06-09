import { NextResponse } from "next/server";
import { validateDeliveryReviewInput } from "@/lib/agent/schemas";
import { reviewDeliveryMock } from "@/lib/agent/mockAgent";
import { reviewDeliveryGemini } from "@/lib/agent/geminiAgent";
import { runAgentProvider } from "@/lib/agent/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDeliveryReviewInput(body);
    const providerResult = await runAgentProvider({
      gemini: () => reviewDeliveryGemini(input),
      mock: () => reviewDeliveryMock(input),
      routeName: "review-delivery",
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
          error instanceof Error ? error.message : "Failed to review delivery.",
      },
      { status: 400 }
    );
  }
}
