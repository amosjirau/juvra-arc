"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      className="relative py-36 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #0a0514 40%, #060816 100%)",
      }}
    >
      {/* Large glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-[#FF7A18]/6 rounded-full blur-[120px]" />
        <div className="absolute w-[500px] h-[300px] bg-[#B46CFF]/5 rounded-full blur-[100px] translate-y-8" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,122,24,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,24,1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A18]/10 border border-[#FF7A18]/20 text-[#FF7A18] text-xs uppercase tracking-widest mb-10">
            <Shield size={11} />
            Start with Juvra
          </div>

          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-7xl text-white leading-[1.0] tracking-tight mb-8"
          >
            Stop trusting
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A18] via-[#FFB347] to-[#FF7A18]">
              strangers.
            </em>
            <br />
            Start using Juvra.
          </h2>

          <p className="text-[#8892a4] text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            The settlement layer where funds are locked before work begins, milestones define progress, and payments release transparently. No trust required.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399]"
            >
              <div className="w-5 h-5 rounded-full bg-[#34d399]/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#34d399]" />
              </div>
              You&apos;re on the list. We&apos;ll be in touch soon.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 rounded-xl bg-[#111827] border border-white/10 text-white placeholder-[#8892a4] outline-none focus:border-[#FF7A18]/50 transition-colors duration-200 text-sm"
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#FF7A18] text-[#060816] hover:bg-[#FF9A4A] transition-all duration-300 shadow-[0_8px_32px_rgba(255,122,24,0.35)] hover:shadow-[0_8px_40px_rgba(255,122,24,0.5)] whitespace-nowrap text-sm"
              >
                Get Early Access
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 mb-12">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/8 hover:border-white/20 transition-all duration-300 text-sm"
            >
              Launch App
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-[#8892a4] text-xs">
            {["Powered by Arc Protocol", "Settled in USDC", "Non-custodial", "Open-source contracts"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#8892a4]" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
