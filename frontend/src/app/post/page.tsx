"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  LockKeyhole,
  Tag,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ArcscanLink } from "@/components/arcscan-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/format";
import { arcTestnet } from "@/lib/arc";
import {
  JUVRA_ESCROW_ABI,
  JUVRA_ESCROW_ADDRESS,
  JUVRA_ESCROW_CONFIG_ERROR,
  isJuvraEscrowConfigured,
} from "@/lib/contract";

export default function PostPage() {
  const { chainId, isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [descriptionURI, setDescriptionURI] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");

  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
  });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isTransactionPending = write.isPending;
  const isConfirming = Boolean(write.data && receipt.isLoading);
  const isBusy = isTransactionPending || isConfirming;
  const hasSucceeded = receipt.isSuccess;
  const contractReady = isJuvraEscrowConfigured;
  const isArcTestnet = chainId === arcTestnet.id;

  useEffect(() => {
    if (write.error) {
      console.error("postJob wallet/write error", write.error);
    }
  }, [write.error]);

  useEffect(() => {
    if (receipt.error) {
      console.error("postJob receipt error", receipt.error);
    }
  }, [receipt.error]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!isConnected) {
      setFormError("Connect your wallet before posting a job.");
      return;
    }

    if (!isArcTestnet) {
      setFormError(`Switch your wallet to Arc Testnet (chain ID ${arcTestnet.id}).`);
      return;
    }

    if (!contractReady) {
      setFormError(JUVRA_ESCROW_CONFIG_ERROR);
      return;
    }

    const escrowAddress = JUVRA_ESCROW_ADDRESS;
    if (!escrowAddress) {
      setFormError(JUVRA_ESCROW_CONFIG_ERROR);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedDescriptionURI = descriptionURI.trim();

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

    const selectedDeadline = new Date(`${deadline}T23:59:59`);
    const deadlineSeconds = Math.floor(selectedDeadline.getTime() / 1000);

    if (!Number.isFinite(deadlineSeconds)) {
      setFormError("Choose a valid deadline date.");
      return;
    }

    if (deadlineSeconds <= Math.floor(Date.now() / 1000)) {
      setFormError("Deadline must be a future date.");
      return;
    }

    let value: bigint;

    try {
      value = parseEther(amount);
    } catch {
      setFormError("Enter a valid USDC amount.");
      return;
    }

    if (value <= 0n) {
      setFormError("Escrow amount must be greater than zero.");
      return;
    }

    try {
      await write.writeContractAsync({
        address: escrowAddress,
        abi: JUVRA_ESCROW_ABI,
        functionName: "postJob",
        args: [
          trimmedTitle,
          trimmedCategory,
          trimmedDescriptionURI,
          BigInt(deadlineSeconds),
        ],
        value,
      });
    } catch (error) {
      console.error("postJob transaction failed", {
        error,
        address: escrowAddress,
        functionName: "postJob",
        args: [
          trimmedTitle,
          trimmedCategory,
          trimmedDescriptionURI,
          BigInt(deadlineSeconds),
        ],
        value,
      });
      setFormError(errorMessage(error as { message?: string }));
    }
  }

  return (
    <main className="min-h-screen text-white">
      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_18%_12%,rgba(217,70,239,0.16),transparent_25rem),radial-gradient(circle_at_82%_5%,rgba(99,102,241,0.16),transparent_24rem)]" />
        <div>
          <div className="mb-6">
            <div className="eyebrow mb-4">
              <LockKeyhole className="size-4" />
              Native USDC escrow on Arc Testnet
            </div>
            <h1 className="font-display heading-gradient text-4xl font-semibold tracking-normal sm:text-5xl">
              Post a Job
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
              Define the work, set the deadline, and lock funds into escrow so
              freelancers can apply with confidence.
            </p>
          </div>

          <Card className="rounded-[2rem] border-white/10 bg-white/[0.05] shadow-2xl shadow-black/20">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-2 text-white">
                <CircleDollarSign className="size-5 text-emerald-300" />
                Lock Funds & Post Job
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Funds are sent as native Arc Testnet USDC with the job creation transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form className="grid gap-5" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-zinc-300">
                    Title
                    <Input
                      className="h-11"
                      disabled={isBusy}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Build an escrow dashboard"
                      required
                      value={title}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-zinc-300">
                    Category
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        className="h-11 pl-9"
                        disabled={isBusy}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Frontend, design, Solidity"
                        required
                        value={category}
                      />
                    </div>
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-zinc-300">
                  Description URI
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 size-4 text-zinc-500" />
                    <Textarea
                      className="min-h-28 pl-9"
                      disabled={isBusy}
                      onChange={(event) => setDescriptionURI(event.target.value)}
                      placeholder="ipfs://... or https://..."
                      required
                      value={descriptionURI}
                    />
                  </div>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-zinc-300">
                    Amount in USDC
                    <div className="relative">
                      <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        className="h-11 pl-9"
                        disabled={isBusy}
                        min="0"
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="2500"
                        required
                        step="0.000001"
                        type="number"
                        value={amount}
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-zinc-300">
                    Deadline date
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        className="h-11 pl-9"
                        disabled={isBusy}
                        min={today}
                        onChange={(event) => setDeadline(event.target.value)}
                        required
                        type="date"
                        value={deadline}
                      />
                    </div>
                  </label>
                </div>

                {!isConnected && (
                  <div className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100">
                    Connect your wallet to lock funds and post this job.
                  </div>
                )}

                {(formError || write.error || receipt.error) && (
                  <div className="flex gap-3 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{formError || errorMessage(write.error ?? receipt.error)}</p>
                  </div>
                )}

                {hasSucceeded && (
                  <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="size-4" />
                      Job posted successfully.
                    </div>
                    <ArcscanLink className="mt-3" hash={write.data} />
                  </div>
                )}

                <Button
                  className="h-11 text-base"
                  disabled={!isConnected || isBusy}
                  type="submit"
                >
                  {isTransactionPending && <Loader2 className="size-4 animate-spin" />}
                  {isConfirming && <Loader2 className="size-4 animate-spin" />}
                  {!isBusy && <LockKeyhole className="size-4" />}
                  {isTransactionPending
                    ? "Waiting for wallet..."
                    : isConfirming
                      ? "Confirming on Arc..."
                      : "Lock Funds & Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="premium-card-hover rounded-[2rem] border-white/10 bg-white/[0.045]">
            <CardHeader>
              <CardTitle className="text-white">Wallet</CardTitle>
              <CardDescription className="text-zinc-400">
                Connect an Arc Testnet wallet before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton accountStatus="address" chainStatus="full" showBalance={false} />
            </CardContent>
          </Card>

          <Card className="premium-card-hover rounded-[2rem] border-white/10 bg-black/20">
            <CardHeader>
              <CardTitle className="text-white">Escrow flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <p>1. Your wallet signs the job creation transaction.</p>
              <p>2. The USDC amount is locked as native value.</p>
              <p>3. Freelancers apply once the job is live.</p>
              <p>4. Payment is released after approval.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
