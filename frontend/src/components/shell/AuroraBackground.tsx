import { cn } from "@/lib/utils";

/**
 * Ambient, GPU-cheap aurora background. CSS-only (no JS), so it works in
 * server components and is fully neutralized by the reduced-motion block.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div
        className="aurora-blob"
        style={{
          top: "-12%",
          left: "8%",
          width: "min(46vw, 540px)",
          height: "min(46vw, 540px)",
          background: "radial-gradient(circle, rgba(255,122,24,0.30), transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: "20%",
          right: "2%",
          width: "min(40vw, 480px)",
          height: "min(40vw, 480px)",
          background: "radial-gradient(circle, rgba(180,108,255,0.26), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
