# Page override — How It Works (`/how-it-works`)

Inherits MASTER. Standalone education page (new route; was only a landing anchor).

- **Goal:** beginner-friendly, non-technical explanation of the escrow lifecycle. Deep-linkable.
- **Sections:** PageHeader → client journey → freelancer journey → `HowItWorksTimeline` (Connect → Post → Fund escrow → Accept → Deliver → Release / Resolve) → trust & safety → FAQ → CTA (Explore Jobs + Post a Job).
- **Timeline:** `HowItWorksTimeline` component, vertical rail tied to the 7-state job enum (Open→Assigned→Submitted→Approved, with Disputed/Refunded/Cancelled branches). Emerald rail, amber for pending, rose for dispute.
- Copy register: plain language, no raw blockchain jargon. Explain "escrow", "wallet-confirmed", "on-chain" in one line each.
- Keep the landing `#how-it-works` section too; navbar points here.
