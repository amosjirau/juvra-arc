"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal section that staggers its direct children. Pair with
 * <AnimatedItem> for each child you want revealed in sequence.
 */
export function AnimatedSection({
  children,
  className,
  id,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      id={id}
      className={cn("scroll-mt-28", className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
