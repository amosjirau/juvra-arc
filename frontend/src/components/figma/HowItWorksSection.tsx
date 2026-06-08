"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Briefcase, Lock, CheckCircle, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Briefcase,
    title: "Create Job",
    description: "Post your project with clear milestones, deliverables, and escrow amount. Define exactly what success looks like.",
    detail: "Set milestones, timeline, deliverables, and the total escrow amount. Smart contracts are deployed automatically.",
    accent: "#60a5fa",
  },
  {
    number: "02",
    icon: Lock,
    title: "Lock USDC",
    description: "Client locks the full project amount in an Arc smart contract escrow vault. Funds are secured before work begins.",
    detail: "Funds are held in a non-custodial vault on Arc Protocol. Neither party can access them without milestone approval.",
    accent: "#B46CFF",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Work Delivered",
    description: "Freelancer completes milestones and submits evidence. AI copilot reviews deliverables against requirements.",
    detail: "The AI Copilot analyzes evidence, checks completion, flags risks, and prepares a summary for client review.",
    accent: "#FF7A18",
  },
  {
    number: "04",
    icon: Send,
    title: "Release Funds",
    description: "Client approves milestone. Funds release instantly to freelancer's wallet. Transparent, immutable record created.",
    detail: "Approval triggers automatic USDC release. The entire transaction history is permanently on-chain.",
    accent: "#34d399",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative py-28 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #080d1a 50%, #060816 100%)",
      }}
    >
      {/* Left ambient */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7A18]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A18]/10 border border-[#FF7A18]/20 text-[#FF7A18] text-xs uppercase tracking-widest mb-6">
            How It Works
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl text-white"
          >
            Four steps to{" "}
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] to-[#FFB347]">
              trustless settlement.
            </em>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: step list */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveStep(i)}
                className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-400 ${
                  activeStep === i
                    ? "bg-[#111827] border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/2"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300"
                    style={{
                      background: activeStep === i ? `${step.accent}20` : "transparent",
                      borderColor: activeStep === i ? `${step.accent}40` : "rgba(255,255,255,0.08)",
                      boxShadow: activeStep === i ? `0 0 20px ${step.accent}25` : "none",
                    }}
                  >
                    <step.icon size={20} style={{ color: activeStep === i ? step.accent : "#8892a4" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-[#8892a4]">{step.number}</span>
                      <h3
                        className="transition-colors duration-300"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: activeStep === i ? "white" : "#8892a4",
                          fontSize: "1.125rem",
                        }}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[#8892a4] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: active step detail */}
          <div className="sticky top-28">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: activeStep === i ? 1 : 0,
                  y: activeStep === i ? 0 : 20,
                  pointerEvents: activeStep === i ? "auto" : "none",
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute inset-0 ${activeStep === i ? "" : "pointer-events-none"}`}
                style={{ position: i === 0 ? "relative" : "absolute" }}
              >
                <div
                  className="rounded-3xl border p-8 h-full min-h-64 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${step.accent}08 0%, #111827 100%)`,
                    borderColor: `${step.accent}25`,
                    boxShadow: `0 0 48px ${step.accent}10`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.accent}50, transparent)` }}
                  />
                  <div className="absolute top-6 right-6 opacity-10">
                    <step.icon size={64} style={{ color: step.accent }} />
                  </div>
                  <div className="relative">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono mb-6"
                      style={{ background: `${step.accent}15`, color: step.accent, border: `1px solid ${step.accent}25` }}
                    >
                      Step {step.number}
                    </div>
                    <h3
                      style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}
                      className="text-white mb-4"
                    >
                      {step.title}
                    </h3>
                    <p className="text-[#8892a4] text-base leading-relaxed">{step.detail}</p>

                    {/* Progress dots */}
                    <div className="mt-8 flex gap-2">
                      {steps.map((_, j) => (
                        <button
                          key={j}
                          onClick={() => setActiveStep(j)}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: j === i ? "24px" : "8px",
                            height: "8px",
                            background: j === i ? step.accent : "rgba(255,255,255,0.2)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
