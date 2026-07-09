# Juvra - Agentic Freelance Commerce Network on Arc

## Summary

Juvra upgrades freelance escrow into an agentic commerce network on Arc. Clients fund USDC-denominated escrow jobs, freelancers submit delivery evidence, and Juvra agents evaluate risk, review evidence, run advisory verification workflows, summarize disputes, and recommend safe settlement actions.

Humans remain in control of final settlement. Every escrow write action requires an explicit click and wallet confirmation.

## Track

Best Agentic Economy Experience on Arc.

## Live Prototype

Implemented today:

- Landing page with Arc, USDC, and agentic economy narrative
- Marketplace at `/jobs`
- Job workspace at `/jobs/[id]`
- Dashboard at `/dashboard`
- Post job flow at `/post`
- Admin and dispute console at `/admin` and `/admin/disputes`
- Arc escrow reads and wallet-confirmed writes
- Agent APIs for risk analysis, delivery review, dispute summary, scope building, recommendations, and evidence verification
- Local evidence collection
- Local agent result persistence
- Local agent economic action ledger
- Live AI agent provider (Gemini default; optional xAI Grok or Groq) with a strict `live`/`mock` runtime and no silent fallback
- Provider health endpoint at `/api/agent/health`

## Escrow Contract

Correct Arc escrow contract address:

```text
0x29e093597a40EaD176BBF31fca1f9CFd76bd3b9a
```

## Agentic Economy Experience

The new verification workflow makes the economic agent behavior explicit:

1. A freelancer submits delivery evidence in the job workspace.
2. Juvra Agent checks real local signals: job status, evidence count, evidence links, dispute notes, delivery language, and verification budget.
3. The agent runs `/api/agent/verify-evidence`.
4. The API returns a verification receipt with a USDC-denominated cost.
5. The frontend records that receipt in the local "Agent economic action log".
6. The agent may recommend a settlement path, but the final escrow action still requires a human wallet confirmation.

This is intentionally safe: the verification action is separate from escrow funds and does not grant the agent signing power.

## Circle Tools

Live / implemented:

- Arc smart contract escrow
- USDC-denominated escrow logic (native USDC, the Arc gas token)
- Agentic risk/recommendation backend
- Manual wallet-confirmed settlement actions
- **Nanopayments: a real on-chain native-USDC verification fee on Arc Testnet.** The agent prepares a USDC-denominated verification payment; the human confirms it in their wallet; the real transaction hash and Arcscan link are recorded in the agent economic action ledger. This is separate from escrow and the agent never signs.
- **Autonomous agent payments: the agent has its OWN budgeted USDC wallet on Arc and pays nanopayments autonomously — no human signature.** It decides from real signals (delivery evidence, submission status, dispute state), signs and sends the USDC itself, and is bounded by a per-transaction cap, a session budget, a recipient allowlist, and its on-chain balance. Supports verification fees and agent-to-agent/service payments. The agent's wallet is not the user's wallet and never touches escrow, which stays human-confirmed.
- **CCTP cross-chain USDC: live and bidirectional (Arc ⇄ Ethereum Sepolia).** The agent autonomously burns USDC on the source chain, retrieves Circle's attestation, and mints on the destination chain — all agent-signed. Verified live end-to-end: burned 1 USDC on Arc (tx `0xccafe0…`) and minted it on Sepolia (tx `0xcac4c8…`).
- **Circle Programmable Wallets (developer-controlled) on Arc.** The agent's wallet can run as a Circle Wallet (entity-secret signed, custodied by Circle) via a swappable `AgentWallet` provider — set `AGENT_WALLET_PROVIDER=circle`. Verified live: an autonomous nanopayment signed by the Circle wallet on `ARC-TESTNET` (tx `0x2e0e7a…`, from the Circle wallet `0x4d92…fce8`).
- **Circle Gateway: a unified USDC balance with instant crosschain spend.** The agent autonomously deposits USDC into the Gateway Wallet on Arc (unified balance), then signs an EIP-712 burn intent, gets Circle's attestation, and mints on another chain. Verified live end-to-end: deposited 5 USDC on Arc, then transferred 4 USDC Arc → Sepolia (mint tx `0x1f77c5…`, Sepolia USDC 1.00 → 5.00). This is Circle's "nanopayments powered by Gateway" agentic rail.

Future-ready / planned:

