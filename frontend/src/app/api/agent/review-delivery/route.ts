import { NextResponse } from "next/server";
import { validateDeliveryReviewInput } from "@/lib/agent/schemas";
import { reviewDeliveryMock } from "@/lib/agent/mockAgent";
import { reviewDeliveryGemini, useGeminiAgent } from "@/lib/agent/geminiAgent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateDeliveryReviewInput(body);
    const isGeminiMode = useGeminiAgent();

    if (!isGeminiMode) {
      return NextResponse.json({
        success: true,
        mode: "mock",
        result: reviewDeliveryMock(input),
      });
    }

    try {
      const result = await reviewDeliveryGemini(input);

      return NextResponse.json({
        success: true,
        mode: "gemini",
        result,
      });
    } catch (liveError) {
      console.error("Gemini review-delivery failed:", liveError);

      const fallback = reviewDeliveryMock(input);

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
          error instanceof Error ? error.message : "Failed to review delivery.",
      },
      { status: 400 }
    );
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
