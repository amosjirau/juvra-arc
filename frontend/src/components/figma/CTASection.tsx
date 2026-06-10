"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="relative py-36 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #0a0514 40%, #060816 100%)",
      }}
    >
      {/* Large glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-[#FF7A18]/6 rounded-full blur-[120px]" />
        <div className="absolute w-[500px] h-[300px] bg-[#B46CFF]/5 rounded-full blur-[100px] translate-y-8" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,122,24,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,24,1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A18]/10 border border-[#FF7A18]/20 text-[#FF7A18] text-xs uppercase tracking-widest mb-10">
            <Shield size={11} />
            Agent-assisted, human-confirmed
          </div>

          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-7xl text-white leading-[1.0] tracking-tight mb-8"
          >
            Coordinate work.
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] via-[#FFB347] to-[#FF7A18]">
              Confirm settlement.
            </em>
            <br />
            Build on Arc.
          </h2>

          <p className="text-[#8892a4] text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Juvra is an agentic freelance commerce network where AI helps organize scope, evidence, and disputes while USDC escrow actions remain manually confirmed on Arc.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#FF7A18] px-8 py-4 text-sm font-semibold text-[#060816] shadow-[0_8px_32px_rgba(255,122,24,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FF9A4A] hover:shadow-[0_8px_40px_rgba(255,122,24,0.5)]"
            >
              Launch App
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-sm text-[#8892a4] transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              See How Escrow Works
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-[#8892a4] text-xs">
            {["Built for Arc + USDC commerce", "Decision support only", "Manual wallet confirmation", "Future-ready Circle layers"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#8892a4]" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
