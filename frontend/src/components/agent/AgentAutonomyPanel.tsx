"use client";

import {
  AlertTriangle,
  BotMessageSquare,
  CircleDollarSign,
  Loader2,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { ArcscanLink } from "@/components/arcscan-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvidenceItem } from "@/lib/agent/evidence";
import { shortAddress } from "@/lib/format";

type AutoPayment = {
  id: string;
  jobId: string;
  purpose: "verification" | "service";
  amountUSDC: string;
  to: string;
  txHash: string;
  explorerUrl: string;
  reason: string;
  createdAt: string;
};

type WalletStatus = {
  configured: boolean;
  kind: string;
  address: string | null;
  network: string;
  balanceUSDC: string;
  balanceError?: string;
  perTxCapUSDC: string;
  sessionBudgetUSDC: string;
  sessionSpentUSDC: string;
  sessionRemainingUSDC: string;
  allowlist: string[];
  recentPayments: AutoPayment[];
};

type PayResponse =
  | {
      success: true;
      autonomous: true;
      paid: true;
      payment: AutoPayment;
      signals?: string[];
    }
  | {
      success: true;
      autonomous: true;
      paid: false;
      decision: { reason: string; signals?: string[] };
    }
  | { success: false; error?: string; address?: string; balanceUSDC?: string };

type AutonomyJob = {
  id?: string;
  title?: string;
  status?: number;
};

export function AgentAutonomyPanel({
  evidence = [],
  job,
}: {
  evidence?: EvidenceItem[];
  job?: AutonomyJob | null;
}) {
  const jobId = job?.id?.toString().trim() || "";
  const [wallet, setWallet] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<string>("");
  const [lastPaid, setLastPaid] = useState<AutoPayment | null>(null);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/wallet");
      const data = (await res.json()) as WalletStatus & { success: boolean };

      if (data.success) {
        setWallet(data);
      }
    } catch {
      // Status is best-effort; ignore transient fetch errors.
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDecision("");
    setLastPaid(null);
    setError("");
    /* eslint-enable react-hooks/set-state-in-effect */
    refreshWallet();
  }, [jobId, refreshWallet]);

  async function runAutonomous(purpose: "verification" | "service") {
    if (!jobId) {
      setError("Job ID is required.");
      return;
    }

    setLoading(true);
    setError("");
    setDecision("");
    setLastPaid(null);

    try {
      const payload: Record<string, unknown> = {
        jobId,
        jobStatus: job?.status,
        evidenceItems: evidence,
        purpose,
      };

      if (purpose === "service") {
        payload.recipient = wallet?.allowlist?.[0];
        payload.amountUSDC = "0.01";
      }

      const res = await fetch("/api/agent/autonomous-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as PayResponse;

      if (!data.success) {
        throw new Error(data.error ?? "Autonomous payment failed.");
      }

      if (data.paid) {
        setLastPaid(data.payment);
      } else {
        setDecision(data.decision.reason);
      }

      await refreshWallet();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Autonomous payment failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const configured = wallet?.configured;
  const lowBalance = wallet ? Number(wallet.balanceUSDC) <= 0 : false;
  const hasServiceTarget = (wallet?.allowlist?.length ?? 0) > 0;

  return (
    <Card className="premium-card-hover rounded-[2rem] border-fuchsia-300/15 bg-fuchsia-300/[0.04]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-fuchsia-100">
              <Zap className="size-3.5" />
              Autonomous agent
            </div>
            <CardTitle className="flex items-center gap-2 text-white">
              <BotMessageSquare className="size-5 text-fuchsia-200" />
              Agent wallet &amp; autonomous payments
            </CardTitle>
            <p className="mt-2 text-sm leading-5 text-zinc-400">
              The agent holds its own budgeted USDC wallet on Arc and pays
              nanopayments autonomously — no human signature. It never touches
              escrow, which stays human-confirmed.
            </p>
          </div>
          <Badge className="border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100">
            {wallet?.kind ?? "local-key"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
            Agent wallet is not configured. Set <code>AGENT_WALLET_PRIVATE_KEY</code>{" "}
            and restart the server.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <WalletMetric
                icon={<Network className="size-3.5" />}
                label="Agent wallet"
                value={wallet?.address ? shortAddress(wallet.address) : "—"}
              />
              <WalletMetric
                icon={<CircleDollarSign className="size-3.5" />}
                label="Balance"
                value={`${wallet?.balanceUSDC ?? "0"} USDC`}
              />
              <WalletMetric
                label="Per-tx cap"
                value={`${wallet?.perTxCapUSDC ?? "—"} USDC`}
              />
              <WalletMetric
                label="Budget left"
                value={`${wallet?.sessionRemainingUSDC ?? "—"}/${
                  wallet?.sessionBudgetUSDC ?? "—"
                }`}
              />
            </div>

            {lowBalance && wallet?.address && (
              <div className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-medium">Fund the agent wallet to enable autonomy</p>
                    <p className="mt-1 break-all font-mono text-xs">
                      {wallet.address}
                    </p>
                    <p className="mt-1 text-xs">
                      Send a little testnet USDC on Arc (e.g. from faucet.circle.com).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full bg-gradient-to-r from-fuchsia-400 to-purple-500 text-white hover:from-fuchsia-300 hover:to-purple-400 sm:w-fit"
                disabled={loading || !jobId}
                onClick={() => runAutonomous("verification")}
                type="button"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                Run autonomous verification payment
              </Button>
              {hasServiceTarget && (
                <Button
                  className="w-full sm:w-fit"
                  disabled={loading || !jobId}
                  onClick={() => runAutonomous("service")}
                  type="button"
                  variant="outline"
                >
                  Pay service agent (agent-to-agent)
                </Button>
              )}
            </div>

            {error && (
              <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            {decision && (
              <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3 text-sm text-sky-100">
                <p className="font-medium">Agent decided not to spend</p>
                <p className="mt-1 text-xs leading-5">{decision}</p>
              </div>
            )}

            {lastPaid && (
              <div className="space-y-2 rounded-xl border border-emerald-200/20 bg-emerald-200/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-50">
                    <ShieldCheck className="size-4" />
                    Autonomous payment sent · agent-signed
                  </h3>
                  <Badge className="border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
                    {lastPaid.amountUSDC} USDC
                  </Badge>
                </div>
                <p className="text-xs leading-5 text-emerald-100/90">
                  {lastPaid.reason}
                </p>
                <p className="text-xs text-zinc-400">
                  To {shortAddress(lastPaid.to)} · {lastPaid.purpose}
                </p>
                <ArcscanLink hash={lastPaid.txHash as `0x${string}`} />
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <h3 className="mb-2 text-sm font-medium text-white">
                Autonomous payment log
              </h3>
              {(wallet?.recentPayments?.length ?? 0) === 0 ? (
                <p className="text-sm text-zinc-500">
                  No autonomous payments yet this session.
                </p>
              ) : (
                <div className="space-y-2">
                  {wallet?.recentPayments.map((payment) => (
                    <div
                      className="rounded-lg border border-white/10 bg-white/[0.035] p-3"
                      key={payment.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-white">
                          {payment.purpose}
                        </span>
                        <span className="font-mono text-sm text-emerald-100">
                          {payment.amountUSDC} USDC
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        To {shortAddress(payment.to)}
                      </p>
                      <div className="mt-1">
                        <ArcscanLink hash={payment.txHash as `0x${string}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              Guardrails: per-transaction cap, session budget, recipient
              allowlist, and the wallet&apos;s on-chain balance. The agent cannot
              release, refund, or sign escrow — those remain human-confirmed.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WalletMetric({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}
