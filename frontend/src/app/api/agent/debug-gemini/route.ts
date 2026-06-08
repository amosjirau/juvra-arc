import { NextResponse } from "next/server";

import { getGeminiModel, getGeminiModels } from "@/lib/agent/geminiAgent";

export async function GET() {
  return NextResponse.json({
    success: true,
    agentMode: process.env.NEXT_PUBLIC_AGENT_MODE,
    aiProvider: process.env.AI_PROVIDER,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: getGeminiModel(),
    fallbackModels: getGeminiModels(),
  });
}
