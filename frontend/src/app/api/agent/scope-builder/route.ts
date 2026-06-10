import { NextResponse } from "next/server";

import { buildScopeGemini } from "@/lib/agent/geminiAgent";
import { buildScopeMock } from "@/lib/agent/mockAgent";
import { runAgentProvider } from "@/lib/agent/provider";
import {
  normalizeScopeBuilderResult,
  validateScopeBuilderInput,
} from "@/lib/agent/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateScopeBuilderInput(body);
    const providerResult = await runAgentProvider({
      gemini: () => buildScopeGemini(input),
      mock: () => buildScopeMock(input),
      normalize: normalizeScopeBuilderResult,
      routeName: "scope-builder",
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
            : "Failed to build scope suggestions.",
      },
      { status: 400 }
    );
  }
}
