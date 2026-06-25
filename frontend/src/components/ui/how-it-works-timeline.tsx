"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "sky" | "amber" | "rose";

const toneClasses: Record<Tone, string> = {
  emerald: "border-status-open/30 bg-status-open/10 text-status-open",
  sky: "border-status-assigned/30 bg-status-assigned/10 text-status-assigned",
  amber: "border-status-disputed/30 bg-status-disputed/10 text-status-disputed",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

export type TimelineStep = {
  title: string;
  description: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  meta?: string;
};

/**
 * Vertical escrow-lifecycle timeline. Scroll-reveal staggered steps on an
 * emerald rail; tone maps to the job-status semantics (emerald active, amber
 * pending/review, rose dispute). Reduced-motion safe via shared variants.
 */
export function HowItWorksTimeline({
  steps,
  className,
}: {
  steps: TimelineStep[];
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {/* rail */}
      <span
        aria-hidden
        className="absolute left-[1.4rem] top-2 bottom-2 w-px bg-gradient-to-b from-[#10b981]/60 via-[#38bdf8]/30 to-transparent"
      />
      <div className="space-y-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const tone = step.tone ?? "emerald";
          return (
            <motion.li
              key={step.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ delay: i * 0.06 }}
              className="relative flex gap-4"
            >
              <span
                className={cn(
                  "relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-lg shadow-black/30 backdrop-blur",
                  toneClasses[tone],
                )}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 backdrop-blur">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  {step.meta ? (
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                      {step.meta}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-6 text-zinc-400">{step.description}</p>
              </div>
            </motion.li>
          );
        })}
      </div>
    </ol>
  );
}
