import { NextResponse } from "next/server";

import { pingGemini } from "@/lib/agent/geminiAgent";
import { pingOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import {
  developmentDetail,
  getAgentRuntimeMode,
  getProviderModel,
  getSafeProviderError,
  getSelectedProvider,
  isLiveProviderConfigured,
} from "@/lib/agent/provider";

// Verifies that the selected live AI provider can actually respond.
// Never returns or logs the API key.
export async function GET() {
  const mode = getAgentRuntimeMode();
  const provider = getSelectedProvider();
  const model = getProviderModel(provider);

  if (provider === "mock" || !isLiveProviderConfigured(provider)) {
    return NextResponse.json(
      {
        success: false,
        mode,
        provider,
        model,
        liveProviderReady: false,
        error:
          "No live AI provider is configured. Set AI_PROVIDER and the matching API key.",
      },
      { status: 503 }
    );
  }

  try {
    if (provider === "gemini") {
      await pingGemini();
    } else {
      await pingOpenAICompat();
    }

    return NextResponse.json({
      success: true,
      mode,
      provider,
      model,
      liveProviderReady: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        mode,
        provider,
        model,
        liveProviderReady: false,
        error: "Live AI provider failed. Check API key, quota, model, or billing.",
        details: developmentDetail(getSafeProviderError(error)),
      },
      { status: 503 }
    );
  }
}
