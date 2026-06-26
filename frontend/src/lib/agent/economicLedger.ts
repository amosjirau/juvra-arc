export type AgentEconomicActionType =
  | "verification_payment"
  | "risk_check"
  | "evidence_check"
  | "settlement_recommendation";

export type AgentEconomicActionStatus =
  | "simulated"
  | "prepared"
  | "completed"
  | "failed";

export type AgentEconomicAction = {
  id: string;
  jobId: string;
  type: AgentEconomicActionType;
  amountUSDC: string;
  status: AgentEconomicActionStatus;
  createdAt: string;
  description: string;
  receipt: object;
};

const LEDGER_KEY_PREFIX = "juvra-agent-economic-actions";

export function saveAgentEconomicAction(action: AgentEconomicAction) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalizedJobId = normalizeJobId(action.jobId);

  if (!normalizedJobId) {
    return null;
  }

  const cleanAction: AgentEconomicAction = {
    ...action,
    jobId: normalizedJobId,
  };
  const actions = loadAgentEconomicActions(normalizedJobId);
  const nextActions = [
    cleanAction,
    ...actions.filter((item) => item.id !== cleanAction.id),
  ];

  try {
    window.localStorage.setItem(
      getLedgerKey(normalizedJobId),
      JSON.stringify(nextActions)
    );

    return cleanAction;
  } catch {
    return null;
  }
}

export function loadAgentEconomicActions(jobId: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const normalizedJobId = normalizeJobId(jobId);

  if (!normalizedJobId) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getLedgerKey(normalizedJobId));

    if (!raw) {
      return [];
    }

    const saved = JSON.parse(raw);

    if (!Array.isArray(saved)) {
      throw new Error("Invalid ledger payload.");
    }

    return saved.filter(isValidAgentEconomicAction);
  } catch {
    window.localStorage.removeItem(getLedgerKey(normalizedJobId));
    return [];
  }
}

export function clearAgentEconomicActions(jobId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedJobId = normalizeJobId(jobId);

  if (!normalizedJobId) {
    return;
  }

  window.localStorage.removeItem(getLedgerKey(normalizedJobId));
}

function getLedgerKey(jobId: string) {
  return `${LEDGER_KEY_PREFIX}-${jobId}`;
}

function normalizeJobId(jobId: string) {
  return jobId.toString().trim();
}

function isValidAgentEconomicAction(value: unknown): value is AgentEconomicAction {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const action = value as AgentEconomicAction;

  return (
    typeof action.id === "string" &&
    typeof action.jobId === "string" &&
    [
      "verification_payment",
      "risk_check",
      "evidence_check",
      "settlement_recommendation",
    ].includes(action.type) &&
    ["simulated", "prepared", "completed", "failed"].includes(action.status) &&
    typeof action.amountUSDC === "string" &&
    typeof action.createdAt === "string" &&
    typeof action.description === "string" &&
    typeof action.receipt === "object" &&
    action.receipt !== null &&
    !Array.isArray(action.receipt)
  );
}
