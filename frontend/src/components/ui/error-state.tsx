import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Consistent error surface for failed loads / actions, with an optional
 * retry action.
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
    <div
      className={cn(
        "rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-8 text-center shadow-2xl shadow-black/20 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-300">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
