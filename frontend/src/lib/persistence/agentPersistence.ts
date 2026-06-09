import {
  clearAgentResult,
  loadAgentResult,
  saveAgentResult,
  type AgentStorageType,
  type SavedAgentResult,
} from "@/lib/agent/storage";
import {
  EVIDENCE_CHANGED_EVENT,
  loadJobEvidence,
  saveJobEvidence,
  type EvidenceItem,
  type JobEvidenceStore,
} from "@/lib/agent/evidence";

/*
Future Supabase tables:

agent_runs:
- id
- job_id
- wallet_address
- type
- input_json
- output_json
- mode
- created_at

job_notes:
- id
- job_id
- author_wallet
- note_type
- content
- evidence_url
- created_at
*/

export type PersistenceMode = "localStorage" | "supabase";

export type AgentRunInput<TInput extends object, TOutput extends object> = {
  input?: TInput;
  jobId: string | number | bigint;
  mode?: string;
  result: TOutput;
  type: AgentStorageType;
  walletAddress?: string;
};

export type AgentRun<TOutput extends object> = SavedAgentResult<TOutput> & {
  input?: object;
  mode?: string;
  walletAddress?: string;
};

export function getActivePersistenceMode(): PersistenceMode {
  return hasSupabaseEnv() ? "localStorage" : "localStorage";
}

export function saveAgentRun<TInput extends object, TOutput extends object>({
  jobId,
  result,
  type,
}: AgentRunInput<TInput, TOutput>) {
  return saveAgentResult(type, jobId, result);
}

export function loadAgentRun<TOutput extends object>(
  type: AgentStorageType,
  jobId?: string | number | bigint | null
) {
  return loadAgentResult<TOutput>(type, jobId);
}

export function clearAgentRun(
  type: AgentStorageType,
  jobId?: string | number | bigint | null
) {
  clearAgentResult(type, jobId);
}

export function saveEvidenceItems(
  jobId: string | number | bigint,
  items: EvidenceItem[]
) {
  const normalizedJobId = jobId.toString();
  const current = loadJobEvidence(normalizedJobId);
  const now = new Date().toISOString();
  const store: JobEvidenceStore = {
    jobId: normalizedJobId,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    items,
  };

  return saveJobEvidence(store);
}

export function loadEvidenceItems(jobId?: string | number | bigint | null) {
  return loadJobEvidence(jobId)?.items ?? [];
}

export function clearEvidenceItems(jobId?: string | number | bigint | null) {
  const normalizedJobId = jobId?.toString().trim();

  if (!normalizedJobId || typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`juvra-evidence-${normalizedJobId}`);
  window.dispatchEvent(
    new CustomEvent(EVIDENCE_CHANGED_EVENT, {
      detail: { jobId: normalizedJobId },
    })
  );
}

export async function saveAgentRunSupabasePlaceholder() {
  // TODO: Create a Supabase client lazily here once @supabase/supabase-js
  // is intentionally added and NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
  // are configured. Do not import Supabase at module scope.
  return null;
}

export async function loadAgentRunSupabasePlaceholder() {
  // TODO: Read from agent_runs when Supabase persistence is enabled.
  return null;
}

export async function saveEvidenceSupabasePlaceholder() {
  // TODO: Write evidence/job notes into job_notes when Supabase is enabled.
  return null;
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
