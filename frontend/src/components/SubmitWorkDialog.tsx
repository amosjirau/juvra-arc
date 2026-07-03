"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { errorMessage } from "@/lib/format";
import { juvraEscrowAbi, juvraEscrowAddress, type JuvraJob } from "@/lib/juvraEscrow";

export function SubmitWorkDialog({
  job,
  disabled,
  onSettled,
}: {
  job: JuvraJob;
  disabled?: boolean;
  onSettled?: () => void;
}) {
  const [submissionURI, setSubmissionURI] = useState("");
  const tx = useEscrowWrite();

  useTransactionSuccess(tx.transactionHash, tx.isSuccess, () => {
    setSubmissionURI("");
    onSettled?.();
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full bg-gradient-to-r from-accent-purple to-accent-purple text-white">
          <UploadCloud className="size-4" />
          Submit work
        </Button>
      </DialogTrigger>
      <DialogContent className="border-line bg-[#0b101a]/95 text-ink shadow-2xl shadow-black/40 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Submit work</DialogTitle>
          <DialogDescription>
            Add an IPFS, Arweave, GitHub, or document URI for the completed work.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            className="h-11"
            onChange={(event) => setSubmissionURI(event.target.value)}
            placeholder="ipfs://submission"
            value={submissionURI}
          />
          <Button
            className="w-full"
            disabled={!submissionURI.trim() || tx.isPending}
            onClick={() =>
              tx.writeContract({
                address: juvraEscrowAddress,
                abi: juvraEscrowAbi,
                functionName: "submitWork",
                args: [job.id, submissionURI.trim()],
              })
            }
          >
            {tx.isPending ? "Submitting..." : "Confirm submission"}
          </Button>
          {tx.isSuccess && <p className="text-xs text-emerald-700">Work submitted.</p>}
          {tx.error && <p className="text-xs text-rose-700">{errorMessage(tx.error)}</p>}
          <ArcscanLink hash={tx.transactionHash} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
