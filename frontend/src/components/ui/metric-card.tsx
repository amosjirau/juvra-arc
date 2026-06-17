"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

const tones = {
  emerald: "border-status-open/20 bg-status-open/10 text-status-open",
  sky: "border-status-assigned/20 bg-status-assigned/10 text-status-assigned",
  blue: "border-status-submitted/20 bg-status-submitted/10 text-status-submitted",
  amber: "border-status-disputed/25 bg-status-disputed/10 text-status-disputed",
  teal: "border-brand-mint/25 bg-brand-mint/10 text-brand-mint",
  violet: "border-brand-violet/25 bg-brand-violet/10 text-brand-violet",
} as const;

/**
 * Premium stat card. Pass `countTo` (a number) to animate a count-up reveal,
 * or `value` (any node) for static content such as a formatted USDC amount.
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
  className?: string;
}) {
  return (
    <GlassCard interactive className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="count-pop mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
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
          {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-lg shadow-black/20",
              tones[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>
    </GlassCard>
  );
}
