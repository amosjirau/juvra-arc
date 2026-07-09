// OpenAI-compatible live providers (xAI Grok and Groq).
//
// Both expose an OpenAI-style /chat/completions endpoint with JSON-object
// response formatting, so a single client covers both. These providers are
// OPTIONAL: they are only used when AI_PROVIDER=xai or AI_PROVIDER=groq.

import {
  AgentRecommendation,
  AgentVerificationInput,
  AgentVerificationResult,
  DeliveryReviewInput,
  DeliveryReviewResult,
  DisputeSummaryInput,
  DisputeSummaryResult,
  JobAnalysisInput,
  JobRiskAnalysis,
  ScopeBuilderInput,
  ScopeBuilderResult,
} from "./agentTypes";
import { ESCROW_AGENT_SYSTEM_PROMPT } from "./prompts";
import {
  getProviderApiKey,
  getProviderModel,
  getSelectedProvider,
  type AgentProviderName,
} from "./provider";

const OPENAI_COMPAT_ENDPOINTS: Record<"xai" | "groq", string> = {
  xai: "https://api.x.ai/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
};

function resolveOpenAICompatProvider(): "xai" | "groq" {
  const provider = getSelectedProvider();

  if (provider === "xai" || provider === "groq") {
    return provider;
  }

  throw new Error(
    `OpenAI-compatible client called while AI_PROVIDER is "${provider}".`
  );
}

type OpenAICompatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

function extractContent(data: unknown): string {
  const response = data as OpenAICompatResponse;
  const content = response.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("No content returned from the OpenAI-compatible provider.");
  }

  return content.trim();
}

function cleanJsonText(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJson<T>(text: string): T {
  const cleaned = cleanJsonText(text);

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse provider JSON. Raw text starts with: ${cleaned.slice(
        0,
        300
      )}`,
      { cause: error }
    );
  }
}

function buildPrompt(task: string, input: unknown, jsonHint: string) {
  return `Task:
${task}

Input JSON:
${JSON.stringify(input, null, 2)}

Return ONLY a valid JSON object with this exact shape:
${jsonHint}

No markdown. No code fences. No commentary.`;
}

async function callOpenAICompatJson<T>(
  task: string,
  input: unknown,
  jsonHint: string
): Promise<T> {
  const provider = resolveOpenAICompatProvider();
  const apiKey = getProviderApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `${provider.toUpperCase()}_API_KEY is missing for AI_PROVIDER=${provider}.`
    );
  }

  const model = getProviderModel(provider);
  const response = await fetch(OPENAI_COMPAT_ENDPOINTS[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ESCROW_AGENT_SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(task, input, jsonHint) },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${provider} request failed for ${model}: ${response.status} ${errorText.slice(
        0,
        500
      )}`
    );
  }

  const data = await response.json();
  return parseJson<T>(extractContent(data));
}

/**
 * Lightweight readiness check for the selected OpenAI-compatible provider.
 * Throws if the provider cannot respond. Never exposes the API key.
 */
export async function pingOpenAICompat(): Promise<void> {
  const provider = resolveOpenAICompatProvider();
  const apiKey = getProviderApiKey(provider);

  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()}_API_KEY is missing.`);
  }

  const model = getProviderModel(provider);
  const response = await fetch(OPENAI_COMPAT_ENDPOINTS[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with the single word OK." }],
      temperature: 0,
      max_tokens: 5,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${provider} health check failed for ${model}: ${response.status} ${errorText.slice(
        0,
        300
      )}`
    );
  }
}

const jobRiskHint = `{
  "riskLevel": "low | medium | high",
  "clarityScore": number (0-100),
  "issues": string[],
  "suggestedFixes": string[],
  "summary": string
}`;

const deliveryReviewHint = `{
  "completionScore": number (0-100),
  "matchedRequirements": string[],
  "missingItems": string[],
  "concerns": string[],
  "recommendation": "release_full | release_partial | request_revision | refund_client | escalate_admin | no_action",
  "reasoning": string
}`;

const disputeSummaryHint = `{
  "summary": string,
  "clientPosition": string,
  "freelancerPosition": string,
  "keyEvidence": string[],
  "unresolvedQuestions": string[],
  "recommendedResolution": "release_full | release_partial | request_revision | refund_client | escalate_admin | no_action",
  "confidence": number (0-1)
}`;

