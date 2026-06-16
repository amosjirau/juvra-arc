import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Token-backed glass surface with a subtle brand sheen. Use `interactive`
 * for hover lift and `glow` for an animated gradient border.
 */
export function GlassCard({
  className,
  interactive = false,
  glow = false,
  children,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean; glow?: boolean }) {
  return (
    <div
      className={cn(
        "surface-2 relative overflow-hidden ring-1 ring-white/5",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-white/16 hover:shadow-2xl",
        glow && "glow-border",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,122,24,0.10),transparent_40%),linear-gradient(270deg,rgba(180,108,255,0.10),transparent_46%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
