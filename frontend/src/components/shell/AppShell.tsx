"use client";

import { motion, useScroll, useSpring } from "motion/react";
import type { ReactNode } from "react";

import { Footer } from "@/components/figma/Footer";
import { AuroraBackground } from "@/components/shell/AuroraBackground";
import { cn } from "@/lib/utils";

/**
 * Consistent product-page wrapper: a top scroll-progress bar, an ambient
 * aurora field, the offset for the floating navbar, a constrained content
 * column with a soft page-enter reveal, and (optionally) the shared footer.
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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <div className={cn("relative flex min-h-screen flex-col", className)}>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="scroll-progress fixed inset-x-0 top-0 z-[100] h-0.5 origin-left"
      />
      {ambient ? <AuroraBackground /> : null}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8",
          contentClassName,
        )}
      >
        {children}
      </motion.main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
