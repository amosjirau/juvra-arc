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

Future-ready / planned:

- Circle Wallets for secure agent-controlled transaction flows (needs Circle developer credentials)
- Paymaster for sponsored-gas onboarding (Arc already denominates gas in native USDC)
- Gateway for treasury/routing workflows (Gateway contracts exist on Arc Testnet; the flow is API-gated)
- CCTP for cross-chain USDC settlement expansion (Arc is CCTP domain 26; live-able once a second funded chain is wired)

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
- The UI labels the verification action as a testnet/demo verification payment and states that escrow funds are not controlled by the agent.

## What Is Future-Ready But Not Live

- Circle Wallets are not integrated yet (needs Circle developer credentials).
- Paymaster is not integrated yet; Arc already denominates gas in native USDC.
- Gateway is not wired yet (its contracts exist on Arc Testnet, but the routing/attestation flow is API-gated).
- CCTP is not wired yet; Arc is CCTP domain 26 and the V2 contracts are known, but a live cross-chain transfer needs a second funded chain.

Note: the nanopayment verification fee is now genuinely live on Arc Testnet (see the Live / implemented list), not a demo ledger entry.

## Safety Model

- AI never releases escrow funds automatically.
- AI never refunds escrow funds automatically.
- AI never signs user wallet transactions.
- AI never selects freelancers automatically.
- AI never resolves disputes automatically.
- Every escrow write action requires explicit human click and wallet confirmation.
- Agent verification is advisory only.
- Agent economic action logs are local demo/testnet records and are not fake escrow data.

## Production Path

The path to production is to replace the local agent economic action ledger with a Circle-backed payment flow, add policy-controlled Circle Wallet transaction preparation, add Paymaster-sponsored onboarding where appropriate, and route verification service fees through Nanopayments while preserving the rule that only humans confirm escrow settlement.
