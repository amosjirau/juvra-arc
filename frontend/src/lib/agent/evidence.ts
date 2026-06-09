export type EvidenceType = "delivery" | "dispute" | "revision" | "admin";

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  submittedBy?: string;
  evidenceUrl?: string;
  note?: string;
  createdAt: string;
};

export type JobEvidenceStore = {
  jobId: string;
  createdAt: string;
  updatedAt: string;
  items: EvidenceItem[];
};

export const EVIDENCE_CHANGED_EVENT = "juvra-evidence-changed";

export function getEvidenceStorageKey(jobId?: string | number | bigint | null) {
  const normalizedJobId = normalizeJobId(jobId);

  return normalizedJobId ? `juvra-evidence-${normalizedJobId}` : null;
}

export function loadJobEvidence(jobId?: string | number | bigint | null) {
  const key = getEvidenceStorageKey(jobId);
  const normalizedJobId = normalizeJobId(jobId);

  if (!key || !normalizedJobId || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw) as JobEvidenceStore;

    if (!isValidEvidenceStore(saved, normalizedJobId)) {
      throw new Error("Invalid saved evidence.");
    }

    return saved;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveJobEvidence(store: JobEvidenceStore) {
  const key = getEvidenceStorageKey(store.jobId);

  if (!key || typeof window === "undefined") {
    return null;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(store));
    dispatchEvidenceChanged(store.jobId);
    return store;
  } catch {
    return null;
  }
}

export function createEvidenceItem({
  evidenceUrl,
  note,
  submittedBy,
  type,
}: {
  evidenceUrl?: string;
  note?: string;
  submittedBy?: string;
  type: EvidenceType;
}): EvidenceItem {
  return {
    id: getRandomId(),
    type,
    submittedBy,
    evidenceUrl,
    note,
    createdAt: new Date().toISOString(),
  };
}

export function upsertEvidenceItems(
  jobId: string | number | bigint | null | undefined,
  items: EvidenceItem[]
) {
  const normalizedJobId = normalizeJobId(jobId);

  if (!normalizedJobId || items.length === 0) {
    return null;
  }

  const current = loadJobEvidence(normalizedJobId);
  const now = new Date().toISOString();
  const next: JobEvidenceStore = {
    jobId: normalizedJobId,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    items: [...(current?.items ?? []), ...items],
  };

  return saveJobEvidence(next);
}

export function deleteEvidenceItem(
  jobId: string | number | bigint | null | undefined,
  evidenceId: string
) {
  const normalizedJobId = normalizeJobId(jobId);

  if (!normalizedJobId) {
    return null;
  }

  const current = loadJobEvidence(normalizedJobId);

  if (!current) {
    return null;
  }

  const next: JobEvidenceStore = {
    ...current,
    updatedAt: new Date().toISOString(),
    items: current.items.filter((item) => item.id !== evidenceId),
  };

  return saveJobEvidence(next);
}

function normalizeJobId(jobId?: string | number | bigint | null) {
  const normalizedJobId = jobId?.toString().trim();

  return normalizedJobId || null;
}

function getRandomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidEvidenceStore(value: unknown, jobId: string): value is JobEvidenceStore {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const store = value as JobEvidenceStore;

  return (
    store.jobId === jobId &&
    typeof store.createdAt === "string" &&
    typeof store.updatedAt === "string" &&
    Array.isArray(store.items) &&
    store.items.every(isValidEvidenceItem)
  );
}

function isValidEvidenceItem(value: unknown): value is EvidenceItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as EvidenceItem;

  return (
    typeof item.id === "string" &&
    ["delivery", "dispute", "revision", "admin"].includes(item.type) &&
    typeof item.createdAt === "string" &&
    (item.submittedBy === undefined || typeof item.submittedBy === "string") &&
    (item.evidenceUrl === undefined || typeof item.evidenceUrl === "string") &&
    (item.note === undefined || typeof item.note === "string")
  );
}

function dispatchEvidenceChanged(jobId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(EVIDENCE_CHANGED_EVENT, {
      detail: { jobId },
    })
  );
}
