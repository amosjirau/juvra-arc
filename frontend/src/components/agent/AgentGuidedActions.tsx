"use client";

import { CheckCircle2, Gavel, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import type { Address } from "viem";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { isSameAddress, useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import type { AgentRecommendation } from "@/lib/agent/agentTypes";
import {
  AGENT_RESULT_CHANGED_EVENT,
  loadAgentResult,
} from "@/lib/agent/storage";
import { normalizeRecommendationResult } from "@/lib/agent/schemas";
import { errorMessage } from "@/lib/format";
import {
  juvraEscrowAbi,
  juvraEscrowAddress,
  type JuvraJob,
} from "@/lib/juvraEscrow";

export function AgentGuidedActions({
  arbitrator,
  job,
  onSettled,
  walletAddress,
}: {
  arbitrator?: Address;
  job: JuvraJob;
  onSettled?: () => void;
  walletAddress?: Address;
}) {
  const [recommendation, setRecommendation] =
    useState<AgentRecommendation | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const approveTx = useEscrowWrite();
  const disputeTx = useEscrowWrite();
  const resolveTx = useEscrowWrite();
  const jobId = job.id.toString();

  useEffect(() => {
    function loadRecommendation() {
      const saved = loadAgentResult<AgentRecommendation>(
        "recommendation",
        jobId
      );

      setRecommendation(
        saved?.result ? normalizeRecommendationResult(saved.result) : null
      );
    }

    function onStorageChange(event: StorageEvent) {
      if (event.key === `juvra-agent-recommendation-${jobId}`) {
        loadRecommendation();
      }
    }

    function onAgentResultChanged(event: Event) {
      const detail = (event as CustomEvent).detail as
        | { jobId?: string; type?: string }
        | undefined;

      if (detail?.jobId === jobId && detail.type === "recommendation") {
        loadRecommendation();
      }
    }

    loadRecommendation();
    window.addEventListener("storage", onStorageChange);
    window.addEventListener(AGENT_RESULT_CHANGED_EVENT, onAgentResultChanged);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener(
        AGENT_RESULT_CHANGED_EVENT,
        onAgentResultChanged
      );
    };
  }, [jobId]);

  useTransactionSuccess(approveTx.transactionHash, approveTx.isSuccess, onSettled);
  useTransactionSuccess(disputeTx.transactionHash, disputeTx.isSuccess, onSettled);
  useTransactionSuccess(resolveTx.transactionHash, resolveTx.isSuccess, onSettled);

  const action = recommendation?.suggestedAction;
  const isClient = isSameAddress(walletAddress, job.client);
  const isParty =
    isClient || isSameAddress(walletAddress, job.freelancer);
  const isArbitrator = isSameAddress(walletAddress, arbitrator);

  return (
    <Card className="premium-card-hover rounded-[2rem] border-amber-200/20 bg-amber-200/[0.055]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldAlert className="size-5 text-amber-100" />
          Agent suggested action
        </CardTitle>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-100/80">
          Agent suggested action - manual confirmation required
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!recommendation && (
          <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-400">
            Run the Recommendation tab in the agent workspace to show guided manual actions here.
          </p>
        )}

        {recommendation && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <GuidedMetric
                label="Suggested"
                value={formatAgentAction(recommendation.suggestedAction)}
              />
              <GuidedMetric
                label="Confidence"
                value={`${Math.round(recommendation.confidence * 100)}%`}
              />
            </div>
            <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-5 text-zinc-300">
              {recommendation.requiredHumanAction}
            </p>
            {renderGuidedAction({
              action,
              approveTx,
              disputeTx,
              isArbitrator,
              isClient,
              isParty,
              job,
              resolveTx,
              revisionNote,
              setRevisionNote,
            })}
            <p className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-xs leading-5 text-amber-100">
              {recommendation.safetyNotice}
            </p>
          </>
        )}

        {(approveTx.error || disputeTx.error || resolveTx.error) && (
          <p className="text-xs text-rose-300">
            {errorMessage(approveTx.error ?? disputeTx.error ?? resolveTx.error)}
          </p>
        )}
        <ArcscanLink
          hash={
            approveTx.transactionHash ??
            disputeTx.transactionHash ??
            resolveTx.transactionHash
          }
        />
      </CardContent>
    </Card>
  );
}

