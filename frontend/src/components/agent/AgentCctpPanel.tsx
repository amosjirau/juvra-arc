"use client";

import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ArcscanLink } from "@/components/arcscan-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { shortAddress } from "@/lib/format";

type CctpStatus = {
  configured: boolean;
  agentAddress: string | null;
  sepolia: { usdcUSDC: string; ethBalance: string; domain: number };
  arc: { usdcUSDC: string; domain: number };
};

type Phase = "idle" | "burning" | "attesting" | "minted" | "error";

export function AgentCctpPanel() {
  const [status, setStatus] = useState<CctpStatus | null>(null);
  const [amount, setAmount] = useState("1");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [burnTx, setBurnTx] = useState("");
  const [mintTx, setMintTx] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/cctp/status");
      const data = await res.json();
      if (data.success) setStatus(data);
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  async function completeMint(hash: string) {
    for (let i = 0; i < 8; i++) {
      const res = await fetch("/api/agent/cctp/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ burnTxHash: hash }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error ?? "Mint failed.");
      }

      if (!data.pending && data.mintTxHash) {
        return data.mintTxHash as string;
      }
    }

    throw new Error(
      "Attestation is taking longer than expected. The burn succeeded — retry the mint shortly."
    );
  }

  async function bridge() {
    setError("");
    setBurnTx("");
    setMintTx("");
    setPhase("burning");

    try {
      const res = await fetch("/api/agent/cctp/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountUSDC: amount }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error ?? "Bridge failed.");
      }

      setBurnTx(data.burnTxHash);
      setPhase("attesting");

      const hash = await completeMint(data.burnTxHash);
      setMintTx(hash);
      setPhase("minted");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bridge failed.");
      setPhase("error");
    }
  }

  const busy = phase === "burning" || phase === "attesting";
  const needsSepoliaFunds =
    status &&
    (Number(status.sepolia.usdcUSDC) <= 0 || Number(status.sepolia.ethBalance) <= 0);

  return (
    <Card className="premium-card-hover rounded-[2rem] border-sky-300/15 bg-sky-300/[0.04]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-100">
              <ArrowRightLeft className="size-3.5" />
              Cross-chain (CCTP)
            </div>
            <CardTitle className="text-white">
              Agent treasury: bridge USDC into Arc
            </CardTitle>
            <p className="mt-2 text-sm leading-5 text-zinc-400">
              The agent autonomously bridges USDC from Ethereum Sepolia into Arc
              using Circle CCTP (burn → attestation → mint). Arc as the settlement
              hub. No human signature.
            </p>
          </div>
          <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-100">
            Sepolia → Arc
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.configured ? (
          <p className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
            Agent wallet is not configured.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-3">
              <CctpMetric label="Sepolia USDC" value={`${status.sepolia.usdcUSDC}`} />
              <CctpMetric label="Sepolia ETH (gas)" value={`${status.sepolia.ethBalance}`} />
              <CctpMetric label="Arc USDC" value={`${status.arc.usdcUSDC}`} />
            </div>

            {needsSepoliaFunds && status.agentAddress && (
              <div className="rounded-xl border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-medium">Fund the agent on Sepolia to bridge</p>
                    <p className="mt-1 break-all font-mono text-xs">
                      {status.agentAddress}
                    </p>
                    <p className="mt-1 text-xs">
                      Get testnet USDC at faucet.circle.com (Ethereum Sepolia) and
                      a little Sepolia ETH for gas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="sm:max-w-[140px]"
                inputMode="decimal"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="1"
                value={amount}
              />
              <Button
                className="bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 hover:from-sky-300 hover:to-cyan-300"
                disabled={busy || !amount}
                onClick={bridge}
                type="button"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="size-4" />
                )}
                {phase === "burning"
                  ? "Burning on Sepolia..."
                  : phase === "attesting"
                    ? "Awaiting attestation..."
                    : `Bridge ${amount || "0"} USDC to Arc`}
              </Button>
            </div>

            {(burnTx || mintTx) && (
              <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <Step
                  done={Boolean(burnTx)}
                  label="Burned on Sepolia"
                  link={
                    burnTx
                      ? `https://sepolia.etherscan.io/tx/${burnTx}`
                      : undefined
                  }
                />
                <Step
                  active={phase === "attesting"}
                  done={Boolean(mintTx)}
                  label={
                    phase === "attesting" && !mintTx
                      ? "Awaiting Circle attestation..."
                      : "Attested by Circle"
                  }
                />
                {mintTx ? (
                  <div className="flex items-center gap-2 text-emerald-100">
                    <CheckCircle2 className="size-4" />
                    <span>Minted on Arc</span>
                    <ArcscanLink hash={mintTx as `0x${string}`} />
                  </div>
                ) : null}
              </div>
            )}

            {phase === "minted" && (
              <p className="rounded-xl border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm text-emerald-100">
                Cross-chain settlement complete. USDC moved Sepolia → Arc,
                agent-signed, via CCTP.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <p className="text-xs leading-5 text-zinc-500">
              CCTP V2 burn/mint with Circle&apos;s attestation. The agent signs from
              its own wallet; escrow funds are never touched.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CctpMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function Step({
  done,
  active,
  label,
  link,
}: {
  done?: boolean;
  active?: boolean;
  label: string;
  link?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-zinc-300">
      {done ? (
        <CheckCircle2 className="size-4 text-emerald-300" />
      ) : active ? (
        <Loader2 className="size-4 animate-spin text-sky-200" />
      ) : (
        <span className="size-2 rounded-full bg-zinc-600" />
      )}
      <span>{label}</span>
      {link && (
        <a
          className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"
          href={link}
          rel="noreferrer"
          target="_blank"
        >
          tx <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}
