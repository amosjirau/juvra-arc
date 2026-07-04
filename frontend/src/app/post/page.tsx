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
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus, type TxState } from "@/components/ui/tx-status";
import { errorMessage } from "@/lib/format";
import { arcTestnet } from "@/lib/arc";
import {
  JUVRA_ESCROW_ABI,
  JUVRA_ESCROW_ADDRESS,
  JUVRA_ESCROW_CONFIG_ERROR,
  isJuvraEscrowConfigured,
} from "@/lib/contract";

const FIELD =
  "border-line bg-paper text-ink shadow-none placeholder:text-ink-faint hover:border-ink/25 hover:bg-paper focus-visible:border-ink/40 focus-visible:ring-0";

const escrowSteps = [
  "Your wallet signs the job-creation transaction.",
  "The USDC amount is locked as native escrow value.",
  "Freelancers apply once the job is live.",
  "Payment is released to the freelancer after you approve the work.",
];

function Field({
  children,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink" htmlFor={htmlFor}>
          {label}
        </label>
        {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function PostPage() {
  const { chainId, isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [descriptionURI, setDescriptionURI] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");

  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isTransactionPending = write.isPending;
  const isConfirming = Boolean(write.data && receipt.isLoading);
  const isBusy = isTransactionPending || isConfirming;
  const hasSucceeded = receipt.isSuccess;
  const contractReady = isJuvraEscrowConfigured;
  const isArcTestnet = chainId === arcTestnet.id;

  useEffect(() => {
    if (write.error) console.error("postJob wallet/write error", write.error);
  }, [write.error]);

  useEffect(() => {
    if (receipt.error) console.error("postJob receipt error", receipt.error);
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

    if (!trimmedTitle) return setFormError("Title is required.");
    if (!trimmedCategory) return setFormError("Category is required.");
    if (!trimmedDescriptionURI) return setFormError("Description URI is required.");

    const selectedDeadline = new Date(`${deadline}T23:59:59`);
    const deadlineSeconds = Math.floor(selectedDeadline.getTime() / 1000);

    if (!Number.isFinite(deadlineSeconds)) return setFormError("Choose a valid deadline date.");
    if (deadlineSeconds <= Math.floor(Date.now() / 1000)) {
      return setFormError("Deadline must be a future date.");
    }

    let value: bigint;
    try {
      value = parseEther(amount);
    } catch {
      return setFormError("Enter a valid USDC amount.");
    }
    if (value <= 0n) return setFormError("Escrow amount must be greater than zero.");

    try {
      await write.writeContractAsync({
        address: escrowAddress,
        abi: JUVRA_ESCROW_ABI,
        functionName: "postJob",
        args: [trimmedTitle, trimmedCategory, trimmedDescriptionURI, BigInt(deadlineSeconds)],
        value,
      });
    } catch (error) {
      console.error("postJob transaction failed", { error });
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
    <EditorialShell>
      <EditorialHeader
        description="Define the work, set the deadline, and lock funds into escrow so freelancers can apply with confidence."
        eyebrow="Native USDC escrow on Arc Testnet"
        title="Post a job"
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-line bg-paper-raised">
          <div className="flex items-center gap-2 border-b border-line p-5">
            <CircleDollarSign className="size-5 text-accent-orange" />
            <div>
              <h2 className="font-serif text-lg text-ink">Lock funds &amp; post job</h2>
              <p className="text-sm text-ink-soft">
                Funds are sent as native Arc Testnet USDC with the job-creation transaction.
              </p>
            </div>
          </div>

          <form className="grid gap-5 p-5" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field htmlFor="job-title" label="Title">
                <Input
                  className={`h-11 ${FIELD}`}
                  disabled={isBusy}
                  id="job-title"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Build an escrow dashboard"
                  required
                  value={title}
                />
              </Field>

              <Field htmlFor="job-category" label="Category">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    className={`h-11 pl-9 ${FIELD}`}
                    disabled={isBusy}
                    id="job-category"
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Frontend, design, Solidity"
                    required
                    value={category}
                  />
                </div>
              </Field>
            </div>

            <Field htmlFor="job-description" label="Description link">
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-ink-faint" />
                <Textarea
                  className={`min-h-28 pl-9 ${FIELD}`}
                  disabled={isBusy}
                  id="job-description"
                  onChange={(event) => setDescriptionURI(event.target.value)}
                  placeholder="ipfs://… or https://…"
                  required
                  value={descriptionURI}
                />
              </div>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field hint="Locked in escrow" htmlFor="job-amount" label="Amount in USDC">
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    className={`h-11 pl-9 ${FIELD}`}
                    disabled={isBusy}
                    id="job-amount"
                    min="0"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="2500"
                    required
                    step="0.000001"
                    type="number"
                    value={amount}
                  />
                </div>
              </Field>

              <Field htmlFor="job-deadline" label="Deadline date">
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
                  <Input
                    className={`h-11 pl-9 ${FIELD}`}
                    disabled={isBusy}
                    id="job-deadline"
                    min={today}
                    onChange={(event) => setDeadline(event.target.value)}
                    required
                    type="date"
                    value={deadline}
                  />
                </div>
              </Field>
            </div>

            {!isConnected && (
              <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-soft">
                Connect your wallet to lock funds and post this job.
              </p>
            )}

            {formError && !txError && (
              <p className="text-sm font-medium text-rose-600">{formError}</p>
            )}

            <TxStatus hash={write.data} message={txMessage} status={txState} />

            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              disabled={!isConnected || isBusy}
              type="submit"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              {isTransactionPending
                ? "Waiting for wallet…"
                : isConfirming
                  ? "Confirming on Arc…"
                  : "Lock funds & post job"}
            </button>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Wallet</p>
                <p className="mt-1 text-sm text-ink">
                  {isConnected
                    ? isArcTestnet
                      ? "Connected · Arc Testnet"
                      : "Wrong network — switch to Arc Testnet"
                    : "Not connected"}
                </p>
              </div>
              <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Live preview
            </p>
            <h3 className="mt-3 line-clamp-2 font-serif text-xl text-ink">
              {title || "Your job title"}
            </h3>
            <p className="mt-1 text-sm text-ink-soft">{category || "Category"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div>
                <p className="text-xs text-ink-soft">Escrow</p>
                <p className="mt-1 font-serif text-lg text-ink">
                  {amount ? `${amount} USDC` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-soft">Deadline</p>
                <p className="mt-1 text-sm text-ink">{deadline || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent-orange" />
              <h3 className="font-serif text-base text-ink">How escrow protects you</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-ink-soft">
              {escrowSteps.map((step, i) => (
                <li className="flex gap-3" key={i}>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </EditorialShell>
  );
}