function renderGuidedAction({
  action,
  approveTx,
  disputeTx,
  isArbitrator,
  isClient,
  isParty,
  job,
  resolveTx,
  revisionNote,
  setRevisionNote,
}: {
  action?: AgentRecommendation["suggestedAction"];
  approveTx: ReturnType<typeof useEscrowWrite>;
  disputeTx: ReturnType<typeof useEscrowWrite>;
  isArbitrator: boolean;
  isClient: boolean;
  isParty: boolean;
  job: JuvraJob;
  resolveTx: ReturnType<typeof useEscrowWrite>;
  revisionNote: string;
  setRevisionNote: (value: string) => void;
}) {
  if (action === "release_full") {
    if (!isClient) {
      return <UnauthorizedMessage />;
    }

    return (
      <Button
        className="w-full"
        disabled={job.status !== 2 || approveTx.isPending}
        onClick={() =>
          approveTx.writeContract({
            address: juvraEscrowAddress,
            abi: juvraEscrowAbi,
            functionName: "approveWork",
            args: [job.id],
          })
        }
        type="button"
      >
        {approveTx.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {job.status === 2 ? "Approve work" : "Approve work unavailable"}
      </Button>
    );
  }

  if (action === "escalate_admin") {
    if (!isParty) {
      return <UnauthorizedMessage />;
    }

    return (
      <Button
        className="w-full border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
        disabled={!(job.status === 1 || job.status === 2) || disputeTx.isPending}
        onClick={() =>
          disputeTx.writeContract({
            address: juvraEscrowAddress,
            abi: juvraEscrowAbi,
            functionName: "raiseDispute",
            args: [job.id],
          })
        }
        type="button"
        variant="outline"
      >
        {disputeTx.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Gavel className="size-4" />
        )}
        {job.status === 1 || job.status === 2
          ? "Raise dispute"
          : "Raise dispute unavailable"}
      </Button>
    );
  }

  if (action === "refund_client") {
    if (!isArbitrator) {
      return <UnauthorizedMessage />;
    }

    return (
      <Button
        className="w-full border-sky-300/30 bg-sky-300/10 text-sky-100 hover:bg-sky-300/20"
        disabled={job.status !== 4 || resolveTx.isPending}
        onClick={() =>
          resolveTx.writeContract({
            address: juvraEscrowAddress,
            abi: juvraEscrowAbi,
            functionName: "resolveDispute",
            args: [job.id, true],
          })
        }
        type="button"
        variant="outline"
      >
        {resolveTx.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Gavel className="size-4" />
        )}
        {job.status === 4 ? "Resolve for client" : "Client refund unavailable"}
      </Button>
    );
  }

  if (action === "request_revision") {
    return (
      <div className="space-y-2">
        <Textarea
          className="min-h-[84px]"
          onChange={(event) => setRevisionNote(event.target.value)}
          placeholder="Offchain revision note"
          value={revisionNote}
        />
        <p className="text-xs text-zinc-500">
          This note is offchain only. Add it to the Evidence panel if it should be saved locally.
        </p>
      </div>
    );
  }

  if (action === "release_partial") {
    return (
      <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-300">
        Partial release is advisory only because the current contract action surface does not support partial escrow release.
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-300">
      No contract action is suggested.
    </p>
  );
}

function UnauthorizedMessage() {
  return (
    <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
      You are not authorized to perform this action.
    </p>
  );
}

function GuidedMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3 shadow-inner shadow-black/10">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function formatAgentAction(action: AgentRecommendation["suggestedAction"]) {
  const labels: Record<AgentRecommendation["suggestedAction"], string> = {
    escalate_admin: "Escalate to admin",
    no_action: "No action needed",
    refund_client: "Refund client",
    release_full: "Release full payment",
    release_partial: "Release partial payment",
    request_revision: "Request revision",
  };

  return labels[action];
}