const recommendationHint = `{
  "suggestedAction": "release_full | release_partial | request_revision | refund_client | escalate_admin | no_action",
  "confidence": number (0-1),
  "reasoning": string,
  "requiredHumanAction": string,
  "safetyNotice": string
}`;

const scopeBuilderHint = `{
  "suggestedMilestones": string[],
  "acceptanceCriteria": string[],
  "deliveryRequirements": string[],
  "revisionTerms": string[],
  "riskNotes": string[],
  "suggestedEscrowStructure": string,
  "reasoning": string,
  "safetyNotice": string
}`;

const verificationHint = `{
  "verificationId": string,
  "verificationCostUSDC": string,
  "verificationStatus": "passed | warning | failed | needs_review",
  "checkedSignals": string[],
  "findings": string[],
  "riskFlags": string[],
  "settlementImpact": "supports_release | supports_revision | supports_dispute_review | inconclusive",
  "receipt": { "jobId": string, "timestamp": string, "agent": string, "costUSDC": string, "memo": string },
  "safetyNotice": string
}`;

export async function analyzeJobOpenAICompat(
  input: JobAnalysisInput
): Promise<JobRiskAnalysis> {
  return callOpenAICompatJson<JobRiskAnalysis>(
    "Analyze this freelance escrow job for clarity, scope quality, missing terms, and dispute risk. Do not invent facts. Do not move funds.",
    input,
    jobRiskHint
  );
}

export async function reviewDeliveryOpenAICompat(
  input: DeliveryReviewInput
): Promise<DeliveryReviewResult> {
  return callOpenAICompatJson<DeliveryReviewResult>(
    "Review this freelancer delivery against the original job requirements. Identify matched requirements, missing items, concerns, and the safest human action.",
    input,
    deliveryReviewHint
  );
}

export async function summarizeDisputeOpenAICompat(
  input: DisputeSummaryInput
): Promise<DisputeSummaryResult> {
  return callOpenAICompatJson<DisputeSummaryResult>(
    "Summarize this freelance escrow dispute fairly for human admin review. Compare the client claim, freelancer response, original scope, and available evidence.",
    input,
    disputeSummaryHint
  );
}

export async function recommendActionOpenAICompat(context: {
  riskLevel?: string;
  completionScore?: number;
  disputeRaised?: boolean;
  job?: Record<string, unknown>;
  riskAnalysis?: Record<string, unknown>;
  deliveryReview?: Record<string, unknown>;
  disputeSummary?: Record<string, unknown>;
  evidence?: unknown[];
  walletRole?: string;
}): Promise<AgentRecommendation> {
  return callOpenAICompatJson<AgentRecommendation>(
    "Recommend the safest human action for this escrow case using the job context, previous agent results, evidence, status, submission URI, deadline, and connected wallet role. Return suggestedAction only from the allowed enum. The agent executes escrow settlement only after a party records an approve/reject verdict on-chain, and the contract fixes the settlement direction to that verdict. The agent cannot choose recipients, sign for users, select freelancers, resolve disputes, or make final legal decisions.",
    context,
    recommendationHint
  );
}

export async function buildScopeOpenAICompat(
  input: ScopeBuilderInput
): Promise<ScopeBuilderResult> {
  return callOpenAICompatJson<ScopeBuilderResult>(
    "Act as a safe agentic freelance commerce coordinator. Suggest clearer milestones, acceptance criteria, delivery requirements, revision terms, risk notes, and escrow breakdown for this Arc escrow job. The output is advisory only. Do not claim escrow was modified. Do not select freelancers, release funds, refund funds, resolve disputes, or sign transactions.",
    input,
    scopeBuilderHint
  );
}

export async function verifyEvidenceOpenAICompat(
  input: AgentVerificationInput
): Promise<AgentVerificationResult> {
  return callOpenAICompatJson<AgentVerificationResult>(
    "Run an advisory evidence verification workflow for a freelance escrow job. Review delivery text and evidence items, identify checked signals, findings, risk flags, verification status, settlement impact, and a USDC-denominated verification receipt. The agent may prepare or record a verification payment receipt, but must not release escrow, refund escrow, sign wallet transactions, select freelancers, or resolve disputes.",
    input,
    verificationHint
  );
}

export type { AgentProviderName };
