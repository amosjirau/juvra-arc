"use client";

import { motion, useInView } from "motion/react";
import { HelpCircle } from "lucide-react";
import { useRef } from "react";

const faqs = [
  {
    question: "What fees does Juvra charge?",
    answer:
      "Juvra is currently running on Arc Testnet while workflows are finalized. Production fees will be published before mainnet launch.",
  },
  {
    question: "How are disputes resolved?",
    answer:
      "The agent can summarize evidence and risks, but dispute decisions stay human-reviewed. Any onchain resolution requires an authorized wallet confirmation.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "Juvra supports EVM wallets through RainbowKit, including common browser and mobile wallet flows connected to Arc Testnet.",
  },
  {
    question: "What happens if work is abandoned?",
    answer:
      "Escrow remains in the contract until an authorized party uses the supported manual workflow, such as dispute escalation or admin resolution where available.",
  },
  {
    question: "Is Juvra live on mainnet?",
    answer:
      "No. Juvra is live on Arc Testnet while agentic escrow workflows are being finalized.",
  },
  {
    question: "Can the AI move funds automatically?",
    answer:
      "No. All fund movements require wallet confirmation. The Juvra Agent provides decision support only and cannot release, refund, sign, or resolve funds by itself.",
  },
];

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="faq"
      className="relative overflow-hidden py-28"
      style={{ background: "linear-gradient(180deg, #060816 0%, #070a14 50%, #060816 100%)" }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B46CFF]/20 bg-[#B46CFF]/10 px-3 py-1.5 text-xs uppercase tracking-widest text-[#B46CFF]">
            <HelpCircle className="size-3" />
            FAQ
          </span>
          <h2
            className="text-4xl text-white md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Clear answers before
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#B46CFF] to-[#60a5fa]">
              funds move.
            </em>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-2xl border border-white/8 bg-[#111827]/70 p-6"
            >
              <h3 className="mb-3 text-base font-semibold text-white">{item.question}</h3>
              <p className="text-sm leading-relaxed text-[#8892a4]">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
