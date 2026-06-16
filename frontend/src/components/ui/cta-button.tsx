import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Primary brand call-to-action: gradient fill + animated glow border.
 * Pass `asChild` to render a Next.js <Link> while keeping the styling.
 */
export function CTAButton({
  className,
  asChild = false,
  size = "default",
  ...props
}: ComponentProps<"button"> & { asChild?: boolean; size?: "default" | "lg" }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="cta-button"
      className={cn(
        "glow-border group/cta inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#ff7a18]/30 bg-gradient-to-br from-[#ff7a18] to-[#ff5e1a] font-semibold text-white shadow-[0_14px_40px_rgba(255,122,24,0.28)] transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(255,122,24,0.36)] focus-visible:ring-3 focus-visible:ring-[#ff7a18]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "lg" ? "h-12 px-6 text-base" : "h-11 px-5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
