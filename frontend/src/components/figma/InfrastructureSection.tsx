"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Zap, Globe, Code2, Shield } from "lucide-react";

import { arcExplorerUrl } from "@/lib/arc";
import { isEscrowConfigured, juvraEscrowAddress } from "@/lib/juvraEscrow";

const partners = [
  {
    name: "Arc",
    description: "Settlement Layer",
    icon: Zap,
    accent: "#FF7A18",
    detail: "Programmable escrow logic and onchain job state.",
  },
  {
    name: "USDC",
    description: "Settlement Currency",
    icon: Globe,
    accent: "#2775ca",
    detail: "Stable settlement asset for freelance commerce.",
  },
  {
    name: "Circle",
    description: "Future Wallet Layer",
    icon: Shield,
    accent: "#34d399",
    detail: "Planned secure wallet infrastructure for agent-assisted transaction preparation.",
  },
  {
    name: "Juvra Agent",
    description: "Coordination Layer",
    icon: Code2,
    accent: "#B46CFF",
    detail: "Advisory scope, evidence, risk, and dispute reasoning.",
  },
];

export function InfrastructureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060816 0%, #070a14 50%, #060816 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle constellation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="120" height="104" patternUnits="userSpaceOnUse">
              <polygon points="60,2 117,32 117,72 60,102 3,72 3,32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A18]/10 border border-[#FF7A18]/20 text-[#FF7A18] text-xs uppercase tracking-widest mb-6">
            Infrastructure
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl text-white mb-6"
          >
            Agentic commerce,
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] to-[#FFB347]">
              settled on Arc.
            </em>
          </h2>
          <p className="text-[#8892a4] text-lg max-w-2xl mx-auto">
            AI coordinates economic activity, Arc enforces escrow state, and USDC settles value with predictable stablecoin rails.
          </p>
        </motion.div>

        {/* Central node visualization */}
        <div className="relative max-w-3xl mx-auto">
          {/* Central Juvra node with pulse rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center mb-16"
          >
            <div className="relative flex items-center justify-center">
              {/* Animated concentric rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border border-[#FF7A18]/20"
                  style={{ width: `${ring * 72}px`, height: `${ring * 72}px` }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.08, 0.4] }}
                  transition={{
                    duration: 3.5,
                    delay: ring * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {/* Ambient glow */}
              <div className="absolute w-40 h-40 rounded-full bg-[#FF7A18]/8 blur-3xl" />
              {/* Node */}
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF7A18]/30 to-[#FF7A18]/10 border border-[#FF7A18]/30 flex items-center justify-center shadow-[0_0_48px_rgba(255,122,24,0.25)]">
                <span style={{ fontFamily: "var(--font-display)" }} className="text-white text-2xl">J</span>
              </div>
            </div>
          </motion.div>

          {/* Partner cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl border border-white/8 bg-[#111827]/60 p-5 text-center hover:border-white/15 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.accent}08 0%, transparent 70%)` }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: `${p.accent}15`,
                    borderColor: `${p.accent}30`,
                  }}
                >
                  <p.icon size={20} style={{ color: p.accent }} />
                </div>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-white text-lg mb-1">{p.name}</p>
                <p className="text-[#8892a4] text-xs mb-3">{p.description}</p>
                <p className="text-[#8892a4] text-xs leading-relaxed">{p.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-[#8892a4] text-sm">
            All contracts are publicly verifiable on-chain.{" "}
            <a
              href={isEscrowConfigured() ? `${arcExplorerUrl}/address/${juvraEscrowAddress}` : "/jobs"}
              className="rounded text-[#FF7A18] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A18]/40"
              rel="noreferrer"
              target={isEscrowConfigured() ? "_blank" : undefined}
            >
              View contract registry →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
