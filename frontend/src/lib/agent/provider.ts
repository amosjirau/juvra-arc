// Strict agent provider architecture.
//
// There is NO silent mock fallback for live mode anymore. The runtime mode is
// explicit:
//   - AGENT_RUNTIME_MODE=live  -> a real provider must run; on failure we return
//     success:false with a clear error (never a faked mock result).
//   - AGENT_RUNTIME_MODE=mock  -> deterministic local mock only (for testing).
//
// Only the *selected* provider (AI_PROVIDER) needs to be configured. xAI and
// Groq are optional and only required when selected.

export type AgentRuntimeMode = "live" | "mock";
export type AgentProviderName = "gemini" | "xai" | "groq" | "mock";

export const LIVE_PROVIDER_FAILED_ERROR =
  "Live AI provider failed. Check API key, quota, model, or billing.";
export const LIVE_PROVIDER_NOT_CONFIGURED_ERROR =
  "No live AI provider is configured. Set AI_PROVIDER and the matching API key, or use AGENT_RUNTIME_MODE=mock for local testing.";

export type AgentTaskSuccess<T> = {
  success: true;
  mode: AgentRuntimeMode;
  provider: AgentProviderName;
  result: T;
};

export type AgentTaskFailure = {
  success: false;
  mode: AgentRuntimeMode;
  provider: AgentProviderName;
  error: string;
  details?: string;
};

export type AgentTaskOutcome<T> = {
  status: number;
  body: AgentTaskSuccess<T> | AgentTaskFailure;
};

export type AgentTaskRequest<T> = {
  routeName: string;
  // The selected-provider implementations. `gemini` is required because it is
  // the primary provider; `openaiCompat` covers the optional xAI/Groq paths.
  gemini: () => Promise<T>;
  openaiCompat?: () => Promise<T>;
  mock: () => T;
  normalize?: (result: T) => T;
};

export function getAgentRuntimeMode(): AgentRuntimeMode {
  const raw = process.env.AGENT_RUNTIME_MODE?.trim().toLowerCase();

  if (raw === "mock") {
    return "mock";
  }

  if (raw === "live") {
    return "live";
  }

  // Unset: pick the safe default. If a real provider is configured we run live;
  // otherwise we fall back to deterministic mock (local dev without keys).
  return isLiveProviderConfigured() ? "live" : "mock";
}

export function getSelectedProvider(): AgentProviderName {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (raw === "gemini") {
    return "gemini";
  }

  if (raw === "xai") {
    return "xai";
  }

  if (raw === "groq") {
    return "groq";
  }

  return "mock";
}

export function getProviderModel(
  provider: AgentProviderName = getSelectedProvider()
): string {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    case "xai":
      return process.env.XAI_MODEL?.trim() || "grok-4-latest";
    case "groq":
      return process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";
    default:
      return "mock";
  }
}

export function getProviderApiKey(
  provider: AgentProviderName = getSelectedProvider()
): string | undefined {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY?.trim() || undefined;
    case "xai":
      return process.env.XAI_API_KEY?.trim() || undefined;
    case "groq":
      return process.env.GROQ_API_KEY?.trim() || undefined;
    default:
      return undefined;
  }
}

export function isLiveProviderConfigured(
  provider: AgentProviderName = getSelectedProvider()
): boolean {
  if (provider === "mock") {
    return false;
  }

  return Boolean(getProviderApiKey(provider));
}

/**
 * Strict task runner used by every /api/agent route.
 *
 * - mock mode: always returns the deterministic mock result.
 * - live mode: runs the selected real provider. If it is not configured or it
 *   throws, returns success:false. It NEVER substitutes a mock result for a
 *   failed live call.
 */
export async function runAgentTask<T>({
  routeName,
  gemini,
  openaiCompat,
  mock,
  normalize,
}: AgentTaskRequest<T>): Promise<AgentTaskOutcome<T>> {
  const mode = getAgentRuntimeMode();
  const provider = getSelectedProvider();

  if (mode === "mock") {
    return {
      status: 200,
      body: {
        success: true,
        mode: "mock",
        provider: "mock",
        result: applyNormalize(mock(), normalize),
      },
    };
  }

  // Live mode from here on.
  if (provider === "mock" || !isLiveProviderConfigured(provider)) {
    return {
      status: 503,
      body: {
        success: false,
        mode: "live",
        provider,
        error: LIVE_PROVIDER_NOT_CONFIGURED_ERROR,
        details: developmentDetail(
          `AGENT_RUNTIME_MODE=live but provider "${provider}" has no API key configured for ${routeName}.`
        ),
      },
    };
  }

  try {
    const raw = await runSelectedLiveProvider(provider, { gemini, openaiCompat });

    return {
      status: 200,
      body: {
        success: true,
        mode: "live",
        provider,
        result: applyNormalize(raw, normalize),
      },
    };
  } catch (error) {
    logLiveProviderError(routeName, provider, error);

    return {
      status: 502,
      body: {
        success: false,
        mode: "live",
        provider,
        error: LIVE_PROVIDER_FAILED_ERROR,
        details: developmentDetail(getSafeProviderError(error)),
      },
    };
  }
}

async function runSelectedLiveProvider<T>(
  provider: AgentProviderName,
  fns: { gemini: () => Promise<T>; openaiCompat?: () => Promise<T> }
): Promise<T> {
  if (provider === "gemini") {
    return fns.gemini();
  }

  if (provider === "xai" || provider === "groq") {
    if (!fns.openaiCompat) {
      throw new Error(
        `Provider "${provider}" is selected but this route has no OpenAI-compatible implementation.`
      );
    }

    return fns.openaiCompat();
  }

  throw new Error(`Unsupported live provider: ${provider}`);
}

export function getProviderDebugInfo() {
  const provider = getSelectedProvider();

  return {
    runtimeMode: getAgentRuntimeMode(),
    selectedProvider: provider,
    selectedModel: getProviderModel(provider),
    liveProviderConfigured: isLiveProviderConfigured(provider),
    optionalProviders: ["gemini", "xai", "groq"] as const,
  };
}

function applyNormalize<T>(result: T, normalize?: (result: T) => T) {
  return normalize ? normalize(result) : result;
}

export function developmentDetail(message: string): string | undefined {
  return process.env.NODE_ENV === "development" ? message : undefined;
}

function logLiveProviderError(
  routeName: string,
  provider: AgentProviderName,
  error: unknown
) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      `Live agent provider "${provider}" failed for ${routeName}:`,
      error
    );
  } else {
    console.error(`Live agent provider "${provider}" failed for ${routeName}.`);
  }
}

export function getSafeProviderError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/key=[^&\s]+/gi, "key=[redacted]");
}
