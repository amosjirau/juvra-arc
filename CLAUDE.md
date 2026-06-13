# CLAUDE.md

Guidance for AI assistants (Claude Code) working in this repository.

## Project Overview

**Juvra** is an agent-assisted USDC escrow platform for freelance work, built on **Arc**
(Circle's testnet, chain ID `5042002`, native currency labeled "USDC"). Clients post jobs
and lock funds in an on-chain escrow contract; freelancers apply and deliver work; an AI
agent provides advisory risk analysis, delivery review, dispute summaries, and
recommendations — but **all fund-moving actions require an explicit wallet-confirmed
transaction**. This started as a Circle/Arc hackathon submission (see
`frontend/CHALLENGE_SUBMISSION.md` and `frontend/AGENTIC_ESCROW_ROADMAP.md`).

## Repository Layout

This is a monorepo with two active projects plus one legacy bundle:

```
juvra-arc/
├── contracts/           # Foundry/Solidity escrow contract (JuvraEscrow)
├── frontend/             # Next.js 16 app — the actual product UI
└── Follow User Prompt/   # Legacy Figma-exported Vite bundle — NOT built/deployed
```

### "Follow User Prompt/"

This is a standalone Figma "Make" export (separate `package.json`, Vite, its own
`pnpm-workspace.yaml`). It is **not imported or built by `frontend/`**. The landing page
sections it originally contained were ported into `frontend/src/components/figma/` and
are wired into `frontend/src/app/page.tsx` via `JuvraFigmaLanding`. Don't edit this
directory unless the user is specifically asking about the original Figma source.

---

## `contracts/` — Foundry / Solidity

Standard Foundry layout: `src/`, `test/`, `script/`, `lib/` (submodules:
`forge-std`, `openzeppelin-contracts`).

### Commands
```bash
forge build              # compile
forge test -vvv          # run tests
forge fmt                # format (CI runs `forge fmt --check`)
forge snapshot            # gas snapshots
```

CI (`.github/workflows/test.yml`) runs `forge fmt --check`, `forge build --sizes`, and
`forge test -vvv` on every push/PR. Run `forge fmt` before committing Solidity changes.

### `JuvraEscrow.sol`

- `Ownable` + `ReentrancyGuard` (OpenZeppelin), Solidity `^0.8.30`.
- Escrows **native value** (`msg.value`) per job — on Arc Testnet the native token is
  presented as USDC.
- Job lifecycle (`Status` enum): `Open → Assigned → Submitted → Approved` (happy path),
  or `→ Disputed → Refunded/Approved` (arbitrator-resolved), or `Open → Cancelled`.
- Key functions: `postJob`, `applyForJob`, `selectFreelancer`, `submitWork`,
  `approveWork`, `raiseDispute`, `resolveDispute` (arbitrator-only), `cancelJob`,
  `getJob`, `getJobCount`, `getApplicants`.
- Uses custom errors (e.g. `InvalidStatus`, `Unauthorized`) rather than revert strings;
  follow this pattern for new errors.
- `_sendValue` does a raw `.call{value:}` and reverts with `TransferFailed` on failure —
  payout functions are `nonReentrant`.

### Deployment

- `script/Deploy.s.sol` deploys `JuvraEscrow(arbitrator)`, where `arbitrator` comes from
  the `ARBITRATOR_ADDRESS` env var (defaults to the deployer).
- `foundry.toml` defines an `arc_testnet` RPC alias
  (`https://rpc.testnet.arc.network`).
- The currently deployed contract (from `broadcast/Deploy.s.sol/5042002/run-latest.json`)
  is `0x29e093597a40ead176bbf31fca1f9cfd76bd3b9a` on chain `5042002`, with arbitrator
  `0x46887Ed8f4faa4193b3cD5CCCced96A63CEF4eD4`. If you redeploy, update
  `NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS` in `frontend/.env.local` and regenerate
  `frontend/src/lib/JuvraEscrow.abi.json` from the new build artifact.

---

## `frontend/` — Next.js app

### Tech stack

- **Next.js 16.2.6** (App Router), **React 19**, **TypeScript** (strict mode).
- **Tailwind CSS v4** (CSS-based config in `src/app/globals.css`, no `tailwind.config.*`).
- **shadcn/ui** components on **radix-ui** (`components.json`: style `radix-nova`,
  base color `neutral`). Primitives live in `src/components/ui/`.
- **wagmi v3** + **viem** + **RainbowKit** for wallet connection, configured for the
  Arc Testnet chain defined in `src/lib/arc.ts`.
- Path alias `@/*` → `frontend/src/*`.
- Node `>=20.9.0` (`package.json` engines); `.nvmrc` pins `22`.

### ⚠️ Next.js version warning

`frontend/CLAUDE.md` imports `frontend/AGENTS.md`, which states this Next.js version has
**breaking changes vs. training data** — APIs/conventions may differ. **Read
`node_modules/next/dist/docs/` before writing Next.js code in `frontend/`** and heed
deprecation notices. This applies automatically whenever working inside `frontend/`.

### Commands (run from `frontend/`)
```bash
npm install
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint (flat config: eslint-config-next core-web-vitals + typescript)
```
There is currently **no automated frontend test suite** — verify changes via `npm run
lint`, `npm run build`, and manual testing with `npm run dev`.

### Directory map (`frontend/src/`)

- **`app/`** — App Router routes
  - `page.tsx` — landing page, renders `JuvraFigmaLanding`.
  - `jobs/` and `jobs/[id]/` — job board and job detail (canonical job-detail route).
  - `job/[id]/` — thin client re-export that redirects to `jobs/[id]/page.tsx`. Edit
    `jobs/[id]/page.tsx`, not this file.
  - `post/` and `post-job/` — **two separate job-posting UIs**: `post/page.tsx` is a
    self-contained form using `useWriteContract` directly; `post-job/page.tsx` renders
    `components/post-job-form.tsx`. Confirm with the user which one is in scope before
    changing job-posting behavior.
  - `dashboard/` — user's jobs/applications dashboard.
  - `admin/` and `admin/disputes/` — arbitrator/admin console (gated by
    `useAdminAccess`).
  - `about/`, `docs/`, `privacy/`, `terms/` — static info pages via
    `components/marketing/InfoPage`.
  - `api/agent/*` — server routes for AI agent features: `analyze-job`,
    `review-delivery`, `dispute-summary`, `recommend-action`, `scope-builder`,
    `debug-gemini`.
  - `api/debug/contract` — debug route that reads jobs directly via viem
    (`createPublicClient`).

- **`components/`**
  - `figma/` — landing page sections ported from the Figma export
    (`JuvraFigmaLanding` + section components).
  - `agent/` — AI agent UI: `AgentPanel`, `AgentFlagsPanel`, `AgentTimeline`,
    `EvidencePanel`, `AgentScopeBuilder`, `AdminAgentSummary`, `AgentGuidedActions`,
    `AgentRiskPreview`.
  - `ui/` — shadcn primitives (`button`, `card`, `dialog`, `tabs`, `input`, `textarea`,
    `badge`).
  - Job UI: `JobCard`, `JobStatusBadge`, `DisputePanel`, `SubmitWorkDialog`,
    `apply-button`, `trending-jobs`, `post-job-form`.

- **`hooks/`**
  - `use-juvra-escrow.ts` — wagmi read/write hooks (`useJobs`, `useJob`, `useApplicants`,
    `useArbitrator`, `useEscrowWrite`, `useCurrentRole`, etc.), all gated by
    `isEscrowConfigured()`.
  - `use-admin-access.ts` — compares connected address to the contract's `arbitrator()`
    (with `NEXT_PUBLIC_JUVRA_ADMIN_ADDRESS` as fallback) to gate `/admin`.
  - `use-transaction-success.ts`.

- **`lib/`**
  - `contract.ts` / `juvraEscrow.ts` / `JuvraEscrow.abi.json` — contract address (from
    `NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS`), ABI, `JuvraJob` type, `normalizeJuvraJob`, and
    user-facing error messages for misconfiguration.
  - `arc.ts` — Arc Testnet chain definition (`defineChain`, id `5042002`, explorer
    `testnet.arcscan.app`).
  - `job-status.ts` — `jobStatuses` enum labels and `getAgentStatusGuidance(status)`,
    which maps each on-chain status to a default agent mode and guidance text.
  - `format.ts`, `utils.ts` (shadcn `cn` helper), `landing-demo-data.ts`.
  - `agent/` — AI agent subsystem (below).
  - `persistence/agentPersistence.ts` — thin wrapper around `agent/storage.ts` and
    `agent/evidence.ts`; documents future Supabase tables (`agent_runs`, `job_notes`) as
    comments/placeholders but **persistence is localStorage-only today**
    (`getActivePersistenceMode()` always returns `"localStorage"`).

### AI agent subsystem (`lib/agent/`)

- `agentTypes.ts` — shared types: `JobRiskAnalysis`, `DeliveryReviewResult`,
  `DisputeSummaryResult`, `AgentRecommendation`, `ScopeBuilderResult`, `AgentAction`.
- `provider.ts` — `runAgentProvider({ gemini, mock, routeName })`: picks Gemini only if
  `AI_PROVIDER=gemini` **and** `GEMINI_API_KEY` is set; otherwise uses mock. On Gemini
  failure, falls back to mock with `mode: "mock_fallback"` and a sanitized error (dev
  only). Every `api/agent/*` route follows this pattern.
- `geminiAgent.ts` — Gemini REST integration; model list from `GEMINI_MODEL` env var
  plus fallbacks (`gemini-1.5-flash`, etc.).
- `mockAgent.ts` / `risk.ts` — deterministic offline heuristics (clarity score, risk
  level, issue detection) used as the default provider and as the fallback.
- `flags.ts` — derives `AgentFlag[]` (e.g. `vague_scope`, `overdue_job`,
  `dispute_needs_admin`, `submitted_without_evidence`) from job state, agent results,
  and evidence.
- `evidence.ts` — `EvidenceItem`/`JobEvidenceStore` types and localStorage CRUD,
  dispatches `juvra-evidence-changed`.
- `schemas.ts` — input validation (`validateJobAnalysisInput`, etc.) and result
  normalization (`normalizeRecommendationResult`, etc.).
- `prompts.ts` — `ESCROW_AGENT_SYSTEM_PROMPT`.
- `storage.ts` — generic localStorage save/load/clear for agent results
  (`juvra-agent-<type>-<jobId>`), dispatches `juvra-agent-result-changed`.
- `circleFuture.ts` — **types/documentation only** for a future Circle agent-wallet
  policy (`escrowFundControlAllowed: false`, `requiresHumanWalletConfirmation: true`).
  Not implemented — don't build agent-wallet transaction logic without explicit
  instruction.

### Safety model — do not violate

Per `AGENTIC_ESCROW_ROADMAP.md` and `CHALLENGE_SUBMISSION.md`, the AI agent must
**never**:

- release or refund escrow funds, or sign transactions
- select freelancers or resolve disputes automatically
- replace wallet confirmation, admin judgment, or human review
- store secrets/credentials in evidence notes

Agent output (`/api/agent/*`) is advisory only — recommendations, summaries, flags,
scope suggestions. All state-changing escrow calls (`approveWork`, `resolveDispute`,
`cancelJob`, `selectFreelancer`, etc.) must go through `useEscrowWrite`/
`useWriteContract` behind an explicit user button click and wallet confirmation. When
adding agent features, keep this separation — agents recommend, humans/wallets act.

### Environment variables (`frontend/.env.local`, not committed)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS` | Deployed `JuvraEscrow` address; required for contract reads/writes (`isJuvraEscrowConfigured`) |
| `NEXT_PUBLIC_ARC_RPC_URL` | Arc Testnet RPC (defaults to `https://rpc.testnet.arc.network`) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | RainbowKit/WalletConnect project ID |
| `NEXT_PUBLIC_JUVRA_ADMIN_ADDRESS` | Fallback admin/arbitrator address for `useAdminAccess` |
| `NEXT_PUBLIC_AGENT_MODE` | Set to `"live"` to allow the Gemini path (combined with `AI_PROVIDER`/key) |
| `AI_PROVIDER` | `"gemini"` to enable Gemini; otherwise mock is used |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini provider configuration |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Reserved for future persistence; currently unused (localStorage only) |

No `.env.example` exists in the repo — check with the user before adding one, and never
commit real secrets.

---

## Cross-cutting conventions

- TypeScript strict mode everywhere in `frontend/`; prefer typed contract reads via
  `normalizeJuvraJob` over raw tuple indexing.
- `"use client"` for interactive/wallet-aware components and hooks; `app/api/**/route.ts`
  files are server-only and must not import client-only modules.
- Reuse `src/components/ui/*` (shadcn) primitives rather than adding new UI libraries.
- Solidity: custom errors over revert strings, checks-effects-interactions, run
  `forge fmt` before committing.
- `contracts/lib/*` (forge-std, openzeppelin-contracts) are git submodules — don't edit
  their contents directly.
- Commit messages in this repo are short, imperative, sentence-case (see `git log`).
