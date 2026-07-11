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
    <Card className="premium-card-hover rounded-[2rem] border-accent-orange/30 bg-accent-orange/[0.06]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ink">
          <ShieldAlert className="size-5 text-accent-orange" />
          Agent suggested action
        </CardTitle>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-orange">
          Agent suggested action - manual confirmation required
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {!recommendation && (
          <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink-soft">
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
            <p className="rounded-xl border border-line bg-paper p-3 text-sm leading-5 text-ink">
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
            <p className="rounded-xl border border-accent-orange/30 bg-accent-orange/[0.06] p-3 text-xs leading-5 text-accent-orange">
              {recommendation.safetyNotice}
            </p>
          </>
        )}

        {(approveTx.error || disputeTx.error || resolveTx.error) && (
          <p className="text-xs text-rose-700">
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
        {job.status === 2 ? "Approve work (manual fallback)" : "Approve work unavailable"}
      </Button>
    );
  }

  if (action === "escalate_admin") {
    if (!isParty) {
      return <UnauthorizedMessage />;
    }

    return (
      <Button
        className="w-full border-accent-orange/30 bg-accent-orange/[0.06] text-accent-orange hover:bg-accent-orange/[0.06]"
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
        className="w-full border-accent-purple/25 bg-accent-purple/[0.06] text-accent-purple hover:bg-accent-purple/[0.06]"
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
        <p className="text-xs text-ink-soft">
          This note is offchain only. Add it to the Evidence panel if it should be saved locally.
        </p>
      </div>
    );
  }

  if (action === "release_partial") {
    return (
      <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink">
        Partial release is advisory only because the current contract action surface does not support partial escrow release.
      </p>
    );
  }

  return (
    <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink">
      No contract action is suggested.
    </p>
  );
}

function UnauthorizedMessage() {
  return (
    <p className="rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-sm text-rose-700">
      You are not authorized to perform this action.
    </p>
  );
}

function GuidedMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-3 ">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
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
