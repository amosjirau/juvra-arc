"use client";

import { motion, useInView } from "motion/react";
import { Network, ShieldCheck, Workflow } from "lucide-react";
import { useRef } from "react";

const arcPoints = [
  {
    icon: Network,
    label: "Programmable settlement",
    text: "Escrow terms and milestone states can be represented transparently onchain.",
  },
  {
    icon: Workflow,
    label: "Milestone workflows",
    text: "Agreements can move from funded to submitted to approved with a clear audit trail.",
  },
  {
    icon: ShieldCheck,
    label: "Dispute visibility",
    text: "Evidence, status, and resolution history can stay visible to both parties.",
  },
];

export function ArcExplainerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="why-arc"
      className="relative overflow-hidden py-24"
      style={{ background: "linear-gradient(180deg, #060816 0%, #080d1a 55%, #060816 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-3 py-1.5 text-xs uppercase tracking-widest text-[#60a5fa]">
            What is Arc
          </span>
          <h2
            className="mb-5 text-4xl text-white md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Arc?
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-[#8892a4]">
            Arc provides programmable settlement infrastructure that allows escrow agreements,
            milestone releases, and dispute workflows to be enforced transparently onchain.
          </p>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-3">
          {arcPoints.map((point, index) => (
            <motion.div
              key={point.label}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + index * 0.08 }}
              className="rounded-2xl border border-white/8 bg-[#111827]/70 p-5"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-[#60a5fa]/25 bg-[#60a5fa]/10 text-[#60a5fa]">
                <point.icon className="size-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{point.label}</h3>
              <p className="text-sm leading-relaxed text-[#8892a4]">{point.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
