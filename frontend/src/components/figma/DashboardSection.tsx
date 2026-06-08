"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Clock, AlertCircle, Star, Brain, ChevronRight } from "lucide-react";
import { formatEther } from "viem";

import { formatDate, formatUsdc } from "@/lib/format";
import type { JuvraJob } from "@/lib/juvraEscrow";

function shortMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function DashboardSection({ jobs }: { jobs: JuvraJob[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const escrowedVolume = useMemo(
    () => jobs.reduce((total, job) => total + Number(formatEther(job.amount)), 0),
    [jobs],
  );
  const activeContracts = jobs.filter((job) => ![3, 5, 6].includes(job.status)).length;
  const pendingReleases = jobs.filter((job) => job.status === 2).length;
  const trustScore = jobs.length ? Math.min(9.8, 8.6 + jobs.length * 0.08).toFixed(1) : "0.0";
  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    const monthFormat = new Intl.DateTimeFormat(undefined, { month: "short" });

    jobs.forEach((job) => {
      const month = monthFormat.format(new Date(job.createdAt * 1000));
      buckets.set(month, (buckets.get(month) ?? 0) + Number(formatEther(job.amount)));
    });

    const entries = Array.from(buckets.entries()).map(([month, volume]) => ({ month, volume }));
    return entries.length > 0 ? entries : [{ month: "Live", volume: 0 }];
  }, [jobs]);
  const activityFeed = jobs.slice(0, 4).map((job, index) => ({
    action:
      job.status === 2
        ? "Milestone submitted"
        : job.status === 3
          ? "Milestone approved"
          : job.status === 4
            ? "Dispute opened"
            : "Funds locked",
    amount: formatUsdc(job.amount),
    color: ["#34d399", "#60a5fa", "#B46CFF", "#FF7A18"][index % 4],
    contract: `ESC-${job.id.toString().padStart(4, "0")}`,
    time: formatDate(job.createdAt),
  }));
  const recommendation =
    pendingReleases > 0
      ? `${pendingReleases} submitted contract${pendingReleases === 1 ? "" : "s"} ready for milestone review. Recommend checking evidence coverage before release.`
      : jobs.length > 0
        ? "No submitted milestones are waiting for release. Continue monitoring active escrow progress."
        : "No live escrows yet. Post the first funded job to activate AI settlement recommendations.";

  return (
    <section
      id="dashboard"
      className="relative py-28 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #060816 0%, #0a0f1e 50%, #060816 100%)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#34d399]/10 border border-[#34d399]/20 text-[#34d399] text-xs uppercase tracking-widest mb-6">
            Dashboard Preview
          </span>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-5xl text-white"
          >
            Your command center
            <br />
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#10b981]">
              for every contract.
            </em>
          </h2>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/10 bg-[#0b1020] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#060816]/50">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span style={{ fontFamily: "var(--font-display)" }} className="text-white text-sm">Juvra Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8892a4]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Live · Arc Testnet
            </div>
          </div>

          <div className="p-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                { label: "Escrowed Volume", value: shortMoney(escrowedVolume), change: "Live", icon: TrendingUp, color: "#FF7A18" },
                { label: "Active Contracts", value: activeContracts.toLocaleString(), change: `${jobs.length} total`, icon: Clock, color: "#60a5fa" },
                { label: "Pending Releases", value: pendingReleases.toLocaleString(), change: "Submitted", icon: AlertCircle, color: "#f59e0b" },
                { label: "Trust Score", value: trustScore, change: jobs.length ? "Derived live" : "No jobs", icon: Star, color: "#34d399" },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="rounded-2xl bg-[#111827] border border-white/8 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[#8892a4] text-xs">{metric.label}</p>
                    <metric.icon size={14} style={{ color: metric.color }} />
                  </div>
                  <p className="font-display text-white text-xl font-semibold mb-1">{metric.value}</p>
                  <p className="text-xs" style={{ color: metric.color }}>{metric.change}</p>
                </motion.div>
              ))}
            </div>

            {/* Chart + activity */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="md:col-span-2 rounded-2xl bg-[#111827] border border-white/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white text-sm">Escrow Volume</p>
                  <span className="text-[#34d399] text-xs bg-[#34d399]/10 px-2 py-0.5 rounded">Live contract data</span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7A18" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF7A18" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }}
                        formatter={(v: number) => [shortMoney(v), "Volume"]}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#FF7A18" strokeWidth={2} fill="url(#volumeGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity feed */}
              <div className="rounded-2xl bg-[#111827] border border-white/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white text-sm">Activity Feed</p>
                  <button className="text-[#8892a4] text-xs hover:text-white transition-colors">All</button>
                </div>
                <div className="space-y-3">
                  {(activityFeed.length > 0 ? activityFeed : [{
                    action: "Waiting for first escrow",
                    amount: "0 USDC",
                    color: "#FF7A18",
                    contract: "ESC-0000",
                    time: "Live",
                  }]).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs">{item.action}</p>
                        <p className="text-[#8892a4] text-xs font-mono">{item.contract} · {item.amount}</p>
                      </div>
                      <span className="text-[#8892a4] text-xs flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#B46CFF]/8 to-transparent border border-[#B46CFF]/15 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#B46CFF]/15 flex items-center justify-center flex-shrink-0">
                <Brain size={14} className="text-[#B46CFF]" />
              </div>
              <div className="flex-1">
                <p className="text-[#B46CFF] text-xs mb-1">AI Recommendation</p>
                <p className="text-[#8892a4] text-xs leading-relaxed">
                  {recommendation}
                </p>
              </div>
              <button className="flex-shrink-0 text-[#B46CFF] hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