- Paymaster — not applicable on Arc: Circle Paymaster lets users pay gas in USDC on chains where gas is otherwise ETH, but Arc already denominates gas in native USDC, so it is unnecessary here.

## What Is Real

- The frontend and backend routes are functional.
- Contract reads and wallet-confirmed writes use the configured Arc escrow contract.
- In live mode (`AGENT_RUNTIME_MODE=live`), every agent route runs a real AI provider and returns `mode: "live"` with the active `provider`. There is no silent mock fallback.
- If the live provider fails, the API returns `success: false` with a clear error ("Live AI provider failed. Check API key, quota, model, or billing.") and never substitutes a fake result. Error details are development-only and API keys are never exposed.
- `mock` mode (`AGENT_RUNTIME_MODE=mock`) is for local testing only and is clearly labeled `mode: "mock"`, `provider: "mock"`.
- The verification workflow produces a real receipt object and stores it in a transparent local ledger.
- The verification fee can be paid as a real on-chain native-USDC transfer on Arc Testnet (chain 5042002), human-confirmed in the wallet, with the real tx hash and Arcscan link recorded in the ledger.
- The agent autonomously settles USDC nanopayments from its own funded Arc wallet — verified live on-chain (e.g. tx `0x69a881…7b42`, agent-signed, no human signature), with per-tx/session/allowlist/balance guardrails. This is the autonomous-economy core of the submission.
- Agent-to-agent commerce is live: a distinct verification service agent (its own keypair) is paid in USDC by the orchestrator agent, independently confirms the payment on-chain, performs the verification, and returns a receipt signed with its own key — verified live (e.g. tx `0xf22588…e771`, service agent received 0.02 USDC, signed receipt).
- CCTP cross-chain USDC is live and verified end-to-end: the agent autonomously bridged 1 USDC Arc → Sepolia (burn `0xccafe0…` on Arc, Circle attestation `complete`, mint `0xcac4c8…` on Sepolia where the agent's USDC went 0.00 → 1.00). The bridge is bidirectional with a UI toggle.
- Circle Programmable Wallets are live: with `AGENT_WALLET_PROVIDER=circle`, the agent's autonomous payments are signed by a Circle developer-controlled wallet on `ARC-TESTNET` — verified on-chain (tx `0x2e0e7a…` from the Circle wallet `0x4d92…fce8`). The local-key wallet remains as a swappable alternative.
- Circle Gateway is live: the agent deposited 5 USDC into the Gateway unified balance on Arc and spent 4 USDC of it on Sepolia (burn intent → Circle attestation → `gatewayMint`, tx `0x1f77c5…`), all agent-signed. EIP-712 burn-intent types are used verbatim from Circle's official Gateway skill.
- The UI labels the verification action as a testnet/demo verification payment and states that escrow funds are not controlled by the agent.

## What Is Not Applicable

- Paymaster: Circle Paymaster sponsors gas in USDC on chains where gas is otherwise ETH. Arc denominates gas in native USDC already, so Paymaster is unnecessary on Arc — included here for completeness, not as a gap.

Note: the nanopayment verification fee, autonomous agent payments, agent-to-agent commerce, CCTP cross-chain USDC, Circle Programmable Wallets, and Circle Gateway are all genuinely live on testnet (see the Live / implemented list), not demo ledger entries.

## Safety Model

- Escrow settlement is verdict-gated: the client records an approve/reject verdict on-chain (a human wallet confirmation that moves no funds), then the agent executes the settlement autonomously. The contract fixes the direction — release to the freelancer on approve, refund to the client on reject — so the agent can never choose where escrow funds go.
- AI never signs user wallet transactions.
- AI never selects freelancers automatically.
- AI never resolves disputes automatically (dispute resolution stays with the human arbitrator).
- If the agent is offline, either party can execute a recorded verdict themselves (`agentSettle` is also callable by the job's client and freelancer).
- Every verdict, dispute, and manual escrow action requires an explicit human click and wallet confirmation.
- Agent verification is advisory only.
- Agent economic action logs are local demo/testnet records and are not fake escrow data.

## Production Path

The path to production is to replace the local agent economic action ledger with a Circle-backed payment flow, add policy-controlled Circle Wallet transaction preparation, add Paymaster-sponsored onboarding where appropriate, and route verification service fees through Nanopayments while preserving the rule that only humans confirm escrow settlement.
