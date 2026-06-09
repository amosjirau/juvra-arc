export type AgentProvider = "gemini" | "mock" | "groq" | "openrouter";
export type AgentProviderMode = "gemini" | "mock" | "mock_fallback";

export type AgentProviderResult<T> = {
  mode: AgentProviderMode;
  result: T;
  warning?: string;
  developmentError?: string;
};

export type AgentProviderRequest<T> = {
  gemini: () => Promise<T>;
  mock: () => T;
  normalize?: (result: T) => T;
  routeName: string;
};

export async function runAgentProvider<T>({
  gemini,
  mock,
  normalize,
  routeName,
}: AgentProviderRequest<T>): Promise<AgentProviderResult<T>> {
  const provider = getConfiguredAgentProvider();

  if (provider !== "gemini") {
    return {
      mode: "mock",
      result: normalizeResult(mock(), normalize),
    };
  }

  try {
    return {
      mode: "gemini",
      result: normalizeResult(await gemini(), normalize),
    };
  } catch (error) {
    logDevelopmentProviderError(routeName, error);

    return {
      mode: "mock_fallback",
      result: normalizeResult(mock(), normalize),
      warning: "Gemini failed. Mock fallback was used.",
      developmentError:
        process.env.NODE_ENV === "development"
          ? getSafeProviderError(error)
          : undefined,
    };
  }
}

export function getConfiguredAgentProvider(): AgentProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  // Future provider placeholders:
  // - groq: simple fetch-based implementation can be added here later.
  // - openrouter: simple fetch-based implementation can be added here later.
  // Do not add provider SDK imports until they are intentionally installed.

  return "mock";
}

export function getProviderDebugInfo() {
  return {
    configuredProvider: process.env.AI_PROVIDER ?? "mock",
    activeProvider: getConfiguredAgentProvider(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    futureProviders: ["groq", "openrouter"] as const,
  };
}

function normalizeResult<T>(result: T, normalize?: (result: T) => T) {
  return normalize ? normalize(result) : result;
}

function logDevelopmentProviderError(routeName: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`Agent provider failed for ${routeName}:`, error);
  } else {
    console.error(`Agent provider failed for ${routeName}.`);
  }
}

function getSafeProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/key=[^&\s]+/gi, "key=[redacted]");
}
