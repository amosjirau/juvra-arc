export type RiskLevel = "low" | "medium" | "high";

export type AgentAction =
  | "release_full"
  | "release_partial"
  | "request_revision"
  | "refund_client"
  | "escalate_admin"
  | "no_action";

export interface JobAnalysisInput {
  jobId?: string;
  title: string;
  description: string;
  budget?: string;
  deadline?: string;
  deliverables?: string[];
  clientAddress?: string;
  freelancerAddress?: string;
}

export interface JobRiskAnalysis {
  riskLevel: RiskLevel;
  clarityScore: number;
  issues: string[];
  suggestedFixes: string[];
  summary: string;
}

export interface DeliveryReviewInput {
  jobTitle: string;
  jobDescription: string;
  expectedDeliverables?: string[];
  deliveryText: string;
  deliveryLinks?: string[];
  deliveryEvidence?: string[];
}

export interface DeliveryReviewResult {
  completionScore: number;
  matchedRequirements: string[];
  missingItems: string[];
  concerns: string[];
  recommendation: AgentAction;
  reasoning: string;
}

export interface DisputeSummaryInput {
  jobTitle: string;
  jobDescription: string;
  clientClaim: string;
  freelancerResponse: string;
  deliveryEvidence?: string[];
  timeline?: string[];
}

export interface DisputeSummaryResult {
  summary: string;
  clientPosition: string;
  freelancerPosition: string;
  keyEvidence: string[];
  unresolvedQuestions: string[];
  recommendedResolution: AgentAction;
  confidence: number;
}

export interface AgentRecommendation {
  suggestedAction: AgentAction;
  confidence: number;
  reasoning: string;
  requiredHumanAction: string;
  safetyNotice: string;
}

export interface ScopeBuilderInput {
  jobId?: string;
  title: string;
  description: string;
  category?: string;
  budget?: string;
  deadline?: string;
  status?: number;
  submissionURI?: string;
  evidence?: unknown[];
}

export interface ScopeBuilderResult {
  suggestedMilestones: string[];
  acceptanceCriteria: string[];
  deliveryRequirements: string[];
  revisionTerms: string[];
  riskNotes: string[];
  suggestedEscrowStructure: string;
  reasoning: string;
  safetyNotice: string;
}
