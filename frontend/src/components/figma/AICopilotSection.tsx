"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Brain, Search, AlertTriangle, Scale, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

import { formatUsdc } from "@/lib/format";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { DEMO_AGENT } from "@/lib/landing-demo-data";

const capabilities = [
  {
    icon: Brain,
    title: "Milestone Tracking",
    description: "Monitors completion of each milestone against defined deliverables in real-time.",
    status: "Active",
    statusColor: "#34d399",
  },
  {
    icon: Search,
    title: "Evidence Review",
    description: "Scans submitted work, documents, and assets to verify milestone completion.",
    status: "Scanning",
    statusColor: "#60a5fa",
  },
  {
    icon: AlertTriangle,
    title: "Risk Detection",
    description: "Identifies behavioral anomalies, late signals, and quality degradation patterns.",
    status: "Monitoring",
    statusColor: "#f59e0b",
  },
  {
    icon: Scale,
    title: "Dispute Analysis",
    description: "Reviews both parties' evidence and provides structured analysis for resolution.",
    status: "On Standby",
    statusColor: "#8892a4",
  },
  {
    icon: CreditCard,
    title: "Payment Recommendations",
    description: "Suggests release amounts based on completion percentage and quality metrics.",
    status: "Ready",
    statusColor: "#B46CFF",
  },
];

export function AICopilotSection({ isDemo, job }: { isDemo?: boolean; job?: JuvraJob }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const useDemo = isDemo || !job;
  const contractId = useDemo ? DEMO_AGENT.contract : `ESC-${job?.id.toString().padStart(4, "0")}`;
  const jobTitle = useDemo ? DEMO_AGENT.recommendation : job?.title ?? DEMO_AGENT.recommendation;
  const progress = useDemo ? 74 : 62;
  const releaseAmount = useDemo || !job ? "500 USDC" : formatUsdc(job.amount);
  const assessment = useDemo
    ? `${DEMO_AGENT.reason} Recommended next step: ${DEMO_AGENT.recommendation}.`
    : `Milestone evidence ready for review. Recommend releasing ${releaseAmount} after client approval. No anomalies detected.`;

  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #0d0620 60%, #060816 100%)",
      }}
    >
      {/* Right ambient */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B46CFF]/6 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: interface preview */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative rounded-3xl border border-[#B46CFF]/20 bg-[#0d0a1a] overflow-hidden shadow-[0_0_80px_rgba(180,108,255,0.12)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B46CFF]/50 to-transparent" />

              {/* Header bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#B46CFF]/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B46CFF]/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B46CFF]/25" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B46CFF]/15" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#B46CFF]/40 to-[#7C3AED]/20 flex items-center justify-center">
                    <Brain size={12} className="text-[#B46CFF]" />
                  </div>
                  <span className="text-[#8892a4] text-xs font-mono">AI Settlement Copilot</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B46CFF] animate-pulse ml-1" />
                </div>
              </div>

              {/* Active contract context */}
              <div className="p-5 border-b border-[#B46CFF]/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#8892a4] text-xs uppercase tracking-widest">Escrow</span>
                  <div className="flex items-center gap-2">
                    {useDemo && (
                      <span className="text-[10px] uppercase tracking-widest text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded">
                        Preview Analysis
                      </span>
                    )}
                    <span className="text-xs font-mono text-[#B46CFF] bg-[#B46CFF]/10 px-2 py-0.5 rounded">{contractId}</span>
                  </div>
                </div>
                {useDemo && <p className="text-[10px] uppercase tracking-widest text-[#8892a4]">Recommendation</p>}
                <p className="text-white text-sm mb-2">{jobTitle}</p>
                {useDemo && (
                  <div className="mb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-[#8892a4]">Risk</p>
                        <p className="text-xs text-emerald-300">{DEMO_AGENT.risk}</p>
                      </div>
                      <div className="rounded-lg border border-[#B46CFF]/20 bg-[#B46CFF]/10 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-widest text-[#8892a4]">Contract</p>
                        <p className="text-xs text-[#B46CFF]">{DEMO_AGENT.status}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#8892a4]">Reason</p>
                      <p className="text-xs text-white">{DEMO_AGENT.reason}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${progress}%` } : {}}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#B46CFF] to-[#7C3AED] rounded-full"
                    />
                  </div>
                  <span className="text-[#8892a4] text-xs">{progress}% complete</span>
                </div>
              </div>

              {/* Capability rows */}
              <div className="p-5 space-y-3">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#B46CFF]/20 transition-colors duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#B46CFF]/10 flex items-center justify-center flex-shrink-0">
                      <cap.icon size={14} className="text-[#B46CFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs mb-0.5">{cap.title}</p>
                      <p className="text-[#8892a4] text-xs truncate">{cap.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cap.statusColor }} />
                      <span className="text-xs" style={{ color: cap.statusColor }}>{cap.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI message */}
              <div className="px-5 pb-5">
                <div className="rounded-xl bg-[#B46CFF]/8 border border-[#B46CFF]/15 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#B46CFF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain size={12} className="text-[#B46CFF]" />
                    </div>
                    <div>
                      <p className="text-[#8892a4] text-xs mb-1">Copilot Assessment</p>
                      <p className="text-white text-xs leading-relaxed">
                        {assessment} Client approval confidence: <span className="text-[#B46CFF]">{DEMO_AGENT.confidence}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B46CFF]/10 border border-[#B46CFF]/20 text-[#B46CFF] text-xs uppercase tracking-widest mb-8">
              <Brain size={11} />
              AI Copilot
            </span>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="text-4xl md:text-5xl text-white mb-6 leading-tight"
            >
              Settlement intelligence,
              <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#B46CFF] to-[#7C3AED]"> built in.</em>
            </h2>
            <p className="text-[#8892a4] text-lg leading-relaxed mb-8">
              The AI Copilot monitors every contract in real-time. It reviews evidence, detects risk, analyzes disputes, and recommends payment releases — so human judgment is spent where it matters.
            </p>

            <div className="space-y-4 mb-10">
              {["No chatbot interface", "Evidence-based analysis", "Milestone-linked intelligence"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#B46CFF]/15 border border-[#B46CFF]/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B46CFF]" />
                  </div>
                  <span className="text-[#8892a4] text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#B46CFF] text-sm hover:gap-3 transition-all duration-200"
            >
              See AI Copilot in dashboard <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
