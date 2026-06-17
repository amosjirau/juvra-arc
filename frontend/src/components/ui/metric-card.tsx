"use client";

import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

const tones = {
  emerald: {
    chip: "border-status-open/20 bg-status-open/10 text-status-open",
    bar: "from-[#10b981] to-[#34d399]",
    spark: "bg-[#34d399]",
  },
  sky: {
    chip: "border-status-assigned/20 bg-status-assigned/10 text-status-assigned",
    bar: "from-[#0ea5e9] to-[#38bdf8]",
    spark: "bg-[#38bdf8]",
  },
  blue: {
    chip: "border-status-submitted/20 bg-status-submitted/10 text-status-submitted",
    bar: "from-[#3b82f6] to-[#60a5fa]",
    spark: "bg-[#60a5fa]",
  },
  amber: {
    chip: "border-status-disputed/25 bg-status-disputed/10 text-status-disputed",
    bar: "from-[#f59e0b] to-[#fbbf24]",
    spark: "bg-[#fbbf24]",
  },
  teal: {
    chip: "border-brand-mint/25 bg-brand-mint/10 text-brand-mint",
    bar: "from-[#0d9488] to-[#2dd4bf]",
    spark: "bg-[#2dd4bf]",
  },
  violet: {
    chip: "border-brand-violet/25 bg-brand-violet/10 text-brand-violet",
    bar: "from-[#7c3aed] to-[#a78bfa]",
    spark: "bg-[#a78bfa]",
  },
} as const;

/**
 * Premium stat card. Pass `countTo` (a number) to animate a count-up reveal,
 * or `value` (any node) for static content such as a formatted USDC amount.
 * Optional `trend` renders a small sparkline; `delta` renders a change chip.
 */
export function MetricCard({
  label,
  value,
  countTo,
  decimals = 0,
  prefix = "",
  suffix = "",
  icon: Icon,
  tone = "emerald",
  hint,
  trend,
  delta,
  className,
}: {
  label: ReactNode;
  value?: ReactNode;
  countTo?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  tone?: keyof typeof tones;
  hint?: ReactNode;
  trend?: number[];
  delta?: { value: ReactNode; positive?: boolean };
  className?: string;
}) {
  const t = tones[tone];
  const maxTrend = trend && trend.length ? Math.max(...trend, 1) : 1;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <GlassCard interactive className={cn("p-5", className)}>
        {/* tone accent bar */}
        <span
          aria-hidden
          className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70", t.bar)}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="count-pop mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-3xl">
              {typeof countTo === "number" ? (
                <CountUp value={countTo} decimals={decimals} prefix={prefix} suffix={suffix} />
              ) : (
                <>
                  {prefix}
                  {value}
                  {suffix}
                </>
              )}
            </p>
            {delta ? (
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                  delta.positive === false
                    ? "border-rose-400/25 bg-rose-500/10 text-rose-200"
                    : "border-status-open/20 bg-status-open/10 text-status-open",
                )}
              >
                {delta.positive === false ? (
                  <TrendingDown className="size-3" />
                ) : (
                  <TrendingUp className="size-3" />
                )}
                {delta.value}
              </span>
            ) : null}
            {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
          </div>
          {Icon ? (
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-lg shadow-black/20",
                t.chip,
              )}
            >
              <Icon className="size-5" />
            </span>
          ) : null}
        </div>

        {trend && trend.length > 1 ? (
          <div className="mt-4 flex h-8 items-end gap-1">
            {trend.map((point, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-sm opacity-70", t.spark)}
                style={{ height: `${Math.max(12, (point / maxTrend) * 100)}%` }}
              />
            ))}
          </div>
        ) : null}
      </GlassCard>
    </motion.div>
  );
}
