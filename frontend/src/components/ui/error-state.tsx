"use client";

import { AlertTriangle, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Animated error surface for failed loads / actions, with an optional retry.
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  icon: Icon = AlertTriangle,
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
        "relative overflow-hidden rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 w-40 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.2),transparent_70%)] blur-2xl"
      />
      <motion.span
        initial={{ scale: 0.8, rotate: -6, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 16 }}
        className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-950/30"
      >
        <Icon className="size-6" />
      </motion.span>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </motion.div>
  );
}
