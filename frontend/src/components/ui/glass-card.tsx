"use client";

import { useRef, type ComponentProps, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

/**
 * Token-backed glass surface with a brand sheen and a mouse-tracked spotlight.
 *
 * - `interactive` — hover lift + spotlight follow (spotlight on by default).
 * - `glow` — static animated gradient border.
 * - `beam` — traveling conic border beam (Magic UI style).
 * - `spotlight` — force the cursor-follow glow on/off independently.
 */
export function GlassCard({
  className,
  interactive = false,
  glow = false,
  beam = false,
  spotlight,
  children,
  ...props
}: ComponentProps<"div"> & {
  interactive?: boolean;
  glow?: boolean;
  beam?: boolean;
  spotlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const useSpotlight = spotlight ?? interactive;

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!useSpotlight) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "surface-2 relative overflow-hidden ring-1 ring-white/5",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-950/30",
        useSpotlight && "spotlight-surface",
        glow && "glow-border",
        beam && "border-beam",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.10),transparent_40%),linear-gradient(270deg,rgba(56,189,248,0.10),transparent_46%)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
