import {
  AgentRecommendation,
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

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}

export function getGeminiModel() {
  return getGeminiModels()[0];
}

export function getGeminiModels() {
  return [
    process.env.GEMINI_MODEL,
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
  ].reduce<string[]>((models, model) => {
    const cleanModel = model?.trim();

    if (cleanModel && !models.includes(cleanModel)) {
      models.push(cleanModel);
    }

    return models;
  }, []);
}

export function useGeminiAgent() {
  return (
    process.env.NEXT_PUBLIC_AGENT_MODE === "live" &&
    process.env.AI_PROVIDER === "gemini" &&
    Boolean(process.env.GEMINI_API_KEY)
  );
}

function getGeminiUrl(apiKey: string, model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
}

class GeminiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly model?: string,
    readonly mode?: "schema" | "plain",
    readonly responseText?: string
  ) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

type GeminiGenerationConfig = {
  temperature: number;
  responseMimeType: "application/json";
  responseSchema?: Record<string, unknown>;
};

type GeminiPart = {
  text?: unknown;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
};

function extractTextFromGemini(data: unknown): string {
  const response = data as GeminiResponse;
  const parts = response.candidates?.[0]?.content?.parts;
  const text = parts
    ?.map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new Error("No text returned from Gemini.");
  }

  return text;
}

