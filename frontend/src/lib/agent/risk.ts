import { RiskLevel } from "./agentTypes";

export function calculateClarityScore(
  description: string,
  deadline?: string,
  deliverables?: string[]
) {
  let score = 100;

  const cleanDescription = description || "";
  const lower = cleanDescription.toLowerCase();

  if (!cleanDescription || cleanDescription.length < 80) score -= 35;
  if (!deadline) score -= 20;
  if (!deliverables || deliverables.length === 0) score -= 20;
  if (!lower.includes("revision")) score -= 10;
  if (!lower.includes("deliver")) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "low";
  if (score >= 45) return "medium";
  return "high";
}

export function detectJobIssues(
  description: string,
  deadline?: string,
  deliverables?: string[]
) {
  const issues: string[] = [];
  const cleanDescription = description || "";
  const lower = cleanDescription.toLowerCase();

  if (!cleanDescription || cleanDescription.length < 80) {
    issues.push("Job description is too short and may cause misunderstanding.");
  }

  if (!deadline) {
    issues.push("No clear deadline was provided.");
  }

  if (!deliverables || deliverables.length === 0) {
    issues.push("Deliverables are not clearly listed.");
  }

  if (!lower.includes("revision")) {
    issues.push("Revision terms are not mentioned.");
  }

  if (!lower.includes("deliver")) {
    issues.push("Final delivery expectations are not clearly described.");
  }

  return issues;
}

export function suggestJobFixes(issues: string[]) {
  return issues.map((issue) => {
    if (issue.toLowerCase().includes("deadline")) {
      return "Add a specific deadline or milestone date.";
    }

    if (issue.toLowerCase().includes("deliverables")) {
      return "List the exact files, links, or completed work expected.";
    }

    if (issue.toLowerCase().includes("revision")) {
      return "State how many revisions are included before extra payment is required.";
    }

    if (issue.toLowerCase().includes("description")) {
      return "Expand the job description with scope, acceptance criteria, and examples.";
    }

    return "Clarify this requirement before escrow is funded.";
  });
}
