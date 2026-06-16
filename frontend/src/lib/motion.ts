import type { Transition, Variants } from "motion/react";

/**
 * Shared motion primitives for Juvra-Arc.
 *
 * Keep these conservative: subtle distances, soft easing, fast durations.
 * All consuming components should also respect `prefers-reduced-motion`
 * (handled globally in globals.css, which neutralizes animations/transitions).
 */

export const easeOutSoft = [0.22, 1, 0.36, 1] as const;
export const easeInOutSoft = [0.65, 0, 0.35, 1] as const;

export const durations = {
  fast: 0.16,
  med: 0.32,
  slow: 0.64,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easeOutSoft },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.slow, ease: easeOutSoft },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.med, ease: easeOutSoft },
  },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.slow, ease: easeOutSoft },
  },
};

/** Parent container that staggers its children's `visible` transition. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0.04): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Sensible defaults for scroll-triggered reveals via `whileInView`. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

export const hoverLift: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 26,
};
