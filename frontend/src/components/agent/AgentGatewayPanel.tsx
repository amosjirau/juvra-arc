"use client";

import {
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  Layers,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type GatewayStatus = {
  configured: boolean;
  agentAddress: string | null;
  unified: { arc: string; sepolia: string; total: string };
  onchain: { arcUSDC: string; sepoliaETH: string };
};

const FIELD =
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none";
const INK_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50";

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
    // Async status fetch: setState runs after the network await, not sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="rounded-2xl border border-line bg-paper-raised p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
            <Layers className="size-3.5" />
            Unified balance (Gateway)
          </div>
          <h3 className="font-serif text-xl text-ink">Circle Gateway unified USDC</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            The agent deposits USDC into a Circle Gateway unified balance, then
            spends it on any chain instantly (burn intent → attestation → mint).
            No human signature; escrow is never touched.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-ink">
          unified: {status?.unified.total ?? "0.00"} USDC
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {!status?.configured ? (
          <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink-soft">
            Agent wallet is not configured.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Unified · Arc" value={`${status.unified.arc} USDC`} />
              <Metric label="Unified · Sepolia" value={`${status.unified.sepolia} USDC`} />
              <Metric label="Arc USDC (wallet)" value={status.onchain.arcUSDC} />
              <Metric label="Sepolia ETH (gas)" value={status.onchain.sepoliaETH} />
            </div>

            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="mb-2 text-sm font-medium text-ink">
                1 · Deposit into unified balance (Arc)
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className={`${FIELD} sm:max-w-[120px]`}
                  inputMode="decimal"
                  onChange={(e) => setDepositAmt(e.target.value)}
                  value={depositAmt}
                />
                <button className={INK_BTN} disabled={busy !== "" || !depositAmt} onClick={deposit} type="button">
                  {busy === "deposit" ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
                  Deposit {depositAmt || "0"} USDC
                </button>
                {depositUrl && <TxLink label="deposit" url={depositUrl} />}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="mb-2 text-sm font-medium text-ink">
                2 · Spend cross-chain (Arc → Sepolia)
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className={`${FIELD} sm:max-w-[120px]`}
                  inputMode="decimal"
                  onChange={(e) => setTransferAmt(e.target.value)}
                  value={transferAmt}
                />
                <button
                  className={INK_BTN}
                  disabled={busy !== "" || !transferAmt || Number(status.unified.arc) <= 0}
                  onClick={transfer}
                  type="button"
                >
                  {busy === "transfer" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightLeft className="size-4" />}
                  Transfer {transferAmt || "0"} USDC → Sepolia
                </button>
                {mintUrl && <TxLink label="mint" url={mintUrl} />}
              </div>
            </div>

            {mintUrl && (
              <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink">
                <CheckCircle2 className="mr-1 inline size-4 text-accent-orange" />
                Unified balance spent on Sepolia via Gateway — instant, agent-signed.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <p className="text-xs leading-5 text-ink-soft">
              Circle Gateway unified balance. The agent signs the burn intent
              (EIP-712) from its own wallet; escrow funds are never touched.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function TxLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      className="inline-flex items-center gap-1 text-xs text-accent-purple hover:opacity-80"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      {label} tx <ExternalLink className="size-3" />
    </a>
  );
}
