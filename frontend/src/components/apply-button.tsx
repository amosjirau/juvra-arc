"use client";

import { Send } from "lucide-react";
import { useAccount } from "wagmi";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import { isSameAddress, useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { errorMessage } from "@/lib/format";
import { juvraEscrowAbi, juvraEscrowAddress, type JuvraJob } from "@/lib/juvraEscrow";

export function ApplyButton({ job, onSettled }: { job: JuvraJob; onSettled?: () => void }) {
  const { address, isConnected } = useAccount();
  const tx = useEscrowWrite();
  const isClient = isSameAddress(address, job.client);
  const canApply = isConnected && job.status === 0 && !isClient;

  useTransactionSuccess(tx.transactionHash, tx.isSuccess, onSettled);

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={!canApply || tx.isPending}
        onClick={() =>
          tx.writeContract({
            address: juvraEscrowAddress,
            abi: juvraEscrowAbi,
            functionName: "applyForJob",
            args: [job.id],
          })
        }
      >
        <Send className="size-4" />
        {tx.isPending ? "Applying..." : "Apply for job"}
      </Button>
      {!isConnected && <p className="text-xs text-ink-soft">Connect a wallet to apply.</p>}
      {isClient && <p className="text-xs text-ink-soft">Clients cannot apply to their own jobs.</p>}
      {tx.isSuccess && <p className="text-xs text-emerald-700">Application submitted.</p>}
      {tx.error && <p className="text-xs text-rose-700">{errorMessage(tx.error)}</p>}
      <ArcscanLink hash={tx.transactionHash} />
    </div>
  );
}
