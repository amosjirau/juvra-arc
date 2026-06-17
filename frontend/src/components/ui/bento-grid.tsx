import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export function BentoGrid({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A feature cell for a bento grid: gradient icon tile, corner glow, and the
 * spotlight glass surface. Spanning is controlled via `className`.
 */
export function BentoCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  glow = false,
  beam = false,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  glow?: boolean;
  beam?: boolean;
}) {
  return (
    <GlassCard
      interactive
      glow={glow}
      beam={beam}
      className={cn("group/bento flex flex-col gap-4 p-6", className)}
    >
      {/* corner glow that intensifies on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover/bento:opacity-100"
      />
      {Icon ? (
        <span className="relative flex size-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/20 to-sky-400/10 text-[#34d399] shadow-lg shadow-emerald-950/30 transition-transform duration-300 group-hover/bento:-translate-y-0.5">
          <span className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
        {description ? (
          <p className="text-sm leading-6 text-zinc-400">{description}</p>
        ) : null}
      </div>
      {children}
    </GlassCard>
  );
}
