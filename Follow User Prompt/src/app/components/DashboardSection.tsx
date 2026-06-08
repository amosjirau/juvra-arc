import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Clock, AlertCircle, Star, Brain, ChevronRight } from "lucide-react";

const chartData = [
  { month: "Jan", volume: 120000 },
  { month: "Feb", volume: 180000 },
  { month: "Mar", volume: 240000 },
  { month: "Apr", volume: 310000 },
  { month: "May", volume: 420000 },
  { month: "Jun", volume: 580000 },
];

const activityFeed = [
  { action: "Milestone approved", contract: "ESC-0491", amount: "$5,000", time: "2m ago", color: "#34d399" },
  { action: "Funds locked", contract: "ESC-0492", amount: "$12,500", time: "8m ago", color: "#60a5fa" },
  { action: "Dispute resolved", contract: "ESC-0488", amount: "$3,200", time: "22m ago", color: "#B46CFF" },
  { action: "Contract created", contract: "ESC-0493", amount: "$8,000", time: "1h ago", color: "#FF7A18" },
];

export function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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
            style={{ fontFamily: "Instrument Serif, serif" }}
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
              <span style={{ fontFamily: "Instrument Serif, serif" }} className="text-white text-sm">Juvra Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8892a4]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              Live · Arc Mainnet
            </div>
          </div>

          <div className="p-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Escrowed Volume", value: "$2.4M", change: "+18%", icon: TrendingUp, color: "#FF7A18" },
                { label: "Active Contracts", value: "47", change: "+6", icon: Clock, color: "#60a5fa" },
                { label: "Pending Releases", value: "12", change: "3 today", icon: AlertCircle, color: "#f59e0b" },
                { label: "Trust Score", value: "9.2", change: "Top 3%", icon: Star, color: "#34d399" },
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
                  <p className="text-white text-xl font-semibold font-mono mb-1">{metric.value}</p>
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
                  <span className="text-[#34d399] text-xs bg-[#34d399]/10 px-2 py-0.5 rounded">+84% YTD</span>
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
                        formatter={(v: number) => [`$${(v / 1000).toFixed(0)}k`, "Volume"]}
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
                  {activityFeed.map((item, i) => (
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
                  3 contracts are past-due for milestone review. Recommend initiating client reminder for ESC-0487, ESC-0483, ESC-0479. Evidence coverage is sufficient for release.
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
