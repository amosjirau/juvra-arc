"use client";

import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Direction = "sepolia_to_arc" | "arc_to_sepolia";

type CctpStatus = {
  configured: boolean;
  agentAddress: string | null;
  sepolia: { usdcUSDC: string; ethBalance: string; domain: number };
  arc: { usdcUSDC: string; nativeUSDC: string; domain: number };
};

type Phase = "idle" | "burning" | "attesting" | "minted" | "error";

const DIRECTIONS: Record<Direction, { label: string; source: string; dest: string }> = {
  arc_to_sepolia: { label: "Arc → Sepolia", source: "arc", dest: "sepolia" },
  sepolia_to_arc: { label: "Sepolia → Arc", source: "sepolia", dest: "arc" },
};

export function AgentCctpPanel() {
  const [status, setStatus] = useState<CctpStatus | null>(null);
  const [direction, setDirection] = useState<Direction>("arc_to_sepolia");
  const [amount, setAmount] = useState("1");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [burnUrl, setBurnUrl] = useState("");
  const [mintUrl, setMintUrl] = useState("");

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

  async function completeMint(burnTxHash: string) {
    for (let i = 0; i < 8; i++) {
      const res = await fetch("/api/agent/cctp/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, burnTxHash }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error ?? "Mint failed.");
      if (!data.pending && data.mintExplorerUrl) return data.mintExplorerUrl as string;
    }

    throw new Error(
      "Attestation is taking longer than expected. The burn succeeded — retry the mint shortly."
    );
  }

  async function bridge() {
    setError("");
    setBurnUrl("");
    setMintUrl("");
    setPhase("burning");

    try {
      const res = await fetch("/api/agent/cctp/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, amountUSDC: amount }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error ?? "Bridge failed.");

      setBurnUrl(data.burnExplorerUrl);
      setPhase("attesting");

      const minted = await completeMint(data.burnTxHash);
      setMintUrl(minted);
      setPhase("minted");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bridge failed.");
      setPhase("error");
    }
  }

  const busy = phase === "burning" || phase === "attesting";
  const sourceUsdc =
    DIRECTIONS[direction].source === "arc"
      ? status?.arc.usdcUSDC
      : status?.sepolia.usdcUSDC;
  const lowSource = status ? Number(sourceUsdc ?? "0") <= 0 : false;

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
            <ArrowRightLeft className="size-3.5" />
            Cross-chain (CCTP)
          </div>
          <h3 className="font-serif text-xl text-ink">Bridge USDC across chains</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            The agent autonomously bridges USDC between Ethereum Sepolia and Arc
            using Circle CCTP (burn → attestation → mint). No human signature.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-ink">
          {DIRECTIONS[direction].label}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {!status?.configured ? (
          <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink-soft">
            Agent wallet is not configured.
          </p>
        ) : (
          <>
            <div className="inline-flex rounded-xl border border-line bg-paper p-1">
              {(Object.keys(DIRECTIONS) as Direction[]).map((dir) => (
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    direction === dir
                      ? "bg-ink text-paper"
                      : "text-ink-soft hover:text-ink"
                  }`}
                  disabled={busy}
                  key={dir}
                  onClick={() => setDirection(dir)}
                  type="button"
                >
                  {DIRECTIONS[dir].label}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <CctpMetric label="Sepolia USDC" value={status.sepolia.usdcUSDC} />
              <CctpMetric label="Sepolia ETH (gas)" value={status.sepolia.ethBalance} />
              <CctpMetric label="Arc USDC" value={status.arc.usdcUSDC} />
            </div>

            {lowSource && status.agentAddress && (
              <div className="rounded-xl border border-accent-orange/30 bg-accent-orange/[0.06] p-3 text-sm text-ink">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-orange" />
                  <div>
                    <p className="font-medium">
                      No USDC on{" "}
                      {DIRECTIONS[direction].source === "arc" ? "Arc" : "Sepolia"} to
                      bridge from
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-ink-soft">
                      {status.agentAddress}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Fund the agent with USDC on the source chain
                      {DIRECTIONS[direction].dest === "sepolia"
                        ? " (mint on Sepolia also needs a little Sepolia ETH for gas)."
                        : "."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none sm:max-w-[140px]"
                inputMode="decimal"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="1"
                value={amount}
              />
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
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
                  ? "Burning on source…"
                  : phase === "attesting"
                    ? "Awaiting attestation…"
                    : `Bridge ${amount || "0"} USDC (${DIRECTIONS[direction].label})`}
              </button>
            </div>

            {(burnUrl || mintUrl) && (
              <div className="space-y-2 rounded-xl border border-line bg-paper p-3 text-sm">
                <Step done={Boolean(burnUrl)} label="Burned on source" link={burnUrl} />
                <Step
                  active={phase === "attesting"}
                  done={Boolean(mintUrl)}
                  label={
                    phase === "attesting" && !mintUrl
                      ? "Awaiting Circle attestation…"
                      : "Attested by Circle"
                  }
                />
                {mintUrl ? (
                  <Step done label="Minted on destination" link={mintUrl} />
                ) : null}
              </div>
            )}

            {phase === "minted" && (
              <p className="rounded-xl border border-line bg-paper p-3 text-sm text-ink">
                Cross-chain settlement complete — USDC moved {DIRECTIONS[direction].label},
                agent-signed, via CCTP.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-300/40 bg-rose-500/[0.06] p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <p className="text-xs leading-5 text-ink-soft">
              CCTP V2 burn/mint with Circle&apos;s attestation. The agent signs from
              its own wallet; escrow funds are never touched.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function CctpMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-ink">{value}</p>
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
    <div className="flex items-center gap-2 text-ink">
      {done ? (
        <CheckCircle2 className="size-4 text-accent-orange" />
      ) : active ? (
        <Loader2 className="size-4 animate-spin text-ink-soft" />
      ) : (
        <span className="size-2 rounded-full bg-ink-faint" />
      )}
      <span>{label}</span>
      {link && (
        <a
          className="inline-flex items-center gap-1 text-xs text-accent-purple hover:opacity-80"
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
