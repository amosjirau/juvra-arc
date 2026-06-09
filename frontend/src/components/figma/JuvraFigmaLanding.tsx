"use client";

import { formatEther } from "viem";

import { AICopilotSection } from "@/components/figma/AICopilotSection";
import { ArcExplainerSection } from "@/components/figma/ArcExplainerSection";
import { CTASection } from "@/components/figma/CTASection";
import { DashboardSection } from "@/components/figma/DashboardSection";
import { FAQSection } from "@/components/figma/FAQSection";
import { Footer } from "@/components/figma/Footer";
import { HeroSection } from "@/components/figma/HeroSection";
import { HowItWorksSection } from "@/components/figma/HowItWorksSection";
import { InfrastructureSection } from "@/components/figma/InfrastructureSection";
import { OpportunitiesSection } from "@/components/figma/OpportunitiesSection";
import { UseCasesSection } from "@/components/figma/UseCasesSection";
import { WhyJuvraSection } from "@/components/figma/WhyJuvraSection";
import { useJobs } from "@/hooks/use-juvra-escrow";
import { DEMO_STATS } from "@/lib/landing-demo-data";

function shortMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function JuvraFigmaLanding() {
  const { jobs } = useJobs();
  const hasLiveJobs = jobs.length > 0;
  const escrowedVolume = hasLiveJobs
    ? jobs.reduce((total, job) => total + Number(formatEther(job.amount)), 0)
    : DEMO_STATS.escrowedVolume;
  const activeContracts = hasLiveJobs
    ? jobs.filter((job) => ![3, 5, 6].includes(job.status)).length
    : DEMO_STATS.activeContracts;
  const trustScore = hasLiveJobs
    ? Math.min(9.8, 8.6 + jobs.length * 0.08).toFixed(1)
    : DEMO_STATS.trustScore;

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
          stats={[
            { label: "Escrowed", value: shortMoney(escrowedVolume) },
            { label: "Active Contracts", value: activeContracts.toLocaleString() },
            { label: "Avg Trust Score", value: trustScore },
          ]}
        />
        <WhyJuvraSection />
        <OpportunitiesSection isDemo={!hasLiveJobs} jobs={jobs} />
        <HowItWorksSection />
        <ArcExplainerSection />
        <AICopilotSection isDemo={!hasLiveJobs} job={jobs[0]} />
        <InfrastructureSection />
        <DashboardSection isDemo={!hasLiveJobs} jobs={jobs} />
        <UseCasesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
