"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Lock, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { formatDate, formatUsdc } from "@/lib/format";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { DEMO_JOBS, type DemoJob } from "@/lib/landing-demo-data";

type Opportunity = {
  accent: string;
  amount: string;
  category: string;
  clientRep: string;
  deadline: string;
  href: string;
  image: string;
  isDemo?: boolean;
  milestoneLabel?: string;
  milestones: number;
  rotation: number;
  status?: string;
  title: string;
  trustScore: number;
};

const cardVisuals = [
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    rotation: -2,
    accent: "#10b981",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    rotation: 1.5,
    accent: "#38bdf8",
  },
  {
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&auto=format",
    rotation: -1,
    accent: "#34d399",
  },
  {
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop&auto=format",
    rotation: 2,
    accent: "#60a5fa",
  },
  {
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop&auto=format",
    rotation: -1.5,
    accent: "#f59e0b",
  },
];

function toOpportunity(job: JuvraJob, index: number): Opportunity {
  const visual = cardVisuals[index % cardVisuals.length];
  const milestones = 2 + Number(job.id % 4n);
  const trustScore = Number((8.6 + Number(job.id % 12n) / 10).toFixed(1));

  return {
    accent: visual.accent,
    amount: formatUsdc(job.amount),
    category: job.category || "Freelance",
    clientRep: trustScore >= 9.2 ? "Verified Elite" : "Verified",
    deadline: formatDate(job.deadline),
    href: `/jobs/${job.id.toString()}`,
    image: visual.image,
    milestones,
    rotation: visual.rotation,
    title: job.title,
    trustScore,
  };
}

function toDemoOpportunity(job: DemoJob, index: number): Opportunity {
  const visual = cardVisuals[index % cardVisuals.length];

  return {
    accent: visual.accent,
    amount: job.amount,
    category: job.category,
    clientRep: job.clientRep,
    deadline: job.deadline,
    href: job.href,
    image: job.image,
    isDemo: true,
    milestoneLabel: job.milestone,
    milestones: 3,
    rotation: visual.rotation,
    status: job.status,
    title: job.title,
    trustScore: job.trustScore,
  };
}

function OpportunityCard({ opp, index, activeIndex }: { opp: Opportunity; index: number; activeIndex: number }) {
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
      <Link className="block" href={opp.href}>
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111827]"
        style={{ boxShadow: isActive ? `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${opp.accent}30` : "0 8px 24px rgba(0,0,0,0.3)" }}
      >
        {/* Image */}
        <div className="h-44 relative overflow-hidden bg-[#1a2235]">
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic remote listing image; next/image remotePatterns not configured */}
          <img src={opp.image} alt={opp.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
            <span className="text-emerald-400 text-xs">{opp.isDemo ? "Preview Data" : "Escrow Verified"}</span>
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
              <p className="text-[#8892a4] text-xs">{opp.isDemo ? "Milestone" : "Milestones"}</p>
              <p className="text-white font-mono text-sm truncate" title={opp.milestoneLabel}>
                {opp.isDemo && opp.milestoneLabel ? opp.milestoneLabel : opp.milestones}
              </p>
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
            <Lock size={10} className="text-[#38bdf8]" />
            <span className="text-[#8892a4] text-xs">
              {opp.isDemo ? `${opp.status} preview on Arc Protocol` : "Funds locked on Arc Protocol"}
            </span>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}

export function OpportunitiesSection({
  isDemo,
  jobs,
}: {
  isDemo?: boolean;
  jobs: JuvraJob[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const opportunities = useMemo(() => {
    if (!isDemo && jobs.length > 0) {
      return jobs.slice(0, 5).map(toOpportunity);
    }

    return DEMO_JOBS.map(toDemoOpportunity);
  }, [isDemo, jobs]);
  const currentIndex = Math.min(activeIndex, opportunities.length - 1);

  return (
    <section
      id="jobs"
      className="relative py-28 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 70%), linear-gradient(180deg, #060816 0%, #0b1020 50%, #060816 100%)",
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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-xs uppercase tracking-widest mb-6">
            <Lock size={11} />
            {isDemo ? "Demo escrow opportunities" : "Escrow Opportunities"}
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
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
            <OpportunityCard key={`${opp.title}-${i}`} opp={opp} index={i} activeIndex={currentIndex} />
          ))}
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            disabled={currentIndex === 0}
            aria-label="Previous opportunity"
            className="w-10 h-10 cursor-pointer rounded-xl border border-white/10 flex items-center justify-center text-[#8892a4] hover:text-white hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/50"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {opportunities.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to opportunity ${i + 1}`}
                aria-current={i === currentIndex ? "true" : undefined}
                className={`cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/50 ${
                  i === currentIndex ? "w-6 h-2 bg-[#10b981]" : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveIndex(Math.min(opportunities.length - 1, activeIndex + 1))}
            disabled={currentIndex === opportunities.length - 1}
            aria-label="Next opportunity"
            className="w-10 h-10 cursor-pointer rounded-xl border border-white/10 flex items-center justify-center text-[#8892a4] hover:text-white hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/50"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#8892a4] hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060816]"
          >
            Browse All Opportunities
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
