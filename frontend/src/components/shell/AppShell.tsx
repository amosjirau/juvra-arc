import type { ReactNode } from "react";

import { Footer } from "@/components/figma/Footer";
import { AuroraBackground } from "@/components/shell/AuroraBackground";
import { cn } from "@/lib/utils";

/**
 * Consistent product-page wrapper: offsets the fixed floating navbar,
 * constrains content width, lays down an ambient background, and (optionally)
 * renders the shared footer. Provider wiring stays in app/layout.tsx.
 */
export function AppShell({
  children,
  className,
  contentClassName,
  showFooter = true,
  ambient = true,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  showFooter?: boolean;
  ambient?: boolean;
}) {
  return (
    <div className={cn("relative flex min-h-screen flex-col", className)}>
      {ambient ? <AuroraBackground /> : null}
      <main
        className={cn(
          "relative mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8",
          contentClassName,
        )}
      >
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
