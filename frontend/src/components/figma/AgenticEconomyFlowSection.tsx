"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  BadgeDollarSign,
  CheckCircle2,
  FileCheck2,
  Lock,
  WalletCards,
} from "lucide-react";

const flowSteps = [
  {
    number: "01",
    icon: Lock,
    title: "Client funds escrow in USDC on Arc",
    description:
      "The escrow contract holds funds while job state, applicants, submissions, and settlement actions remain onchain.",
    accent: "#60a5fa",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Freelancer submits delivery evidence",
    description:
      "Delivery notes, repo links, screenshots, dispute notes, and revision evidence are attached to the job workspace.",
    accent: "#B46CFF",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Juvra Agent evaluates risk and evidence",
    description:
      "Agent APIs review scope clarity, delivery fit, dispute context, and settlement recommendation inputs.",
    accent: "#FF7A18",
  },
  {
    number: "04",
    icon: BadgeDollarSign,
    title: "Agent triggers verification workflow / records economic action",
    description:
      "The verification agent prepares a USDC-denominated testnet/demo receipt and writes an agent economic action log.",
    accent: "#34d399",
  },
  {
    number: "05",
    icon: WalletCards,
    title: "Human confirms final settlement with wallet",
    description:
      "The client, freelancer, or admin chooses any escrow write action manually and confirms through their connected wallet.",
    accent: "#f472b6",
  },
];

export function AgenticEconomyFlowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      className="relative overflow-hidden py-28"
      id="agentic-economy-flow"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #08101d 100%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          ref={ref}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs uppercase tracking-widest text-emerald-200">
            Agentic Economy Flow
          </span>
          <h2
            className="text-4xl text-white md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Agents prepare commerce actions. Humans settle escrow.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#8892a4]">
            Juvra makes agentic spending explicit and bounded: agents can
            evaluate signals and record a USDC-denominated verification action,
            but the escrow contract only changes after a wallet-confirmed human
            decision.
          </p>
        </motion.div>

        <div className="grid gap-3 lg:grid-cols-5">
          {flowSteps.map((step, index) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
              initial={{ opacity: 0, y: 32 }}
              key={step.title}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{
                  background: `${step.accent}18`,
                  borderColor: `${step.accent}35`,
                  color: step.accent,
                }}
              >
                <step.icon size={20} />
              </div>
              <p className="font-mono text-xs text-[#8892a4]">{step.number}</p>
              <h3
                className="mt-2 text-lg leading-snug text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#8892a4]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
