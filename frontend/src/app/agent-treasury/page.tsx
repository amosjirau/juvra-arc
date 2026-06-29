"use client";

import { ArrowRightLeft } from "lucide-react";

import { AgentCctpPanel } from "@/components/agent/AgentCctpPanel";
import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";

export default function AgentTreasuryPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Agent treasury"
        eyebrowIcon={ArrowRightLeft}
        title="Cross-chain USDC with CCTP"
        description="The Juvra agent autonomously bridges USDC from Ethereum Sepolia into Arc using Circle CCTP — Arc as the settlement hub. The agent signs from its own wallet; escrow stays human-confirmed."
      />
      <div className="mt-10 max-w-3xl">
        <AgentCctpPanel />
      </div>
    </AppShell>
  );
}
