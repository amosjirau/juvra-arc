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
 * A feature cell for a bento grid. Spanning is controlled by passing
 * col/row span utilities via `className`.
 */
export function BentoCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  glow = false,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <GlassCard interactive glow={glow} className={cn("flex flex-col gap-4 p-6", className)}>
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#34d399] shadow-lg shadow-black/20">
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
