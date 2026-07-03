"use client";

import { AgentCctpPanel } from "@/components/agent/AgentCctpPanel";
import { AgentGatewayPanel } from "@/components/agent/AgentGatewayPanel";
import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";

export default function AgentTreasuryPage() {
  return (
    <EditorialShell>
      <EditorialHeader
        description="The Juvra agent autonomously moves USDC across chains — Circle CCTP for point-to-point bridging and Gateway for an instant unified balance. It signs from its own wallet; escrow stays human-confirmed."
        eyebrow="Agent treasury"
        title="Cross-chain USDC"
      />
      <div className="mt-12 grid max-w-3xl gap-6">
        <AgentCctpPanel />
        <AgentGatewayPanel />
      </div>
    </EditorialShell>
  );
}
