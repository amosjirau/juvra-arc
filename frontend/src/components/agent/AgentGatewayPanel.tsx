"use client";

import {
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  Layers,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type GatewayStatus = {
  configured: boolean;
  agentAddress: string | null;
  unified: { arc: string; sepolia: string; total: string };
  onchain: { arcUSDC: string; sepoliaETH: string };
};

export function AgentGatewayPanel() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [depositAmt, setDepositAmt] = useState("5");
  const [transferAmt, setTransferAmt] = useState("4");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [depositUrl, setDepositUrl] = useState("");
  const [mintUrl, setMintUrl] = useState("");

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/agent/gateway/status");
      const d = await r.json();
      if (d.success) setStatus(d);
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function deposit() {
    setBusy("deposit");
    setError("");
    setDepositUrl("");
    try {
      const r = await fetch("/api/agent/gateway/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceKey: "arc", amountUSDC: depositAmt }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error ?? "Deposit failed.");
      setDepositUrl(d.depositExplorerUrl);
      // Poll until the unified balance reflects the deposit.
      for (let i = 0; i < 12; i++) {
        await new Promise((res) => setTimeout(res, 2500));
        await refresh();
        const s = await (await fetch("/api/agent/gateway/status")).json();
        if (Number(s.unified?.arc) > 0) break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deposit failed.");
    } finally {
      setBusy("");
      refresh();
    }
  }

  async function transfer() {
    setBusy("transfer");
    setError("");
    setMintUrl("");
    try {
      const r = await fetch("/api/agent/gateway/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceKey: "arc", destKey: "sepolia", amountUSDC: transferAmt }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error ?? "Transfer failed.");
      setMintUrl(d.mintExplorerUrl);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transfer failed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <Card className="premium-card-hover rounded-[2rem] border-emerald-300/15 bg-emerald-300/[0.04]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-100">
              <Layers className="size-3.5" />
              Unified balance (Gateway)
            </div>
            <CardTitle className="text-white">
              Agent treasury: Circle Gateway unified USDC
            </CardTitle>
            <p className="mt-2 text-sm leading-5 text-zinc-400">
              The agent deposits USDC into a Circle Gateway unified balance, then
              spends it on any chain instantly (burn intent → attestation → mint).
              No human signature; escrow is never touched.
            </p>
          </div>
          <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            unified: {status?.unified.total ?? "0.00"} USDC
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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Unified · Arc" value={`${status.unified.arc} USDC`} />
              <Metric label="Unified · Sepolia" value={`${status.unified.sepolia} USDC`} />
              <Metric label="Arc USDC (wallet)" value={`${status.onchain.arcUSDC}`} />
              <Metric label="Sepolia ETH (gas)" value={`${status.onchain.sepoliaETH}`} />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="mb-2 text-sm font-medium text-white">1 · Deposit into unified balance (Arc)</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  className="sm:max-w-[120px]"
                  inputMode="decimal"
                  onChange={(e) => setDepositAmt(e.target.value)}
                  value={depositAmt}
                />
                <Button disabled={busy !== "" || !depositAmt} onClick={deposit} type="button">
                  {busy === "deposit" ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
                  Deposit {depositAmt || "0"} USDC
                </Button>
                {depositUrl && <TxLink url={depositUrl} label="deposit" />}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="mb-2 text-sm font-medium text-white">2 · Spend cross-chain (Arc → Sepolia)</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  className="sm:max-w-[120px]"
                  inputMode="decimal"
                  onChange={(e) => setTransferAmt(e.target.value)}
                  value={transferAmt}
                />
                <Button
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 hover:from-emerald-300 hover:to-emerald-400"
                  disabled={busy !== "" || !transferAmt || Number(status.unified.arc) <= 0}
                  onClick={transfer}
                  type="button"
                >
                  {busy === "transfer" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightLeft className="size-4" />}
                  Transfer {transferAmt || "0"} USDC → Sepolia
                </Button>
                {mintUrl && <TxLink url={mintUrl} label="mint" />}
              </div>
            </div>

            {mintUrl && (
              <p className="rounded-xl border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm text-emerald-100">
                <CheckCircle2 className="mr-1 inline size-4" />
                Unified balance spent on Sepolia via Gateway — instant, agent-signed.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
                {error}
              </p>
            )}

            <p className="text-xs leading-5 text-zinc-500">
              Circle Gateway unified balance. The agent signs the burn intent
              (EIP-712) from its own wallet; escrow funds are never touched.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function TxLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      className="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-emerald-100"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      {label} tx <ExternalLink className="size-3" />
    </a>
  );
}
