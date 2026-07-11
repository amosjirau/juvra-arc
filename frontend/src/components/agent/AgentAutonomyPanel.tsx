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
  serviceAgent?: {
    configured: boolean;
    address: string | null;
    feeUSDC: string;
  };
  recentPayments: AutoPayment[];
};

type AgentToAgentResult = {
  orchestratorAgent: string;
  serviceAgent: string;
  payment: { txHash: string; explorerUrl: string; amountUSDC: string; to: string };
  paymentVerifiedByService: boolean;
  verification: {
    mode: string;
    provider: string;
    verificationStatus: string;
    settlementImpact: string;
    findings: string[];
  };
  receipt: { message: string; signature: string; signer: string };
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

type AgentSettlementEntry = {
  id: string;
  jobId: string;
  direction: "release" | "refund";
  amountUSDC: string;
  recipient: string;
  txHash: string;
  createdAt: string;
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
  const [a2aLoading, setA2aLoading] = useState(false);
  const [a2a, setA2a] = useState<AgentToAgentResult | null>(null);
  const [settlements, setSettlements] = useState<AgentSettlementEntry[]>([]);

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

    try {
      const res = await fetch("/api/agent/settle-escrow");
      const data = (await res.json()) as {
        success: boolean;
        settlements?: AgentSettlementEntry[];
      };

      if (data.success && Array.isArray(data.settlements)) {
        setSettlements(data.settlements);
      }
    } catch {
      // Ledger view is best-effort; ignore transient fetch errors.
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDecision("");
    setLastPaid(null);
    setA2a(null);
    setError("");
    /* eslint-enable react-hooks/set-state-in-effect */
    refreshWallet();
  }, [jobId, refreshWallet]);

  async function runAgentToAgent() {
    if (!jobId) {
      setError("Job ID is required.");
      return;
    }

    setA2aLoading(true);
    setError("");
    setA2a(null);

    try {
      const res = await fetch("/api/agent/use-verification-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle: job?.title || "Untitled job",
          deliveryText: buildDeliveryText(evidence),
          evidenceItems: evidence,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error ?? "Agent-to-agent verification failed.");
      }

      setA2a(data as AgentToAgentResult);
      await refreshWallet();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Agent-to-agent verification failed."
      );
    } finally {
      setA2aLoading(false);
    }
  }

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
  const serviceConfigured = Boolean(wallet?.serviceAgent?.configured);

  return (
    <Card className="premium-card-hover rounded-[2rem] border-emerald-600/25 bg-emerald-500/[0.06]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-600/25 bg-emerald-500/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
              <Zap className="size-3.5" />
              Autonomous agent
            </div>
            <CardTitle className="flex items-center gap-2 text-ink">
              <BotMessageSquare className="size-5 text-emerald-700" />
              Agent wallet &amp; autonomous payments
            </CardTitle>
            <p className="mt-2 text-sm leading-5 text-ink-soft">
              The agent holds its own budgeted USDC wallet on Arc and pays
              nanopayments autonomously — no human signature. It also executes
              escrow settlement, but only along the verdict the client recorded
              on-chain.
            </p>
          </div>
          <Badge className="border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700">
            {wallet?.kind ?? "local-key"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="rounded-xl border border-accent-orange/30 bg-accent-orange/[0.06] p-3 text-sm text-accent-orange">
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
              <div className="rounded-xl border border-accent-orange/30 bg-accent-orange/[0.06] p-3 text-sm text-accent-orange">
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
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-500 text-ink hover:from-emerald-500 hover:to-emerald-500 sm:w-fit"
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
              {serviceConfigured && (
                <Button
                  className="w-full sm:w-fit"
                  disabled={a2aLoading || loading || !jobId}
                  onClick={runAgentToAgent}
                  type="button"
                  variant="outline"
                >
                  {a2aLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Network className="size-4" />
                  )}
                  Hire service agent (agent-to-agent)
                </Button>
              )}
            </div>

            {serviceConfigured && wallet?.serviceAgent?.address && (
              <div className="rounded-xl border border-emerald-600/25 bg-emerald-500/[0.06] p-3 text-xs text-ink">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-emerald-700">
                    Distinct verification service agent
                  </span>
                  <span className="font-mono">
                    {wallet.serviceAgent.feeUSDC} USDC / call
                  </span>
                </div>
                <p className="mt-1 break-all font-mono text-emerald-700">
                  {wallet.serviceAgent.address}
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {decision && (
              <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.06] p-3 text-sm text-accent-purple">
                <p className="font-medium">Agent decided not to spend</p>
                <p className="mt-1 text-xs leading-5">{decision}</p>
              </div>
            )}

            {lastPaid && (
              <div className="space-y-2 rounded-xl border border-emerald-600/25 bg-emerald-500/[0.06] p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <ShieldCheck className="size-4" />
                    Autonomous payment sent · agent-signed
                  </h3>
                  <Badge className="border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700">
                    {lastPaid.amountUSDC} USDC
                  </Badge>
                </div>
                <p className="text-xs leading-5 text-emerald-700">
                  {lastPaid.reason}
                </p>
                <p className="text-xs text-ink-soft">
                  To {shortAddress(lastPaid.to)} · {lastPaid.purpose}
                </p>
                <ArcscanLink hash={lastPaid.txHash as `0x${string}`} />
              </div>
            )}

            {a2a && (
              <div className="space-y-3 rounded-xl border border-emerald-600/25 bg-emerald-500/[0.06] p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <Network className="size-4" />
                    Agent-to-agent commerce settled
                  </h3>
                  <Badge className="border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700">
                    {a2a.payment.amountUSDC} USDC
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-ink">
                  <span className="font-mono">{shortAddress(a2a.orchestratorAgent)}</span>
                  <span className="text-emerald-700">— paid →</span>
                  <span className="font-mono">{shortAddress(a2a.serviceAgent)}</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <WalletMetric
                    label="Payment confirmed"
                    value={a2a.paymentVerifiedByService ? "by service ✓" : "pending"}
                  />
                  <WalletMetric
                    label="Verification"
                    value={`${a2a.verification.verificationStatus} (${a2a.verification.provider})`}
                  />
                  <WalletMetric
                    label="Impact"
                    value={a2a.verification.settlementImpact.replaceAll("_", " ")}
                  />
                </div>

                <div className="rounded-lg border border-line bg-paper p-2">
                  <p className="text-xs font-medium text-ink-soft">
                    Service agent signed receipt
                  </p>
                  <p className="mt-1 break-all font-mono text-[0.7rem] text-emerald-700">
                    {a2a.receipt.signature}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-ink-soft">
                    signer {shortAddress(a2a.receipt.signer)}
                  </p>
                </div>

                <ArcscanLink hash={a2a.payment.txHash as `0x${string}`} />
              </div>
            )}

            <div className="rounded-xl border border-line bg-paper p-3">
              <h3 className="mb-2 text-sm font-medium text-ink">
                Autonomous payment log
              </h3>
              {(wallet?.recentPayments?.length ?? 0) === 0 ? (
                <p className="text-sm text-ink-soft">
                  No autonomous payments yet this session.
                </p>
              ) : (
                <div className="space-y-2">
                  {wallet?.recentPayments.map((payment) => (
                    <div
                      className="rounded-lg border border-line bg-paper p-3"
                      key={payment.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-ink">
                          {payment.purpose}
                        </span>
                        <span className="font-mono text-sm text-emerald-700">
                          {payment.amountUSDC} USDC
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">
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

            <div className="rounded-xl border border-line bg-paper p-3">
              <h3 className="mb-2 text-sm font-medium text-ink">
                Agent escrow settlements
              </h3>
              {settlements.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  No agent-executed settlements yet this session.
                </p>
              ) : (
                <div className="space-y-2">
                  {settlements.map((settlement) => (
                    <div
                      className="rounded-lg border border-line bg-paper p-3"
                      key={settlement.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-ink">
                          Job #{settlement.jobId} · {settlement.direction}
                        </span>
                        <span className="font-mono text-sm text-emerald-700">
                          {settlement.amountUSDC} USDC
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">
                        To {shortAddress(settlement.recipient as `0x${string}`)}
                      </p>
                      <div className="mt-1">
                        <ArcscanLink hash={settlement.txHash as `0x${string}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs leading-5 text-ink-soft">
              Guardrails: per-transaction cap, session budget, recipient
              allowlist, and the wallet&apos;s on-chain balance. Escrow settlement
              is verdict-gated on-chain — the agent executes it but can never
              pick where the funds go.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function buildDeliveryText(evidence: EvidenceItem[]): string {
  const lines = evidence
    .map((item) =>
      [
        `Evidence: ${item.type}`,
        item.evidenceUrl ? `URL: ${item.evidenceUrl}` : "",
        item.note ? `Note: ${item.note}` : "",
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .filter(Boolean);

  return lines.join("\n") || "Delivery submitted for verification.";
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
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="flex items-center gap-1.5 text-xs text-ink-soft">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
