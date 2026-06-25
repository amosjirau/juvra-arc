"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { fadeUp, viewportOnce } from "@/lib/motion";

type MotionDivProps = ComponentPropsWithoutRef<typeof motion.div>;

/**
 * Generic scroll-reveal wrapper. Defaults to a subtle fade-up that triggers
 * once when ~25% in view. Reduced-motion users get an instant render (the
 * global CSS block zeroes out transition/animation durations).
 */
export function MotionWrapper({
  children,
  variants = fadeUp,
  delay,
  className,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  as?: keyof typeof motion;
} & Omit<MotionDivProps, "variants">) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
}
