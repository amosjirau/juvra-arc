"use client";

import { motion, AnimatePresence, useInView } from "motion/react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

        <div className="mx-auto max-w-3xl space-y-2">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="overflow-hidden rounded-2xl border border-white/8 bg-[#111827]/70"
                style={{
                  borderColor: isOpen ? "rgba(180,108,255,0.25)" : undefined,
                  boxShadow: isOpen ? "0 0 24px rgba(180,108,255,0.06)" : undefined,
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B46CFF]/40 focus-visible:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-base font-semibold text-white">{item.question}</h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      size={16}
                      className="transition-colors duration-300"
                      style={{ color: isOpen ? "#B46CFF" : "#8892a4" }}
                    />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      id={`faq-answer-${index}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#B46CFF]/10 px-6 pb-5 pt-4">
                        <p className="text-sm leading-relaxed text-[#8892a4]">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
