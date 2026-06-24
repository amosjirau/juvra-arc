"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { blurReveal, fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Premium page header: animated eyebrow chip with a live pulse dot, a
 * blur-fade display title, supporting copy, and an actions slot. Entrance is
 * staggered via the shared motion primitives (reduced-motion safe).
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  actions,
  gradient = true,
  className,
  align = "start",
}: {
  eyebrow?: ReactNode;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  gradient?: boolean;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.1, 0.04)}
      className={cn(
        "relative flex flex-col gap-5",
        align === "center"
          ? "items-center text-center"
          : "items-start sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-24 -z-10 h-56 w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_70%)] blur-2xl",
          align === "center" ? "left-1/2 -translate-x-1/2" : "-left-10",
        )}
      />
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <motion.span variants={fadeUp} className="eyebrow">
            {EyebrowIcon ? <EyebrowIcon className="size-3.5 text-[#34d399]" /> : null}
            {eyebrow}
          </motion.span>
        ) : null}
        <motion.h1
          variants={blurReveal}
          className={cn(
            "text-display-1 mt-4 font-semibold text-balance",
            gradient ? "heading-gradient" : "text-white",
          )}
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-xl text-base leading-7 text-zinc-400"
          >
            {description}
          </motion.p>
        ) : null}
      </div>
      {actions ? (
        <motion.div
          variants={fadeUp}
          className="flex shrink-0 flex-wrap items-center gap-3"
        >
          {actions}
        </motion.div>
      ) : null}
    </motion.header>
  );
}
