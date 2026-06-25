# Page override — Admin (`/admin`)

Inherits MASTER. Secure arbitrator console. `/admin` is canonical; `/admin/disputes` is legacy.

- **Gating (preserve, security boundary):** `AdminGate` + `useAdminAccess` — `isAdmin = isSameAddress(wallet, arbitrator())` with `NEXT_PUBLIC_JUVRA_ADMIN_ADDRESS` fallback. Children **never** render for non-admins. Admin nav item only shown when `isAdmin`.
- **Data (preserve):** lists `status === 4` (Disputed) jobs; resolves via `resolveDispute(jobId, winnerIsClient: boolean)` — **`true` = client refund, `false` = freelancer release** (do not invert). Tx tracked with `useWaitForTransactionReceipt` → `TxStatus`.
- **Restricted screen:** animated `AdminGate` (radar-sweep) for checking / non-admin / disconnected.
- **Layout:** warning banner (funds move, irreversible) → `MetricCard` (open disputes, disputed value, admin wallet) → per-dispute cards with client/freelancer/amount/submission + `AdminAgentSummary`.
- **Destructive actions:** consider a two-step confirm before `resolveDispute` (moves escrowed USDC, cannot be undone), with a winner recap (refund vs release).
- Surface evidence (descriptionURI / submissionURI) as resolvable links, not raw strings.
