"use client";

import { motion, useInView } from "motion/react";
import { CircleDollarSign, Layers3, Route, WalletCards, Zap } from "lucide-react";
import { useRef } from "react";

const stackCards = [
  {
    title: "Arc",
    status: "Live integration",
    icon: Zap,
    accent: "#10b981",
    points: [
      "Smart contract escrow layer",
      "Fast programmable commerce logic",
      "Onchain job state and settlement flow",
    ],
  },
  {
    title: "USDC",
    status: "Live settlement rail",
    icon: CircleDollarSign,
    accent: "#2775ca",
    points: [
      "Stable settlement asset for freelance commerce",
      "Predictable escrow value",
      "Cleaner payment experience than volatile tokens",
    ],
  },
  {
    title: "Circle Wallets Future Layer",
    status: "Planned integration",
    icon: WalletCards,
    accent: "#34d399",
    points: [
      "Secure wallet infrastructure for future agent-assisted transaction preparation",
      "Policy-aware wallet orchestration paths",
      "Human confirmation remains required",
    ],
  },
  {
    title: "Gateway / Nanopayments Future Path",
    status: "Future-ready architecture",
    icon: Route,
    accent: "#38bdf8",
    points: [
      "Future treasury routing",
      "Pay-per-agent verification",
      "Micro-payments for delivery checks, reputation APIs, and evidence validation",
    ],
  },
];

export function CircleArcSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="relative overflow-hidden py-28"
      style={{ background: "linear-gradient(180deg, #060816 0%, #07101d 52%, #060816 100%)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-3xl"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#34d399]/20 bg-[#34d399]/10 px-3 py-1.5 text-xs uppercase tracking-widest text-[#34d399]">
            <Layers3 className="size-3.5" />
            Built for Arc + USDC commerce
          </span>
          <h2
            className="mb-5 text-4xl text-white md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for the Stablecoin
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#60a5fa]">
              Commerce Stack.
            </em>
          </h2>
          <p className="text-lg leading-relaxed text-[#8892a4]">
            Juvra treats Arc escrow, USDC settlement, and agentic coordination as
            one commerce layer: AI structures the work and reviews evidence,
            while humans confirm every onchain settlement action.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stackCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111827]/70 p-5"
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${card.accent}12 0%, transparent 70%)` }}
              />
              <div className="relative">
                <div
                  className="mb-5 flex size-11 items-center justify-center rounded-xl border"
                  style={{
                    background: `${card.accent}15`,
                    borderColor: `${card.accent}30`,
                    color: card.accent,
                  }}
                >
                  <card.icon className="size-5" />
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <span
                    className="w-fit rounded-full border px-2 py-1 text-[0.65rem] uppercase tracking-widest"
                    style={{
                      background: `${card.accent}10`,
                      borderColor: `${card.accent}30`,
                      color: card.accent,
                    }}
                  >
                    {card.status}
                  </span>
                </div>
                <ul className="space-y-2 text-sm leading-6 text-[#8892a4]">
                  {card.points.map((point) => (
                    <li className="flex gap-2" key={point}>
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full"
                        style={{ background: card.accent }}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
