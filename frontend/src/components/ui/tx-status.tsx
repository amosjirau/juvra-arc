"use client";

import { CheckCircle2, Loader2, Wallet, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { ArcscanLink } from "@/components/arcscan-link";
import { cn } from "@/lib/utils";

export type TxState = "idle" | "pending" | "success" | "error";

const STEPS = ["Wallet", "Settling on Arc", "Settled"] as const;

/**
 * Animated on-chain transaction lifecycle tracker. Renders nothing for
 * `idle`. Shows a 3-step progress rail, a status row, and an Arcscan link
 * when a `hash` is provided.
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
      spin: true,
      shell: "border-status-assigned/25 bg-status-assigned/[0.07] text-status-assigned",
      label: "Transaction pending — confirm in your wallet and wait for settlement…",
      activeIndex: 1,
    },
    success: {
      icon: CheckCircle2,
      spin: false,
      shell: "border-status-open/30 bg-status-open/[0.07] text-status-open",
      label: "Transaction confirmed on Arc.",
      activeIndex: 2,
    },
    error: {
      icon: XCircle,
      spin: false,
      shell: "border-rose-400/25 bg-rose-500/[0.07] text-rose-200",
      label: "Transaction failed. Nothing was charged — please try again.",
      activeIndex: -1,
    },
  }[status];

  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-2xl border px-4 py-3.5 text-sm shadow-xl shadow-black/20 backdrop-blur-xl",
          config.shell,
          className,
        )}
      >
        <div className="flex items-start gap-2.5">
          <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
            {status === "pending" ? (
              <span className="pulse-ring absolute inset-0 rounded-full" />
            ) : null}
            <Icon className={cn("size-4", config.spin && "animate-spin")} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{message ?? config.label}</p>
            {hash ? <ArcscanLink hash={hash} className="mt-1" /> : null}
          </div>
        </div>

        {status !== "error" ? (
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            {STEPS.map((step, i) => {
              const done = i < config.activeIndex || status === "success";
              const active = i === config.activeIndex && status === "pending";
              return (
                <div key={step} className="space-y-1.5">
                  <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-current"
                      initial={{ width: 0 }}
                      animate={{ width: done ? "100%" : active ? "70%" : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {active ? (
                      <span className="shimmer absolute inset-0 rounded-full opacity-60" />
                    ) : null}
                  </div>
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-current/70">
                    {i === 0 ? <Wallet className="size-2.5" /> : null}
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
