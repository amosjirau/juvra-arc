import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

/**
 * Presentational wallet-state card (pure — pass wagmi-derived values in). Has
 * three states: disconnected, wrong-network, and connected.
 */
export function WalletStatusCard({
  isConnected,
  address,
  isWrongNetwork = false,
  networkName = "Arc Testnet",
  action,
  className,
}: {
  isConnected: boolean;
  address?: string;
  isWrongNetwork?: boolean;
  networkName?: string;
  action?: ReactNode;
  className?: string;
}) {
  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : undefined;

  const state = !isConnected ? "disconnected" : isWrongNetwork ? "wrong" : "connected";

  const tone = {
    disconnected: "border-white/10 bg-white/[0.05] text-zinc-300",
    wrong: "border-rose-400/25 bg-rose-500/10 text-rose-200",
    connected: "border-status-open/25 bg-status-open/10 text-status-open",
  }[state];

  const Icon = state === "connected" ? CheckCircle2 : state === "wrong" ? AlertTriangle : Wallet;

  const heading = {
    disconnected: "Wallet not connected",
    wrong: "Wrong network",
    connected: "Wallet connected",
  }[state];

  const detail = {
    disconnected: "Connect a wallet to fund escrow, post jobs, and track settlements.",
    wrong: `Switch your wallet to ${networkName} to interact with Juvra.`,
    connected: `${shortAddress} · ${networkName}`,
  }[state];

  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-11 items-center justify-center rounded-xl border", tone)}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{heading}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-zinc-400">{detail}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </GlassCard>
  );
}
