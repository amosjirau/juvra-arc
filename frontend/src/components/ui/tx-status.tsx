import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { ArcscanLink } from "@/components/arcscan-link";
import { cn } from "@/lib/utils";

export type TxState = "idle" | "pending" | "success" | "error";

/**
 * Inline feedback for an on-chain transaction lifecycle. Renders nothing for
 * `idle`. Shows an Arcscan link when a `hash` is provided.
 */
export function TxStatus({
  status,
  message,
  hash,
  className,
}: {
  status: TxState;
  message?: ReactNode;
  hash?: `0x${string}`;
  className?: string;
}) {
  if (status === "idle") return null;

  const config = {
    pending: {
      icon: Loader2,
      cls: "border-status-assigned/25 bg-status-assigned/10 text-status-assigned",
      spin: true,
      label: "Transaction pending — confirm in your wallet and wait for settlement…",
    },
    success: {
      icon: CheckCircle2,
      cls: "border-status-open/30 bg-status-open/10 text-status-open",
      spin: false,
      label: "Transaction confirmed on Arc.",
    },
    error: {
      icon: XCircle,
      cls: "border-rose-400/25 bg-rose-500/10 text-rose-200",
      spin: false,
      label: "Transaction failed. Nothing was charged — please try again.",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm", config.cls, className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", config.spin && "animate-spin")} />
      <div className="min-w-0">
        <p>{message ?? config.label}</p>
        {hash ? <ArcscanLink hash={hash} className="mt-1" /> : null}
      </div>
    </div>
  );
}
