import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Secondary call-to-action: glassy surface with an animated glow border.
 */
export function GlowButton({
  className,
  asChild = false,
  size = "default",
  ...props
}: ComponentProps<"button"> & { asChild?: boolean; size?: "default" | "lg" }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="glow-button"
      className={cn(
        "glow-border inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] font-semibold text-white backdrop-blur transition-all duration-200 outline-none hover:-translate-y-0.5 hover:bg-white/[0.1] focus-visible:ring-3 focus-visible:ring-white/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "lg" ? "h-12 px-6 text-base" : "h-11 px-5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
