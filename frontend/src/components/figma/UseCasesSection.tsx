"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Building2, User, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

const cases = [
  {
    audience: "For Clients",
    icon: Building2,
    headline: "Commission with confidence.",
    description:
      "Lock funds once. Approve milestones as they complete. No invoices, no delays, no trust required. Your USDC is safe until work is delivered.",
    features: [
      "Funds locked before work begins",
      "Milestone-gated release",
      "AI-verified completion",
      "Full transaction history",
    ],
    accent: "#60a5fa",
    bg: "from-[#05101a] to-[#070d14]",
    border: "border-blue-500/20",
    cta: "Post a Job",
    href: "/post",
  },
  {
    audience: "For Freelancers",
    icon: User,
    headline: "Get paid. Every time.",
    description:
      "Funds are locked before you start. Milestones protect your work. You can't be ghosted, reversed, or shortchanged on Juvra.",
    features: [
      "Guaranteed escrow before work",
      "Milestone-based payment",
      "Dispute protection",
      "On-chain reputation score",
    ],
    accent: "#FF7A18",
    bg: "from-[#1a0e05] to-[#100a03]",
    border: "border-[#FF7A18]/20",
    cta: "Find Work",
    href: "/jobs",
  },
  {
    audience: "For Agencies",
    icon: Briefcase,
    headline: "Scale without risk.",
    description:
      "Manage multiple client contracts simultaneously. Multi-milestone escrow, team payouts, and institutional-grade reporting — all on Arc.",
    features: [
      "Multi-contract dashboard",
      "Team payout routing",
      "Client whitelabeling",
      "Compliance-ready records",
    ],
    accent: "#B46CFF",
    bg: "from-[#100a1a] to-[#090612]",
    border: "border-[#B46CFF]/20",
    cta: "Contact Sales",
    href: "/dashboard",
  },
];

export function UseCasesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{ background: "#060816" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#60a5fa]/10 border border-[#60a5fa]/20 text-[#60a5fa] text-xs uppercase tracking-widest mb-6">
            Use Cases
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl text-white"
          >
            Built for every side
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#3b82f6]">
              of the deal.
            </em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <motion.div
              key={c.audience}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative rounded-3xl border bg-gradient-to-b ${c.bg} ${c.border} p-8 flex flex-col overflow-hidden hover:-translate-y-2 transition-all duration-500`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.accent}06 0%, transparent 60%)` }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${c.accent}50, transparent)` }}
              />

              <div className="relative">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border"
                  style={{
                    background: `${c.accent}15`,
                    borderColor: `${c.accent}30`,
                    boxShadow: `0 0 24px ${c.accent}15`,
                  }}
                >
                  <c.icon size={20} style={{ color: c.accent }} />
                </div>

                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: c.accent }}>{c.audience}</p>
                <h3
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}
                  className="text-white mb-4 leading-snug"
                >
                  {c.headline}
                </h3>
                <p className="text-[#8892a4] text-sm leading-relaxed mb-8">{c.description}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${c.accent}15`, border: `1px solid ${c.accent}30` }}
                      >
                        <div className="w-1 h-1 rounded-full" style={{ background: c.accent }} />
                      </div>
                      <span className="text-[#8892a4] text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all duration-300 group-hover:shadow-lg"
                  href={c.href}
                  style={{
                    borderColor: `${c.accent}30`,
                    color: c.accent,
                    background: `${c.accent}10`,
                  }}
                >
                  {c.cta}
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
