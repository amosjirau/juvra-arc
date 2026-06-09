import type { Metadata } from "next";

import { InfoPage } from "@/components/marketing/InfoPage";

export const metadata: Metadata = {
  title: "Privacy | Juvra",
  description: "Juvra privacy overview.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy overview."
      description="This placeholder summarizes Juvra's intended privacy posture for the testnet product. A full production policy should be reviewed before mainnet launch."
      sections={[
        {
          title: "Wallet data",
          body: "Juvra reads connected wallet addresses and public onchain escrow state needed to display jobs, dashboards, and agent workspaces.",
        },
        {
          title: "Local agent results",
          body: "Some agent outputs and evidence notes may be stored locally in the browser for the current testnet experience. Do not store secrets in evidence fields.",
        },
        {
          title: "Future updates",
          body: "Before production launch, this page should be replaced with a complete privacy policy covering analytics, persistence, retention, and user rights.",
        },
      ]}
    />
  );
}
