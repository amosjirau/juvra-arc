# Page override — Jobs marketplace (`/jobs`, `/jobs/[id]`)

Inherits MASTER. Premium Web3 work marketplace.

- **Data (preserve):** `useJobs()` → `getJobCount` + `getJob` over ids `1..count` (1-based), normalized via `normalizeJuvraJob`, descending by id. Client-side category filter + text search.
- **Cards:** category gradient banner (emerald/teal/sky/amber only), `StatusBadge`, escrow amount (`formatUsdc`), deadline, applicant address. Hover lift + spotlight.
- **NO fabricated data:** do not invent trust scores, milestone counts, or "verified payer" reputation. Show only real on-chain-derived signals (escrow funded = real, status = real, deadline = real). An honest "Escrow Verified" badge is fine because escrow funding is real.
- **States:** skeleton (loading), `EmptyState` (no jobs / no matches + CTA), `ErrorState` (read failure via `getEscrowReadErrorMessage`).
- **Detail page actions (preserve gating):** apply / select / submit / approve / cancel / dispute via `useEscrowWrite` with role + status guards. Per-action `TxStatus`. Consider a lifecycle stepper tied to the status enum.
- `MarketplaceFilter` primitive may wrap category + search + (future) status/budget filters.
