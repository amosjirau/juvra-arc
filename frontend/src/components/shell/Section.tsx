import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vertical rhythm wrapper for a content block. Anchor-friendly via `id`.
 */
export function Section({
  id,
  children,
  className,
  spacing = "default",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  spacing?: "tight" | "default" | "loose";
}) {
  const spacingClass =
    spacing === "tight" ? "py-8" : spacing === "loose" ? "py-20 sm:py-28" : "py-12 sm:py-16";

  return (
    <section id={id} className={cn("scroll-mt-28", spacingClass, className)}>
      {children}
    </section>
  );
}
