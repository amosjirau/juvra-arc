"use client";

import { formatEther } from "viem";

import { AICopilotSection } from "@/components/figma/AICopilotSection";
import { CTASection } from "@/components/figma/CTASection";
import { DashboardSection } from "@/components/figma/DashboardSection";
import { Footer } from "@/components/figma/Footer";
import { HeroSection } from "@/components/figma/HeroSection";
import { HowItWorksSection } from "@/components/figma/HowItWorksSection";
import { InfrastructureSection } from "@/components/figma/InfrastructureSection";
import { OpportunitiesSection } from "@/components/figma/OpportunitiesSection";
import { UseCasesSection } from "@/components/figma/UseCasesSection";
import { WhyJuvraSection } from "@/components/figma/WhyJuvraSection";
import { useJobs } from "@/hooks/use-juvra-escrow";
import { DEMO_LANDING_JOBS, DEMO_LANDING_STATS } from "@/lib/landing-demo-data";

function shortMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function wholeMoney(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function JuvraFigmaLanding() {
  const { jobs } = useJobs();
  const hasLiveJobs = jobs.length > 0;
  const demoJob = DEMO_LANDING_JOBS[0];
  const escrowedVolume = hasLiveJobs
    ? jobs.reduce((total, job) => total + Number(formatEther(job.amount)), 0)
    : DEMO_LANDING_STATS.escrowedVolume;
  const activeContracts = hasLiveJobs
    ? jobs.filter((job) => ![3, 5, 6].includes(job.status)).length
    : DEMO_LANDING_STATS.activeContracts;
  const trustScore = hasLiveJobs
    ? Math.min(9.8, 8.6 + jobs.length * 0.08).toFixed(1)
    : DEMO_LANDING_STATS.trustScore;

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        background: "#060816",
        color: "#eef2ff",
        fontFamily: "var(--font-ui)",
        scrollBehavior: "smooth",
      }}
    >
      <main>
        <HeroSection
          job={jobs[0]}
          demoJob={!hasLiveJobs ? demoJob : undefined}
          stats={[
            { label: "Escrowed Volume", value: hasLiveJobs ? shortMoney(escrowedVolume) : wholeMoney(escrowedVolume) },
            { label: "Active Contracts", value: activeContracts.toLocaleString() },
            { label: "Avg Trust Score", value: trustScore },
          ]}
        />
        <WhyJuvraSection />
        <OpportunitiesSection isDemo={!hasLiveJobs} jobs={jobs} />
        <HowItWorksSection />
        <AICopilotSection demoJob={!hasLiveJobs ? demoJob : undefined} job={jobs[0]} />
        <InfrastructureSection />
        <DashboardSection isDemo={!hasLiveJobs} jobs={jobs} />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
