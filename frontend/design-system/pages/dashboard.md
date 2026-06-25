# Page override — Dashboard (`/dashboard`)

Inherits MASTER. Premium Web3 control center. All data is on-chain-derived per connected wallet.

- **Data (preserve):** `useJobCount` → batch `getJob` (ids 1..count) → `normalizeJuvraJob` (drop failed reads). Filters: `clientJobs` (wallet === client), `freelancerJobs` (wallet === freelancer ≠ zero), `completedJobs` (status 3), `disputedJobs` (status 4), `totalValue` (sum involved amounts). Reads gated `isEscrowConfigured && jobCount>0 && isConnected`.
- **Layout:** `WalletStatusCard` → `MetricCard` grid (jobs posted, assigned, completed, disputed, total value) → Tabs (Client / Freelancer / Disputes) of `JobCard`s.
- **MetricCard:** `countTo` for integer counts, `value` for `formatUsdc` strings. Tones: emerald/sky/amber/teal. Scroll-reveal entrance. Trend/delta only if backed by real series (no fabricated trends).
- **States:** disconnected → connect panel; loading → `MetricCardSkeleton` + `JobCardSkeleton`; empty per tab → `EmptyState`; read error → `ErrorState`.
- Consider a manual refresh control (currently requires reload).
