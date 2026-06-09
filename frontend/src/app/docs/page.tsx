import type { Metadata } from "next";

import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Docs | Juvra",
  description: "Juvra documentation overview.",
};

export default function DocsPage() {
  return (
    <InfoPage
      eyebrow="Docs"
      title="How Juvra escrow works."
      description="This documentation overview explains the current testnet workflow for clients, freelancers, and administrators."
      sections={[
        {
          title: "1. Post and fund a job",
          body: "Clients create jobs with scope, category, deadline, and escrow amount. Funding requires an explicit wallet transaction.",
        },
        {
          title: "2. Deliver and review work",
          body: "Freelancers submit delivery references and evidence. Clients can review submissions, and the agent can provide advisory analysis.",
        },
        {
          title: "3. Confirm settlement manually",
          body: "Approvals, disputes, refunds, and resolutions are never automated by AI. Every supported escrow write requires an authorized user click and wallet confirmation.",
        },
      ]}
    />
  );
}
