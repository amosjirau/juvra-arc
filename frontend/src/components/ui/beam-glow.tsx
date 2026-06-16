import { cn } from "@/lib/utils";

/**
 * Soft radial glow accent for hero/section depth. Position via `className`
 * (e.g. "top-0 left-1/2 h-72 w-72 -translate-x-1/2").
 */
export function BeamGlow({
  className,
  color = "rgba(255,122,24,0.32)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-3xl", className)}
      style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
    />
  );
}
