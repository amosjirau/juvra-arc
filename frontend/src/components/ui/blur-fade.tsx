"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { blurReveal, durations, easeOutSoft, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a blur + fade-up as they scroll into view.
 */
export function BlurFade({
  children,
  className,
  delay = 0,
  inView = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={blurReveal}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: viewportOnce }
        : { animate: "visible" })}
      transition={{ duration: durations.slow, ease: easeOutSoft, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline that reveals word-by-word with a blur/fade. Keeps text selectable
 * and accessible (renders the full string, just animates spans).
 */
export function BlurFadeText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={cn("text-balance", className)}>
      <motion.span
        className="inline"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(stagger, delay)}
      >
        {words.map((word, i) => (
          <motion.span key={`${word}-${i}`} className="inline-block" variants={blurReveal}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
