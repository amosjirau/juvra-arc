"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { CTAButton } from "@/components/ui/cta-button";
import { FormFieldGroup } from "@/components/ui/form-field-group";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus, type TxState } from "@/components/ui/tx-status";
import { WalletStatusCard } from "@/components/ui/wallet-status-card";
import { errorMessage } from "@/lib/format";
import { arcTestnet } from "@/lib/arc";
import {
  JUVRA_ESCROW_ABI,
  JUVRA_ESCROW_ADDRESS,
  JUVRA_ESCROW_CONFIG_ERROR,
  isJuvraEscrowConfigured,
} from "@/lib/contract";

const escrowSteps = [
  "Your wallet signs the job-creation transaction.",
  "The USDC amount is locked as native escrow value.",
  "Freelancers apply once the job is live.",
  "Payment is released to the freelancer after you approve the work.",
];

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

  const txError = write.error ?? receipt.error;
  const txState: TxState = txError
    ? "error"
    : hasSucceeded
      ? "success"
      : isBusy
        ? "pending"
        : "idle";
  const txMessage = txError
    ? errorMessage(txError)
    : hasSucceeded
      ? "Job posted successfully — escrow is funded and the job is live."
      : isTransactionPending
        ? "Waiting for wallet confirmation…"
        : isConfirming
          ? "Confirming on Arc…"
          : undefined;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Native USDC escrow on Arc Testnet"
        eyebrowIcon={LockKeyhole}
        title="Post a job"
        description="Define the work, set the deadline, and lock funds into escrow so freelancers can apply with confidence."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <GlassCard className="p-0">
          <div className="flex items-center gap-2 border-b border-white/[0.08] p-5">
            <CircleDollarSign className="size-5 text-emerald-300" />
            <div>
              <h2 className="font-heading text-base font-semibold text-white">
                Lock funds &amp; post job
              </h2>
              <p className="text-sm text-zinc-400">
                Funds are sent as native Arc Testnet USDC with the job-creation transaction.
              </p>
            </div>
          </div>

          <form className="grid gap-5 p-5" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormFieldGroup label="Title" htmlFor="job-title" required>
                <Input
                  id="job-title"
                  className="h-11"
                  disabled={isBusy}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Build an escrow dashboard"
                  required
                  value={title}
                />
              </FormFieldGroup>

              <FormFieldGroup label="Category" htmlFor="job-category" required>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="job-category"
                    className="h-11 pl-9"
                    disabled={isBusy}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Frontend, design, Solidity"
                    required
                    value={category}
                  />
                </div>
              </FormFieldGroup>
            </div>

            <FormFieldGroup
              label="Description link"
              htmlFor="job-description"
              required
              description="Paste a link to the full brief (IPFS, Arweave, or a public URL). This keeps the brief verifiable and gas-light."
            >
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-zinc-500" />
                <Textarea
                  id="job-description"
                  className="min-h-28 pl-9"
                  disabled={isBusy}
                  onChange={(event) => setDescriptionURI(event.target.value)}
                  placeholder="ipfs://... or https://..."
                  required
                  value={descriptionURI}
                />
              </div>
            </FormFieldGroup>

            <div className="grid gap-5 md:grid-cols-2">
              <FormFieldGroup
                label="Amount in USDC"
                htmlFor="job-amount"
                required
                hint="Locked in escrow"
              >
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="job-amount"
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
              </FormFieldGroup>

              <FormFieldGroup label="Deadline date" htmlFor="job-deadline" required>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="job-deadline"
                    className="h-11 pl-9"
                    disabled={isBusy}
                    min={today}
                    onChange={(event) => setDeadline(event.target.value)}
                    required
                    type="date"
                    value={deadline}
                  />
                </div>
              </FormFieldGroup>
            </div>

            {!isConnected && (
              <p className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100">
                Connect your wallet to lock funds and post this job.
              </p>
            )}

            {formError && !txError && (
              <p className="text-sm font-medium text-rose-300">{formError}</p>
            )}

            <TxStatus status={txState} message={txMessage} hash={write.data} />

            <CTAButton size="lg" type="submit" disabled={!isConnected || isBusy}>
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              {isTransactionPending
                ? "Waiting for wallet…"
                : isConfirming
                  ? "Confirming on Arc…"
                  : "Lock funds & post job"}
            </CTAButton>
          </form>
        </GlassCard>

        <aside className="space-y-5">
          <WalletStatusCard
            isConnected={isConnected}
            isWrongNetwork={isConnected && !isArcTestnet}
            networkName="Arc Testnet"
            action={<ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />}
          />

          {/* Live preview */}
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Preview</p>
            <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-white">
              {title || "Your job title"}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{category || "Category"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-zinc-500">Escrow</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#ffb86b]">
                  {amount ? `${amount} USDC` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-zinc-500">Deadline</p>
                <p className="mt-1 text-sm text-zinc-300">{deadline || "—"}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-300" />
              <h3 className="font-heading text-sm font-semibold text-white">How escrow protects you</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-zinc-400">
              {escrowSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-[#ff9a4a]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </GlassCard>
        </aside>
      </div>
    </AppShell>
  );
}
