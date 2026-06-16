"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Shield, UserCheck, ThumbsUp, Coins, FileText, AlertCircle } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "Agentic Commerce Layer",
    description: "AI coordinates scope, evidence, risk, and dispute reasoning while Arc executes escrow logic transparently.",
    size: "large",
    accent: "#FF7A18",
    bg: "from-[#1a0e05] to-[#0d0a06]",
    border: "border-[#FF7A18]/20",
    glow: "rgba(255,122,24,0.08)",
  },
  {
    icon: UserCheck,
    title: "Freelancer Confidence",
    description: "Milestones, delivery evidence, and USDC escrow create clearer payment expectations before work begins.",
    size: "small",
    accent: "#34d399",
    bg: "from-[#051a10] to-[#040d09]",
    border: "border-emerald-500/20",
    glow: "rgba(52,211,153,0.06)",
  },
  {
    icon: ThumbsUp,
    title: "Client Control",
    description: "Clients get AI-assisted delivery review while every settlement action still requires explicit wallet confirmation.",
    size: "small",
    accent: "#60a5fa",
    bg: "from-[#050f1a] to-[#04090d]",
    border: "border-blue-400/20",
    glow: "rgba(96,165,250,0.06)",
  },
  {
    icon: Coins,
    title: "USDC Settlement",
    description: "Stablecoin settlement keeps freelance escrow value predictable from funding through review.",
    size: "small",
    accent: "#B46CFF",
    bg: "from-[#100a1a] to-[#080610]",
    border: "border-[#B46CFF]/20",
    glow: "rgba(180,108,255,0.06)",
  },
  {
    icon: FileText,
    title: "Evidence-First Records",
    description: "Delivery links, notes, timelines, and agent results help turn subjective work into reviewable commerce context.",
    size: "small",
    accent: "#f59e0b",
    bg: "from-[#160f03] to-[#0b0902]",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.06)",
  },
  {
    icon: AlertCircle,
    title: "Dispute-Ready Workflow",
    description: "AI summarizes claims and evidence for human admins without resolving disputes or moving escrow automatically.",
    size: "large",
    accent: "#f43f5e",
    bg: "from-[#1a0508] to-[#0d0305]",
    border: "border-rose-500/20",
    glow: "rgba(244,63,94,0.08)",
  },
];

function BentoCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group rounded-2xl border p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] ${card.size === "large" ? "lg:col-span-2" : ""} ${card.border} bg-gradient-to-br ${card.bg}`}
      style={{ boxShadow: `0 0 0 1px ${card.accent}1a` }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 30% 30%, ${card.glow} 0%, transparent 70%)` }}
      />
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${card.accent}40, transparent)` }} />

      <div className="relative">
        <div
          className={`${card.size === "large" ? "w-12 h-12" : "w-10 h-10"} rounded-xl flex items-center justify-center mb-4 border`}
          style={{
            background: `${card.accent}15`,
            borderColor: `${card.accent}30`,
            boxShadow: `0 0 16px ${card.accent}20`,
          }}
        >
          <card.icon size={card.size === "large" ? 20 : 18} style={{ color: card.accent }} />
        </div>
        <h3
          style={{ fontFamily: "var(--font-display)", color: "white" }}
          className={`${card.size === "large" ? "text-2xl" : "text-xl"} mb-2`}
        >
          {card.title}
        </h3>
        <p className="text-[#8892a4] text-sm leading-relaxed">{card.description}</p>
      </div>
    </motion.div>
  );
}

export function WhyJuvraSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      className="relative py-28 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255,122,24,0.05) 0%, transparent 60%), #060816" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B46CFF]/10 border border-[#B46CFF]/20 text-[#B46CFF] text-xs uppercase tracking-widest mb-6">
            Why Juvra
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl text-white max-w-2xl leading-tight"
          >
            Infrastructure for an
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#B46CFF] to-[#7C3AED]"> agentic freelance network.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <BentoCard key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
