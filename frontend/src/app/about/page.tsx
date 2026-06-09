import type { Metadata } from "next";

import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "About | Juvra",
  description: "About Juvra and its agent-assisted escrow workflow.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Juvra"
      title="Agent-assisted escrow for freelance work."
      description="Juvra is building a non-custodial marketplace where clients and freelancers can fund work, track milestones, review evidence, and resolve disputes with clearer onchain settlement records."
      sections={[
        {
          title: "Current stage",
          body: "Juvra is currently operating on Arc Testnet while escrow, evidence, and agentic review workflows are refined.",
        },
        {
          title: "Agent role",
          body: "The Juvra Agent provides decision support only. It can summarize risks and evidence, but it cannot move funds, sign transactions, select freelancers, or resolve disputes automatically.",
        },
        {
          title: "Product focus",
          body: "The platform focuses on funded jobs, milestone accountability, transparent delivery review, and human-confirmed settlement actions.",
        },
      ]}
    />
  );
}
