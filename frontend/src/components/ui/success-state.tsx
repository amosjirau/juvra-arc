"use client";

import { CheckCircle2, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Animated success surface — mirrors EmptyState / ErrorState. Use for completed
 * flows (job posted, work approved, dispute resolved) where a full-panel
 * confirmation is warranted (inline tx feedback should use TxStatus instead).
 */
export function SuccessState({
  title = "Done",
  description,
  action,
  icon: Icon = CheckCircle2,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-status-open/25 bg-status-open/[0.06] p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 w-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.2),transparent_70%)] blur-2xl"
      />
      <div className="relative mx-auto flex size-14 items-center justify-center">
        <span className="pulse-ring absolute inset-0 rounded-2xl" />
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-14 items-center justify-center rounded-2xl border border-status-open/30 bg-status-open/10 text-status-open shadow-lg shadow-emerald-950/30"
        >
          <Icon className="size-6" />
        </motion.span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </motion.div>
  );
}
