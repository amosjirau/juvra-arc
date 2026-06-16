import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

/**
 * Titled container for a dashboard/admin region: header row with optional
 * icon + action slot, and a padded body.
 */
export function DashboardPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <GlassCard className={cn("flex flex-col", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#ff9a4a]">
              <Icon className="size-4" />
            </span>
          ) : null}
          <div>
            <h3 className="font-heading text-base font-semibold text-white">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-zinc-400">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </GlassCard>
  );
}
