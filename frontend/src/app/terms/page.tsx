import type { Metadata } from "next";

import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Terms | Juvra",
  description: "Juvra terms overview.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms overview."
      description="This placeholder outlines the current testnet usage posture. Production terms should be finalized with legal review before any mainnet launch."
      sections={[
        {
          title: "Testnet status",
          body: "Juvra is operating on Arc Testnet. Testnet activity is intended for product validation and should not be treated as production settlement.",
        },
        {
          title: "User confirmation",
          body: "Users remain responsible for reviewing wallet prompts before signing. Juvra's AI features cannot sign transactions or move escrowed funds automatically.",
        },
        {
          title: "Future policy",
          body: "A full terms of service document should define production responsibilities, supported jurisdictions, dispute processes, and platform fees.",
        },
      ]}
    />
  );
}
