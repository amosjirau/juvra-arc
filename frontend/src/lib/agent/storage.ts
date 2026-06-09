export type AgentStorageType =
  | "risk"
  | "delivery"
  | "dispute"
  | "recommendation";

export type SavedAgentResult<T extends object> = {
  jobId: string;
  type: AgentStorageType;
  createdAt: string;
  result: T;
};

export const AGENT_RESULT_CHANGED_EVENT = "juvra-agent-result-changed";

const agentStorageTypes: AgentStorageType[] = [
  "risk",
  "delivery",
  "dispute",
  "recommendation",
];

export function getAgentStorageKey(
  type: AgentStorageType,
  jobId?: string | number | bigint | null
) {
  const normalizedJobId = normalizeJobId(jobId);

  return normalizedJobId ? `juvra-agent-${type}-${normalizedJobId}` : null;
}

export function loadAgentResult<T extends object>(
  type: AgentStorageType,
  jobId?: string | number | bigint | null
) {
  const key = getAgentStorageKey(type, jobId);
  const normalizedJobId = normalizeJobId(jobId);

  if (!key || !normalizedJobId || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw) as SavedAgentResult<T>;

    if (
      !saved ||
      typeof saved !== "object" ||
      saved.jobId !== normalizedJobId ||
      saved.type !== type ||
      typeof saved.createdAt !== "string" ||
      !("result" in saved) ||
      typeof saved.result !== "object" ||
      saved.result === null
    ) {
      throw new Error("Invalid saved agent result.");
    }

    return saved;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveAgentResult<T extends object>(
  type: AgentStorageType,
  jobId: string | number | bigint | null | undefined,
  result: T
) {
  const key = getAgentStorageKey(type, jobId);
  const normalizedJobId = normalizeJobId(jobId);

  if (!key || !normalizedJobId || typeof window === "undefined") {
    return null;
  }

  const saved: SavedAgentResult<T> = {
    jobId: normalizedJobId,
    type,
    createdAt: new Date().toISOString(),
    result,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(saved));
    dispatchAgentResultChanged(type, normalizedJobId);
    return saved;
  } catch {
    return null;
  }
}

export function clearAgentResult(
  type: AgentStorageType,
  jobId?: string | number | bigint | null
) {
  const key = getAgentStorageKey(type, jobId);

  if (!key || typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
  dispatchAgentResultChanged(type, normalizeJobId(jobId));
}

export function clearAllAgentResults(
  jobId?: string | number | bigint | null
) {
  if (typeof window === "undefined") {
    return;
  }

  agentStorageTypes.forEach((type) => clearAgentResult(type, jobId));
}

function normalizeJobId(jobId?: string | number | bigint | null) {
  const normalizedJobId = jobId?.toString().trim();

  return normalizedJobId || null;
}

function dispatchAgentResultChanged(
  type: AgentStorageType,
  jobId: string | null
) {
  if (typeof window === "undefined" || !jobId) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AGENT_RESULT_CHANGED_EVENT, {
      detail: { jobId, type },
    })
  );
}
