"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Shield, Lock, ChevronDown } from "lucide-react";
import Link from "next/link";

import { formatUsdc, shortAddress } from "@/lib/format";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { DEMO_ESCROW_FLOW, DEMO_STATS } from "@/lib/landing-demo-data";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const defaultHeroStats = [
  { label: "Escrowed", value: `$${(DEMO_STATS.escrowedVolume / 1_000).toFixed(1)}K` },
  { label: "Active Contracts", value: DEMO_STATS.activeContracts.toLocaleString() },
  { label: "Avg Trust Score", value: DEMO_STATS.trustScore },
];

function EscrowViz({ job }: { job?: JuvraJob }) {
  const client = job ? shortAddress(job.client) : DEMO_ESCROW_FLOW.clientWallet;
  const freelancer =
    job && job.freelancer !== "0x0000000000000000000000000000000000000000"
      ? shortAddress(job.freelancer)
      : DEMO_ESCROW_FLOW.freelancerWallet;
  const lockedAmount = job ? formatUsdc(job.amount) : DEMO_ESCROW_FLOW.lockedAmount;
  const earnedAmount = job
    ? job.status === 3
      ? lockedAmount
      : "Pending"
    : "In escrow";
  const milestoneAmounts = job
    ? [
        { label: "Start", amount: formatUsdc(job.amount / 4n), status: "done" },
        { label: "Build", amount: formatUsdc(job.amount / 2n), status: "active" },
        { label: "Review", amount: formatUsdc(job.amount - job.amount / 4n - job.amount / 2n), status: "pending" },
      ]
    : DEMO_ESCROW_FLOW.milestones;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow behind */}
      <div
        className="absolute inset-0 blur-3xl -z-10 scale-150"
        style={{
          background:
            "radial-gradient(circle, rgba(255,122,24,0.2) 0%, rgba(180,108,255,0.1) 45%, transparent 70%)",
        }}
      />

      {/* Central vault */}
      <div className="relative flex flex-col items-center gap-0">
        {/* Client */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full bg-[#111827]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-blue-400 text-xs font-mono">C</span>
          </div>
          <div>
            <p className="text-xs text-[#8892a4] uppercase tracking-widest">Client Wallet</p>
            <p className="text-white text-sm font-mono">{client}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#8892a4]">Escrow</p>
            <p className="text-emerald-400 text-sm font-mono">{lockedAmount}</p>
          </div>
        </motion.div>

        {/* Arrow down */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col items-center gap-0 py-2"
        >
          <div className="w-px h-6 bg-gradient-to-b from-blue-500/60 to-[#FF7A18]/60" />
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={14} className="text-[#FF7A18]" />
          </motion.div>
        </motion.div>

        {/* Escrow Vault - centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="relative bg-gradient-to-b from-[#1a1030] to-[#0d0820] border border-[#B46CFF]/30 rounded-2xl p-5 shadow-[0_0_48px_rgba(180,108,255,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#B46CFF]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B46CFF]/60 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B46CFF]/30 to-[#7C3AED]/20 border border-[#B46CFF]/40 flex items-center justify-center shadow-[0_0_16px_rgba(180,108,255,0.3)]">
                  <Lock size={16} className="text-[#B46CFF]" />
                </div>
                <div>
                  <p className="text-[#B46CFF] text-xs uppercase tracking-widest font-mono">Escrow Vault</p>
                  <p className="text-white text-sm">Funds Locked</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs border border-emerald-500/20">
                    {job ? "Active" : DEMO_ESCROW_FLOW.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["3 Milestones", "USDC", "Verified"].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-white text-xs">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-[#FF7A18]/10 border border-[#FF7A18]/20 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[#8892a4] text-xs">Locked Amount</span>
                <span className="text-[#FF7A18] font-mono text-sm">{lockedAmount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-col items-center gap-0 py-2"
        >
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
          >
            <ChevronDown size={14} className="text-[#FF7A18]" />
          </motion.div>
          <div className="w-px h-6 bg-gradient-to-b from-[#FF7A18]/60 to-emerald-500/60" />
        </motion.div>

        {/* Milestones row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="w-full flex gap-2"
        >
        {milestoneAmounts.map((m) => (
            <div
              key={m.label}
              className={`flex-1 rounded-xl p-2 border text-center ${
                m.status === "done"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : m.status === "active"
                  ? "bg-[#FF7A18]/10 border-[#FF7A18]/25 text-[#FF7A18]"
                  : "bg-white/5 border-white/10 text-[#8892a4]"
              }`}
            >
              <p className="text-xs">{m.label}</p>
              <p className="text-xs font-mono mt-0.5">{m.amount}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.95, duration: 0.4 }}
          className="flex flex-col items-center gap-0 py-2"
        >
          <div className="w-px h-6 bg-gradient-to-b from-emerald-500/60 to-emerald-500/20" />
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
          >
            <ChevronDown size={14} className="text-emerald-400" />
          </motion.div>
        </motion.div>

        {/* Freelancer wallet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="w-full bg-[#111827]/80 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-mono">F</span>
          </div>
          <div>
            <p className="text-xs text-[#8892a4] uppercase tracking-widest">Freelancer Wallet</p>
            <p className="text-white text-sm font-mono">{freelancer}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#8892a4]">Earned</p>
            <p className="text-emerald-400 text-sm font-mono">{earnedAmount}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function HeroSection({
  job,
  stats = defaultHeroStats,
}: {
  job?: JuvraJob;
  stats?: Array<{ label: string; value: string }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(180,108,255,0.12) 0%, transparent 60%), #060816" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient orbs */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-[#FF7A18]/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-[5%] w-80 h-80 bg-[#B46CFF]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A18]/10 border border-[#FF7A18]/20 text-[#FF7A18] text-xs uppercase tracking-widest mb-8"
            >
              <Shield size={12} />
              Agent-assisted, human-confirmed · Arc + USDC
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="visible"
              style={{ fontFamily: "var(--font-display)" }}
              className="text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-6"
            >
              Agentic escrow
              <br />
              <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] to-[#FFB347]">
                for freelance
              </em>{" "}
              commerce on Arc.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="text-[#8892a4] text-lg leading-relaxed mb-10 max-w-xl"
            >
              Juvra helps clients and freelancers structure work, review
              delivery evidence, and resolve disputes with AI-assisted
              recommendations while escrow settlement remains wallet-confirmed
              on Arc.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/jobs"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#FF7A18] text-[#060816] hover:bg-[#FF9A4A] transition-all duration-300 shadow-[0_8px_32px_rgba(255,122,24,0.35)] hover:shadow-[0_8px_40px_rgba(255,122,24,0.5)] hover:-translate-y-0.5"
              >
                Launch App
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-[#8892a4] hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                See How Escrow Works
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="visible"
              className="mt-12 flex gap-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-white text-2xl font-semibold">{s.value}</p>
                  <p className="text-[#8892a4] text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: escrow viz */}
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <EscrowViz job={job} />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060816] to-transparent pointer-events-none" />
    </section>
  );
}
