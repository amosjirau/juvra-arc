"use client";

import { FormEvent, useState } from "react";
import { CircleDollarSign, PlusCircle } from "lucide-react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEscrowWrite } from "@/hooks/use-juvra-escrow";
import { useTransactionSuccess } from "@/hooks/use-transaction-success";
import { arcTestnet } from "@/lib/arc";
import {
  JUVRA_ESCROW_ABI,
  JUVRA_ESCROW_ADDRESS,
  JUVRA_ESCROW_CONFIG_ERROR,
  isJuvraEscrowConfigured,
} from "@/lib/contract";
import { errorMessage } from "@/lib/format";

export function PostJobForm() {
  const { chainId, isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [descriptionURI, setDescriptionURI] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const tx = useEscrowWrite();

  useTransactionSuccess(tx.transactionHash, tx.isSuccess, () => {
    setTitle("");
    setCategory("");
    setDescriptionURI("");
    setDeadline("");
    setAmount("");
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescriptionURI = descriptionURI.trim();
    const deadlineSeconds = Math.floor(new Date(deadline).getTime() / 1000);
    let value: bigint;

    try {
      value = parseEther(amount);
    } catch {
      setFormError("Enter a valid USDC amount.");
      return;
    }

    if (!isConnected) {
      setFormError("Connect your wallet before posting a job.");
      return;
    }

    if (chainId !== arcTestnet.id) {
      setFormError(`Switch your wallet to Arc Testnet (chain ID ${arcTestnet.id}).`);
      return;
    }

    if (!isJuvraEscrowConfigured || !JUVRA_ESCROW_ADDRESS) {
      setFormError(JUVRA_ESCROW_CONFIG_ERROR);
      return;
    }

    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    if (!trimmedCategory) {
      setFormError("Category is required.");
      return;
    }

    if (!trimmedDescriptionURI) {
      setFormError("Description URI is required.");
      return;
    }

    if (!Number.isFinite(deadlineSeconds) || deadlineSeconds <= Math.floor(Date.now() / 1000)) {
      setFormError("Deadline must be in the future.");
      return;
    }

    if (value <= 0n) {
      setFormError("Escrow amount must be greater than zero.");
      return;
    }

    tx.writeContract({
      address: JUVRA_ESCROW_ADDRESS,
      abi: JUVRA_ESCROW_ABI,
      functionName: "postJob",
      args: [trimmedTitle, trimmedCategory, trimmedDescriptionURI, BigInt(deadlineSeconds)],
      value,
    });
  }

  return (
    <Card className="border-white/10 bg-white/[0.05] shadow-2xl shadow-black/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CircleDollarSign className="size-5 text-emerald-300" />
          Lock funds and post a job
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-zinc-300">
              Title
              <Input
                className="h-11"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Build a dashboard for Juvra"
                required
                value={title}
              />
            </label>
            <label className="space-y-2 text-sm text-zinc-300">
              Category
              <Input
                className="h-11"
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Design, smart contracts, frontend"
                required
                value={category}
              />
            </label>
          </div>
          <label className="space-y-2 text-sm text-zinc-300">
            Description URI
            <Textarea
              className="min-h-24"
              onChange={(event) => setDescriptionURI(event.target.value)}
              placeholder="ipfs://job-description"
              required
              value={descriptionURI}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-zinc-300">
              Deadline
              <Input
                className="h-11"
                min={new Date().toISOString().slice(0, 16)}
                onChange={(event) => setDeadline(event.target.value)}
                required
                type="datetime-local"
                value={deadline}
              />
            </label>
            <label className="space-y-2 text-sm text-zinc-300">
              Escrow amount
              <Input
                className="h-11"
                min="0"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="2500"
                required
                step="0.000001"
                type="number"
                value={amount}
              />
            </label>
          </div>
          <Button
            className="h-11"
            disabled={tx.isPending}
            type="submit"
          >
            <PlusCircle className="size-4" />
            {tx.isPending ? "Posting job..." : "Post job with native USDC"}
          </Button>
          {tx.isSuccess && <p className="text-sm text-emerald-300">Job posted successfully.</p>}
          {(formError || tx.error) && (
            <p className="text-sm text-rose-300">{formError || errorMessage(tx.error)}</p>
          )}
          <ArcscanLink hash={tx.transactionHash} />
        </form>
      </CardContent>
    </Card>
  );
}
