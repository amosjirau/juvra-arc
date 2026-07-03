"use client";

import { Bot, FileCheck2, Gavel, History, Network, Zap } from "lucide-react";
import type { Address } from "viem";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EvidenceItem } from "@/lib/agent/evidence";
import type { JuvraJob } from "@/lib/juvraEscrow";

import { AgentAutonomyPanel } from "./AgentAutonomyPanel";
import { AgentGuidedActions } from "./AgentGuidedActions";
import AgentPanel from "./AgentPanel";
import { AgentScopeBuilder } from "./AgentScopeBuilder";
import { AgentTimeline } from "./AgentTimeline";
import { AgentVerificationPanel } from "./AgentVerificationPanel";
import { EvidencePanel } from "./EvidencePanel";

type AgentJob = {
  id?: string;
  title?: string;
  description?: string;
  descriptionURI?: string;
  category?: string;
  budget?: string;
  deadline?: string;
  status?: number;
  submissionURI?: string;
};

/**
 * Consolidates every agent surface for a job into one segmented console so the
 * workspace reads as a single focused tool instead of an endless panel stack.
 */
export function AgentConsole({
  agentJob,
  job,
  evidence,
  address,
  arbitrator,
  onSettled,
  onEvidenceChange,
}: {
  agentJob: AgentJob;
  job: JuvraJob;
  evidence: EvidenceItem[];
  address?: Address;
  arbitrator?: Address;
  onSettled?: () => void;
  onEvidenceChange: (items: EvidenceItem[]) => void;
}) {
  return (
    <Tabs defaultValue="analyze">
      <TabsList
        className="w-full flex-wrap gap-1 rounded-2xl bg-paper-raised p-1.5 backdrop-blur-xl sm:h-11"
        variant="default"
      >
        <TabsTrigger value="analyze">
          <Bot />
          Analyze
        </TabsTrigger>
        <TabsTrigger value="evidence">
          <FileCheck2 />
          Evidence
        </TabsTrigger>
        <TabsTrigger value="autonomy">
          <Zap />
          Autonomy
        </TabsTrigger>
        <TabsTrigger value="scope">
          <Network />
          Scope
        </TabsTrigger>
        <TabsTrigger value="settle">
          <Gavel />
          Settle
        </TabsTrigger>
        <TabsTrigger value="timeline">
          <History />
          Timeline
        </TabsTrigger>
      </TabsList>

      <TabsContent className="mt-4" value="analyze">
        <AgentPanel evidence={evidence} job={agentJob} />
      </TabsContent>

      <TabsContent className="mt-4 space-y-5" value="evidence">
        <EvidencePanel
          jobId={job.id.toString()}
          onEvidenceChange={onEvidenceChange}
          submittedBy={address}
        />
        <AgentVerificationPanel evidence={evidence} job={agentJob} />
      </TabsContent>

      <TabsContent className="mt-4" value="autonomy">
        <AgentAutonomyPanel evidence={evidence} job={agentJob} />
      </TabsContent>

      <TabsContent className="mt-4" value="scope">
        <AgentScopeBuilder evidence={evidence} job={agentJob} />
      </TabsContent>

      <TabsContent className="mt-4" value="settle">
        <AgentGuidedActions
          arbitrator={arbitrator}
          job={job}
          onSettled={onSettled}
          walletAddress={address}
        />
      </TabsContent>

      <TabsContent className="mt-4" value="timeline">
        <AgentTimeline evidence={evidence} job={job} />
      </TabsContent>
    </Tabs>
  );
}
