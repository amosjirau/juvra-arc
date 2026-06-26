import { NextResponse } from "next/server";

import { buildScopeGemini } from "@/lib/agent/geminiAgent";
import { buildScopeMock } from "@/lib/agent/mockAgent";
import { buildScopeOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import { runAgentTask } from "@/lib/agent/provider";
import {
  normalizeScopeBuilderResult,
  validateScopeBuilderInput,
} from "@/lib/agent/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateScopeBuilderInput(body);
    const outcome = await runAgentTask({
      routeName: "scope-builder",
      gemini: () => buildScopeGemini(input),
      openaiCompat: () => buildScopeOpenAICompat(input),
      mock: () => buildScopeMock(input),
      normalize: normalizeScopeBuilderResult,
    });

    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to build scope suggestions.",
      },
      { status: 400 }
    );
  }
}
