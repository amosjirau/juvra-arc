import { cn } from "@/lib/utils";

/**
 * Scoped grid overlay (masked to fade out). CSS-only, server-safe.
 */
export function AnimatedGridBackground({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000, transparent 78%)",
      }}
    />
  );
}
