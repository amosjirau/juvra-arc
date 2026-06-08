"use client";

import { Gavel, ShieldAlert } from "lucide-react";
import type { Address } from "viem";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSameAddress, useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { errorMessage } from "@/lib/format";
import { juvraEscrowAbi, juvraEscrowAddress, type JuvraJob } from "@/lib/juvraEscrow";

export function DisputePanel({
  job,
  walletAddress,
  arbitrator,
  onSettled,
}: {
  job: JuvraJob;
  walletAddress?: Address;
  arbitrator?: Address;
  onSettled?: () => void;
}) {
  const disputeTx = useEscrowWrite();
  const resolveTx = useEscrowWrite();
  const isParty = isSameAddress(walletAddress, job.client) || isSameAddress(walletAddress, job.freelancer);
  const canRaise = isParty && (job.status === 1 || job.status === 2);
  const canResolve = job.status === 4 && isSameAddress(walletAddress, arbitrator);

  useTransactionSuccess(disputeTx.transactionHash, disputeTx.isSuccess, onSettled);
  useTransactionSuccess(resolveTx.transactionHash, resolveTx.isSuccess, onSettled);

  return (
    <Card className="premium-card-hover border-white/10 bg-white/[0.045]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldAlert className="size-5 text-amber-200" />
          Dispute center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          Clients or selected freelancers can raise a dispute after assignment. The configured
          arbitrator can resolve funds to either side.
        </p>
        <Button
          className="w-full border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
          disabled={!canRaise || disputeTx.isPending}
          onClick={() =>
            disputeTx.writeContract({
              address: juvraEscrowAddress,
              abi: juvraEscrowAbi,
              functionName: "raiseDispute",
              args: [job.id],
            })
          }
          variant="outline"
        >
          <Gavel className="size-4" />
          {disputeTx.isPending ? "Raising dispute..." : "Raise dispute"}
        </Button>
        {disputeTx.isSuccess && <p className="text-xs text-emerald-300">Dispute raised.</p>}
        {disputeTx.error && (
          <p className="text-xs text-rose-300">{errorMessage(disputeTx.error)}</p>
        )}
        <ArcscanLink hash={disputeTx.transactionHash} />

        {job.status === 4 && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              disabled={!canResolve || resolveTx.isPending}
              onClick={() =>
                resolveTx.writeContract({
                  address: juvraEscrowAddress,
                  abi: juvraEscrowAbi,
                  functionName: "resolveDispute",
                  args: [job.id, true],
                })
              }
              variant="outline"
            >
              Client wins
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-300 to-cyan-300 text-slate-950"
              disabled={!canResolve || resolveTx.isPending}
              onClick={() =>
                resolveTx.writeContract({
                  address: juvraEscrowAddress,
                  abi: juvraEscrowAbi,
                  functionName: "resolveDispute",
                  args: [job.id, false],
                })
              }
            >
              Freelancer wins
            </Button>
          </div>
        )}
        {resolveTx.isSuccess && <p className="text-xs text-emerald-300">Dispute resolved.</p>}
        {resolveTx.error && (
          <p className="text-xs text-rose-300">{errorMessage(resolveTx.error)}</p>
        )}
        <ArcscanLink hash={resolveTx.transactionHash} />
      </CardContent>
    </Card>
  );
}
