"use client";

import { useRef, type ComponentProps, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

/**
 * Token-backed glass surface with a brand sheen and a mouse-tracked spotlight.
 *
 * - `interactive` - hover lift + spotlight follow (spotlight on by default).
 * - `glow` - static animated gradient border.
 * - `beam` - traveling conic border beam (Magic UI style).
 * - `spotlight` - force the cursor-follow glow on/off independently.
 */
export function GlassCard({
  className,
  interactive = false,
  // glow/beam accepted for call-site compatibility; decorative effects removed.
  glow: _glow,
  beam: _beam,
  spotlight,
  children,
  ...props
}: ComponentProps<"div"> & {
  interactive?: boolean;
  glow?: boolean;
  beam?: boolean;
  spotlight?: boolean;
}) {
  void _glow;
  void _beam;
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
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-paper-raised text-ink",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_28px_60px_-42px_rgba(28,25,23,0.45)]",
        className,
      )}
      onPointerMove={onPointerMove}
      ref={ref}
      {...props}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
