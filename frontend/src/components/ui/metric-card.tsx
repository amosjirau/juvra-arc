"use client";

import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/ui/count-up";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tone =
  | "emerald"
  | "sky"
  | "blue"
  | "amber"
  | "teal"
  | "violet";

/**
 * Editorial stat card. Neutral paper surface with a single accent. Pass
 * `countTo` for an animated count-up, or `value` for static content. `tone` is
 * accepted for call-site compatibility but no longer drives multi-color styling.
 */
export function MetricCard({
  label,
  value,
  countTo,
  decimals = 0,
  prefix = "",
  suffix = "",
  icon: Icon,
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
  tone?: Tone;
  hint?: ReactNode;
  trend?: number[];
  delta?: { value: ReactNode; positive?: boolean };
  className?: string;
}) {
  const maxTrend = trend && trend.length ? Math.max(...trend, 1) : 1;

  return (
    <motion.div initial="hidden" variants={fadeUp} viewport={viewportOnce} whileInView="visible">
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-line bg-paper-raised p-5",
          className,
        )}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent-orange/60" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-2 font-serif text-3xl tracking-tight text-ink tabular-nums">
              {typeof countTo === "number" ? (
                <CountUp decimals={decimals} prefix={prefix} suffix={suffix} value={countTo} />
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
                  "mt-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs font-medium",
                  delta.positive === false ? "text-rose-600" : "text-ink",
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
            {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
          </div>
          {Icon ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink">
              <Icon className="size-5" />
            </span>
          ) : null}
        </div>

        {trend && trend.length > 1 ? (
          <div className="mt-4 flex h-8 items-end gap-1">
            {trend.map((point, i) => (
              <span
                className="flex-1 rounded-sm bg-ink/15"
                key={i}
                style={{ height: `${Math.max(12, (point / maxTrend) * 100)}%` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
