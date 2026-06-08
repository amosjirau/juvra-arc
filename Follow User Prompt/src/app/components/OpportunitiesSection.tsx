import { useState, useRef } from "react";
import { motion, useInView, animate, useMotionValue } from "motion/react";
import { Lock, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const opportunities = [
  {
    title: "Full-Stack Web3 Dashboard",
    category: "Engineering",
    amount: "$12,500",
    milestones: 4,
    deadline: "June 28",
    trustScore: 9.4,
    clientRep: "Verified Elite",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    rotation: -2,
    accent: "#FF7A18",
  },
  {
    title: "Brand Identity System",
    category: "Design",
    amount: "$6,800",
    milestones: 3,
    deadline: "July 4",
    trustScore: 8.9,
    clientRep: "Verified",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    rotation: 1.5,
    accent: "#B46CFF",
  },
  {
    title: "Smart Contract Audit",
    category: "Security",
    amount: "$9,200",
    milestones: 2,
    deadline: "June 22",
    trustScore: 9.7,
    clientRep: "Verified Elite",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&auto=format",
    rotation: -1,
    accent: "#34d399",
  },
  {
    title: "Product Strategy & Roadmap",
    category: "Strategy",
    amount: "$4,500",
    milestones: 5,
    deadline: "July 12",
    trustScore: 8.6,
    clientRep: "Verified",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop&auto=format",
    rotation: 2,
    accent: "#60a5fa",
  },
  {
    title: "AI Integration & API Design",
    category: "Engineering",
    amount: "$15,000",
    milestones: 6,
    deadline: "August 1",
    trustScore: 9.1,
    clientRep: "Verified Elite",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop&auto=format",
    rotation: -1.5,
    accent: "#f59e0b",
  },
];

function OpportunityCard({ opp, index, activeIndex }: { opp: typeof opportunities[0]; index: number; activeIndex: number }) {
  const isActive = index === activeIndex;
  const offset = index - activeIndex;

  return (
    <motion.div
      animate={{
        x: offset * 280,
        rotate: isActive ? 0 : opp.rotation,
        scale: isActive ? 1 : 0.9,
        opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15,
        zIndex: 10 - Math.abs(offset),
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-72 cursor-pointer"
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111827]"
        style={{ boxShadow: isActive ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${opp.accent}30` : "0 8px 24px rgba(0,0,0,0.3)" }}
      >
        {/* Image */}
        <div className="h-44 relative overflow-hidden bg-[#1a2235]">
          <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-1 rounded-lg text-xs font-mono uppercase tracking-wider"
              style={{ background: `${opp.accent}20`, color: opp.accent, border: `1px solid ${opp.accent}30` }}
            >
              {opp.category}
            </span>
          </div>
          {/* Verified badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-xs">Escrow Verified</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white text-sm mb-3 leading-snug">{opp.title}</h3>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[#8892a4] text-xs">Escrow</p>
              <p style={{ color: opp.accent }} className="font-mono text-sm">{opp.amount}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[#8892a4] text-xs">Milestones</p>
              <p className="text-white font-mono text-sm">{opp.milestones}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8892a4]">
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span>{opp.deadline}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400" />
              <span className="text-white">{opp.trustScore}</span>
              <span>· {opp.clientRep}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <Lock size={10} className="text-[#B46CFF]" />
            <span className="text-[#8892a4] text-xs">Funds locked on Arc Protocol</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function OpportunitiesSection() {
  const [activeIndex, setActiveIndex] = useState(2);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="jobs"
      className="relative py-28 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(180,108,255,0.06) 0%, transparent 70%), linear-gradient(180deg, #060816 0%, #0b1020 50%, #060816 100%)",
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B46CFF]/10 border border-[#B46CFF]/20 text-[#B46CFF] text-xs uppercase tracking-widest mb-6">
            <Lock size={11} />
            Escrow Opportunities
          </span>
          <h2
            style={{ fontFamily: "Instrument Serif, serif" }}
            className="text-4xl md:text-5xl text-white"
          >
            Trending on Juvra
          </h2>
          <p className="text-[#8892a4] mt-4 text-lg">Every opportunity is fully escrowed before you begin.</p>
        </motion.div>

        {/* Card carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-96 mb-8"
        >
          {opportunities.map((opp, i) => (
            <OpportunityCard key={i} opp={opp} index={i} activeIndex={activeIndex} />
          ))}
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#8892a4] hover:text-white hover:border-white/20 disabled:opacity-30 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {opportunities.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 h-2 bg-[#FF7A18]" : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveIndex(Math.min(opportunities.length - 1, activeIndex + 1))}
            disabled={activeIndex === opportunities.length - 1}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#8892a4] hover:text-white hover:border-white/20 disabled:opacity-30 transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="text-center mt-10">
          <a
            href="#jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#8892a4] hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-sm"
          >
            Browse All Opportunities
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
