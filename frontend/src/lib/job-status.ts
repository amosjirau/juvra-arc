export const jobStatuses = [
  "Open",
  "Assigned",
  "Submitted",
  "Approved",
  "Disputed",
  "Refunded",
  "Cancelled",
] as const;

export type JobStatus = (typeof jobStatuses)[number];
export type AgentModeHint = "risk" | "delivery" | "dispute" | "recommendation";

export function getStatusLabel(status: number | undefined) {
  return typeof status === "number" ? jobStatuses[status] ?? "Unknown" : "Unknown";
}

export function isTerminalJobStatus(status: number | undefined) {
  return status === 3 || status === 5 || status === 6;
}

export function getAgentStatusGuidance(status: number | undefined) {
  switch (status) {
    case 0:
      return {
        defaultMode: "risk" as const,
        title: "Open job",
        guidance: "Prioritize scope clarity, deadline quality, and dispute risk before a freelancer is selected.",
      };
    case 1:
      return {
        defaultMode: "delivery" as const,
        title: "Assigned job",
        guidance: "Prioritize deadline readiness, expected deliverables, and delivery evidence preparation.",
      };
    case 2:
      return {
        defaultMode: "delivery" as const,
        title: "Submitted job",
        guidance: "Prioritize delivery review and a release or revision recommendation for the client.",
      };
    case 4:
      return {
        defaultMode: "dispute" as const,
        title: "Disputed job",
        guidance: "Prioritize dispute summary, evidence comparison, and admin review.",
      };
    case 3:
      return {
        defaultMode: "recommendation" as const,
        title: "Approved job",
        guidance: "Show historical analysis only. No new escrow action should be prompted.",
      };
    case 5:
      return {
        defaultMode: "recommendation" as const,
        title: "Refunded job",
        guidance: "Show the final state and historical analysis only. Avoid action prompts.",
      };
    case 6:
      return {
        defaultMode: "recommendation" as const,
        title: "Cancelled job",
        guidance: "Show the final state and historical analysis only. Avoid action prompts.",
      };
    default:
      return {
        defaultMode: "risk" as const,
        title: "Unknown status",
        guidance: "Use conservative analysis and request human review before any escrow action.",
      };
  }
}
