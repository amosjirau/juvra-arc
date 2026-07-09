"use client";

import { Bot, CheckCircle2, CircleX, RotateCw } from "lucide-react";
import { useCallback, useState } from "react";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import { TxStatus, type TxState } from "@/components/ui/tx-status";
import { useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { errorMessage } from "@/lib/format";
import { hasRecordedVerdict } from "@/lib/job-status";
import {
  juvraEscrowAbi,
  juvraEscrowAddress,
  type JuvraJob,
} from "@/lib/juvraEscrow";

type SettlePhase = "idle" | "settling" | "settled" | "already" | "error";

type SettlementResult = {
  txHash?: `0x${string}`;
  direction?: "release" | "refund";
};

/**
 * Verdict-gated agent settlement. The client records an approve/reject verdict
 * on-chain (a wallet-confirmed tx that moves no funds); once it confirms, the
 * agent autonomously executes the settlement — release on approve, refund on
 * reject. The contract enforces the direction, so the agent can only ever act
 * along the recorded verdict.
 */
export function SettlementActions({
  job,
  isClient,
  onSettled,
}: {
  job: JuvraJob;
  isClient: boolean;
  onSettled: () => void;
}) {
  const verdictTx = useEscrowWrite();
  const [settlePhase, setSettlePhase] = useState<SettlePhase>("idle");
  const [settleError, setSettleError] = useState<string | undefined>();
  const [settlement, setSettlement] = useState<SettlementResult>({});

  const requestAgentSettlement = useCallback(async () => {
    setSettlePhase("settling");
    setSettleError(undefined);

    try {
      const response = await fetch("/api/agent/settle-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id.toString() }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error ?? "Agent settlement failed.");
      }

      if (data.alreadySettled) {
        setSettlePhase("already");
      } else {
        setSettlement({
          txHash: data.settlement?.txHash,
          direction: data.settlement?.direction,
        });
        setSettlePhase("settled");
      }

      onSettled();
    } catch (error) {
      setSettleError(
        error instanceof Error ? error.message : "Agent settlement failed."
      );
      setSettlePhase("error");
      onSettled();
    }
  }, [job.id, onSettled]);

  const handleVerdictConfirmed = useCallback(() => {
    onSettled();
    void requestAgentSettlement();
  }, [onSettled, requestAgentSettlement]);

  useTransactionSuccess(
    verdictTx.transactionHash,
    verdictTx.isSuccess,
    handleVerdictConfirmed
  );

  const recordVerdict = (approved: boolean) => {
    verdictTx.writeContract({
      address: juvraEscrowAddress,
      abi: juvraEscrowAbi,
      functionName: "recordVerdict",
      args: [job.id, approved],
    });
  };

  const verdictTxState: TxState = verdictTx.error
    ? "error"
    : verdictTx.isPending
      ? "pending"
      : verdictTx.isSuccess
        ? "success"
        : "idle";

  const canRecordVerdict = isClient && job.status === 2 && !verdictTx.isPending;
  const awaitingSettlement =
    hasRecordedVerdict(job.status) && settlePhase !== "settling";

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        disabled={!canRecordVerdict}
        onClick={() => recordVerdict(true)}
      >
        <CheckCircle2 className="size-4" />
        {verdictTx.isPending ? "Confirming..." : "Approve — agent releases payment"}
      </Button>
      <Button
        className="w-full border-rose-300/40 bg-rose-500/[0.06] text-rose-700 hover:bg-rose-500/[0.06]"
        disabled={!canRecordVerdict}
        onClick={() => recordVerdict(false)}
        variant="outline"
      >
        <CircleX className="size-4" />
        Reject — agent refunds escrow
      </Button>
      <TxStatus
        status={verdictTxState}
        message={verdictTx.error ? errorMessage(verdictTx.error) : undefined}
        hash={verdictTx.transactionHash}
      />

      {settlePhase === "settling" ? (
        <p className="flex items-center gap-2 rounded-xl border border-status-assigned/25 bg-status-assigned/[0.07] p-3 text-xs leading-5 text-status-assigned">
          <Bot className="size-4 shrink-0 animate-pulse" />
          Verdict recorded on-chain. The agent is executing the settlement…
        </p>
      ) : null}

      {settlePhase === "settled" ? (
        <div className="rounded-xl border border-status-open/30 bg-status-open/[0.07] p-3 text-xs leading-5 text-status-open">
          <p className="flex items-center gap-2 font-medium">
            <Bot className="size-4 shrink-0" />
            Agent settled the escrow autonomously —{" "}
            {settlement.direction === "refund"
              ? "refunded to the client."
              : "released to the freelancer."}
          </p>
          <ArcscanLink className="mt-1" hash={settlement.txHash} />
        </div>
      ) : null}

      {settlePhase === "already" ? (
        <p className="rounded-xl border border-status-open/30 bg-status-open/[0.07] p-3 text-xs leading-5 text-status-open">
          This job is already settled on-chain.
        </p>
      ) : null}

      {settlePhase === "error" ? (
        <p className="rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-xs leading-5 text-rose-700">
          {settleError}
        </p>
      ) : null}

      {awaitingSettlement ? (
        <Button
          className="w-full"
          disabled={settlePhase === ("settling" as SettlePhase)}
          onClick={() => void requestAgentSettlement()}
          variant="outline"
        >
          <RotateCw className="size-4" />
          {job.status === 7
            ? "Trigger agent settlement (release)"
            : "Trigger agent settlement (refund)"}
        </Button>
      ) : null}
    </div>
  );
}
