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
        "group/cta inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-ink bg-ink font-semibold text-paper transition-all duration-200 outline-none hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:ring-3 focus-visible:ring-ink/25 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "lg" ? "h-12 px-6 text-base" : "h-11 px-5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
