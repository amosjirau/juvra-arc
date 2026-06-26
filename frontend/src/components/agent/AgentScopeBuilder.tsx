"use client";

import { Bot, Loader2, Network, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvidenceItem } from "@/lib/agent/evidence";
import type { ScopeBuilderResult } from "@/lib/agent/agentTypes";

type ScopeBuilderJob = {
  id?: string;
  title?: string;
  description?: string;
  descriptionURI?: string;
  category?: string;
  budget?: string;
  deadline?: string;
  status?: number;
  submissionURI?: string;
};

type AgentResponse =
  | {
      success: true;
      mode?: "live" | "mock";
      provider?: "gemini" | "xai" | "groq" | "mock";
      result: ScopeBuilderResult;
    }
  | {
      success: false;
      error?: string;
    };

export function AgentScopeBuilder({
  evidence = [],
  job,
}: {
  evidence?: EvidenceItem[];
  job: ScopeBuilderJob;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"live" | "mock" | null>(null);
  const [result, setResult] = useState<ScopeBuilderResult | null>(null);

  async function buildScope() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/scope-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title || "Untitled job",
          description:
            job.description ||
            job.descriptionURI ||
            "No written scope was provided.",
          category: job.category,
          budget: job.budget,
          deadline: job.deadline,
          status: job.status,
          submissionURI: job.submissionURI,
          evidence,
        }),
      });
      const data = (await response.json()) as AgentResponse;

      if (!response.ok) {
        throw new Error("Could not build scope.");
      }

      if (!data.success) {
        throw new Error(data.error || "Could not build scope.");
      }

      setMode(data.mode ?? null);
      setResult(data.result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not build scope suggestions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="premium-card-hover rounded-[2rem] border-cyan-200/10 bg-white/[0.045]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100">
              <Network className="size-3.5" />
              Agent Scope Builder
            </div>
            <CardTitle className="text-white">
              Structure work before settlement
            </CardTitle>
          </div>
          <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            Human-confirmed
          </Badge>
        </div>
        <p className="text-sm leading-6 text-zinc-400">
          AI suggests milestones, acceptance criteria, evidence requirements,
          revision terms, and escrow breakdowns. It never modifies the contract
          or triggers a wallet action.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            className="bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 hover:from-cyan-200 hover:to-sky-300"
            disabled={loading}
            onClick={buildScope}
            type="button"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading
              ? "Building..."
              : result
                ? "Re-run scope builder"
                : "Build safer scope"}
          </Button>
          <span className="text-xs text-zinc-500">
            Agent-assisted, human-confirmed coordination.
          </span>
        </div>

        {mode && (
          <p className="text-xs text-zinc-500">
            Provider mode: <span className="text-cyan-100">{mode}</span>
          </p>
        )}
        {error && (
          <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <ResultList
              items={result.suggestedMilestones}
              title="Suggested milestones"
            />
            <ResultList
              items={result.acceptanceCriteria}
              title="Acceptance criteria"
            />
            <ResultList
              items={result.deliveryRequirements}
              title="Delivery requirements"
            />
            <ResultList items={result.revisionTerms} title="Revision terms" />
            <ResultList items={result.riskNotes} title="Risk notes" />

            <ResultBlock
              title="Suggested escrow structure"
              value={result.suggestedEscrowStructure}
            />
            <ResultBlock title="Reasoning" value={result.reasoning} />
            <div className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm leading-6 text-amber-100">
              {result.safetyNotice}
            </div>
          </div>
        )}

        {!result && !error && (
          <div className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-400">
            <Bot className="mt-0.5 size-4 shrink-0 text-cyan-100" />
            <p>
              Use this before freelancer selection, delivery review, or dispute
              escalation to turn loose work into reviewable commerce terms.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <ul className="space-y-2 text-sm leading-6 text-zinc-300">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <p className="text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}
