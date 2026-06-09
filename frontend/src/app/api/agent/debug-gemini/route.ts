import { NextResponse } from "next/server";

import { getGeminiModel, getGeminiModels } from "@/lib/agent/geminiAgent";
import { getProviderDebugInfo } from "@/lib/agent/provider";

export async function GET() {
  return NextResponse.json({
    success: true,
    ...getProviderDebugInfo(),
    agentMode: process.env.NEXT_PUBLIC_AGENT_MODE,
    aiProvider: process.env.AI_PROVIDER,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: getGeminiModel(),
    fallbackModels: getGeminiModels(),
  });
}