function cleanGeminiJsonText(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseGeminiJson<T>(data: unknown): T {
  const rawText = extractTextFromGemini(data);
  const cleaned = cleanGeminiJsonText(rawText);

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini JSON. Raw text starts with: ${cleaned.slice(
        0,
        300
      )}`,
      { cause: error }
    );
  }
}

function buildGeminiPrompt(task: string, input: unknown) {
  return `${ESCROW_AGENT_SYSTEM_PROMPT}

Task:
${task}

Input JSON:
${JSON.stringify(input, null, 2)}

Return only valid JSON. No markdown. No code fences. No explanation.`;
}

async function requestGeminiJson<T>(
  model: string,
  task: string,
  input: unknown,
  generationConfig: GeminiGenerationConfig,
  mode: "schema" | "plain"
) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const response = await fetch(getGeminiUrl(apiKey, model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildGeminiPrompt(task, input),
            },
          ],
        },
      ],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new GeminiRequestError(
      `Gemini request failed for ${model}: ${response.status} ${errorText}`,
      response.status,
      model,
      mode,
      errorText
    );
  }

  const data = await response.json();
  return parseGeminiJson<T>(data);
}

function shouldRetryWithoutSchema(error: unknown) {
  const message =
    error instanceof GeminiRequestError
      ? error.responseText ?? error.message
      : error instanceof Error
        ? error.message
        : String(error);

  return ["responseSchema", "schema", "INVALID_ARGUMENT", "400"].some((term) =>
    message.includes(term)
  );
}

function isGeminiQuotaError(error: unknown) {
  if (error instanceof GeminiRequestError && error.status === 429) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota exceeded") ||
    message.includes("Quota exceeded") ||
    message.includes("429")
  );
}

function summarizeGeminiError(error: unknown) {
  if (error instanceof GeminiRequestError) {
    return `${error.model ?? "unknown"} ${error.mode ?? "unknown"}${
      error.status ? ` status ${error.status}` : ""
    }: ${error.message.slice(0, 500)}`;
  }

  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return String(error).slice(0, 500);
}

function getGeminiStatus(error: unknown) {
  return error instanceof GeminiRequestError ? error.status : undefined;
}

function buildAllModelsFailedError(models: string[], errors: unknown[]) {
  const finalStatus = [...errors]
    .reverse()
    .map((error) => getGeminiStatus(error))
    .find((status): status is number => typeof status === "number");
  const errorSummary = errors.map(summarizeGeminiError).join(" | ");

  return new Error(
    `All Gemini models failed; mock fallback should be used. Attempted models: ${models.join(
      ", "
    )}. Final status code: ${finalStatus ?? "unknown"}. Errors: ${errorSummary}`
  );
}

async function callGeminiJson<T>(
  task: string,
  input: unknown,
  schema: Record<string, unknown>
): Promise<T> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const models = getGeminiModels();
  const errors: unknown[] = [];

  for (const model of models) {
    try {
      return await requestGeminiJson<T>(
        model,
        task,
        input,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
        "schema"
      );
    } catch (schemaError) {
      errors.push(schemaError);

      if (isGeminiQuotaError(schemaError)) {
        continue;
      }

      if (!shouldRetryWithoutSchema(schemaError)) {
        continue;
      }
    }

    try {
      return await requestGeminiJson<T>(
        model,
        task,
        input,
        {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
        "plain"
      );
    } catch (plainError) {
      errors.push(plainError);
    }
  }

  throw buildAllModelsFailedError(models, errors);
}

const stringSchema = { type: "STRING" };

const actionEnum = [
  "release_full",
  "release_partial",
  "request_revision",
  "refund_client",
  "escalate_admin",
  "no_action",
];

const jobRiskSchema = {
  type: "OBJECT",
  properties: {
    riskLevel: {
      type: "STRING",
      enum: ["low", "medium", "high"],
    },
    clarityScore: {
      type: "NUMBER",
    },
    issues: {
      type: "ARRAY",
      items: stringSchema,
    },
    suggestedFixes: {
      type: "ARRAY",
      items: stringSchema,
    },
    summary: stringSchema,
  },
  required: ["riskLevel", "clarityScore", "issues", "suggestedFixes", "summary"],
};

const deliveryReviewSchema = {
  type: "OBJECT",
  properties: {
    completionScore: {
      type: "NUMBER",
    },
    matchedRequirements: {
      type: "ARRAY",
      items: stringSchema,
    },
    missingItems: {
      type: "ARRAY",
      items: stringSchema,
    },
    concerns: {
      type: "ARRAY",
      items: stringSchema,
    },
    recommendation: {
      type: "STRING",
      enum: actionEnum,
    },
    reasoning: stringSchema,
  },
  required: [
    "completionScore",
    "matchedRequirements",
    "missingItems",
    "concerns",
    "recommendation",
    "reasoning",
  ],
};

const disputeSummarySchema = {
  type: "OBJECT",
  properties: {
    summary: stringSchema,
    clientPosition: stringSchema,
    freelancerPosition: stringSchema,
    keyEvidence: {
      type: "ARRAY",
      items: stringSchema,
    },
    unresolvedQuestions: {
      type: "ARRAY",
      items: stringSchema,
    },
    recommendedResolution: {
      type: "STRING",
      enum: actionEnum,
    },
    confidence: {
      type: "NUMBER",
    },
  },
  required: [
    "summary",
    "clientPosition",
    "freelancerPosition",
    "keyEvidence",
    "unresolvedQuestions",
    "recommendedResolution",
    "confidence",
  ],
};

const recommendationSchema = {
  type: "OBJECT",
  properties: {
    suggestedAction: {
      type: "STRING",
      enum: actionEnum,
    },
    confidence: {
      type: "NUMBER",
    },
    reasoning: stringSchema,
    requiredHumanAction: stringSchema,
    safetyNotice: stringSchema,
  },
  required: [
    "suggestedAction",
    "confidence",
    "reasoning",
    "requiredHumanAction",
    "safetyNotice",
  ],
};

const scopeBuilderSchema = {
  type: "OBJECT",
  properties: {
    suggestedMilestones: {
      type: "ARRAY",
      items: stringSchema,
    },
    acceptanceCriteria: {
      type: "ARRAY",
      items: stringSchema,
    },
    deliveryRequirements: {
      type: "ARRAY",
      items: stringSchema,
    },
    revisionTerms: {
      type: "ARRAY",
      items: stringSchema,
    },
    riskNotes: {
      type: "ARRAY",
      items: stringSchema,
    },
    suggestedEscrowStructure: stringSchema,
    reasoning: stringSchema,
    safetyNotice: stringSchema,
  },
  required: [
    "suggestedMilestones",
    "acceptanceCriteria",
    "deliveryRequirements",
    "revisionTerms",
    "riskNotes",
    "suggestedEscrowStructure",
    "reasoning",
    "safetyNotice",
  ],
};

export async function analyzeJobGemini(
  input: JobAnalysisInput
): Promise<JobRiskAnalysis> {
  return callGeminiJson<JobRiskAnalysis>(
    "Analyze this freelance escrow job for clarity, scope quality, missing terms, and dispute risk. Do not invent facts. Do not move funds.",
    input,
    jobRiskSchema
  );
}

export async function reviewDeliveryGemini(
  input: DeliveryReviewInput
): Promise<DeliveryReviewResult> {
  return callGeminiJson<DeliveryReviewResult>(
    "Review this freelancer delivery against the original job requirements. Identify matched requirements, missing items, concerns, and the safest human action.",
    input,
    deliveryReviewSchema
  );
}

export async function summarizeDisputeGemini(
  input: DisputeSummaryInput
): Promise<DisputeSummaryResult> {
  return callGeminiJson<DisputeSummaryResult>(
    "Summarize this freelance escrow dispute fairly for human admin review. Compare the client claim, freelancer response, original scope, and available evidence.",
    input,
    disputeSummarySchema
  );
}

export async function recommendActionGemini(context: {
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
  return callGeminiJson<AgentRecommendation>(
    "Recommend the safest human action for this escrow case using the job context, previous agent results, evidence, status, submission URI, deadline, and connected wallet role. Return suggestedAction only from the allowed enum. The agent cannot release funds, refund funds, sign transactions, select freelancers, resolve disputes, or make final legal decisions.",
    context,
    recommendationSchema
  );
}

export async function buildScopeGemini(
  input: ScopeBuilderInput
): Promise<ScopeBuilderResult> {
  return callGeminiJson<ScopeBuilderResult>(
    "Act as a safe agentic freelance commerce coordinator. Suggest clearer milestones, acceptance criteria, delivery requirements, revision terms, risk notes, and escrow breakdown for this Arc escrow job. The output is advisory only. Do not claim escrow was modified. Do not select freelancers, release funds, refund funds, resolve disputes, or sign transactions.",
    input,
    scopeBuilderSchema
  );
}
