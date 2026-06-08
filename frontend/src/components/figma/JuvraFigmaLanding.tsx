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

function shortMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function JuvraFigmaLanding() {
  const { jobs, isLoading } = useJobs();
  const escrowedVolume = jobs.reduce((total, job) => total + Number(formatEther(job.amount)), 0);
  const activeContracts = jobs.filter((job) => ![3, 5, 6].includes(job.status)).length;
  const trustScore = jobs.length ? Math.min(9.8, 8.6 + jobs.length * 0.08).toFixed(1) : "0.0";

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
            { label: "Escrowed Volume", value: shortMoney(escrowedVolume) },
            { label: "Active Contracts", value: activeContracts.toLocaleString() },
            { label: "Avg Trust Score", value: trustScore },
          ]}
        />
        <WhyJuvraSection />
        <OpportunitiesSection isLoading={isLoading} jobs={jobs} />
        <HowItWorksSection />
        <AICopilotSection job={jobs[0]} />
        <InfrastructureSection />
        <DashboardSection jobs={jobs} />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
