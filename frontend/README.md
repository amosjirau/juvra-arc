# Juvra

Juvra is an Agentic Freelance Commerce Network on Arc. AI agents help clients and freelancers structure scope, evaluate risk, review delivery evidence, run advisory verification workflows, and recommend settlement actions while Arc smart contracts hold escrow and USDC provides stable settlement.

Final escrow actions are human-confirmed. The agent never releases funds, refunds funds, signs transactions, selects freelancers, or resolves disputes.

## Challenge Track

Build on Arc / Circle hackathon - Agentic Economy Experience on Arc.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- wagmi, viem, RainbowKit
- Arc smart contract escrow
- USDC-denominated escrow UX
- Live AI agent provider (Gemini default; optional xAI Grok or Groq) with strict live/mock runtime modes and no silent fallback
- Browser localStorage for demo evidence, agent results, and agent economic action ledger

## Circle and Arc Tools Used

Live / implemented:

- Arc smart contract escrow
- USDC-denominated escrow logic
- Agentic risk/recommendation backend
- Manual wallet-confirmed settlement actions

Future-ready / planned:

- Circle Wallets for secure agent-prepared transaction flows
- Paymaster for gas/user onboarding improvements
- Nanopayments for pay-per-verification and agent-to-service commerce
- Gateway for treasury/routing workflows
- CCTP for cross-chain USDC settlement expansion

## Key Contract

Juvra escrow contract:

```text
0x29e093597a40EaD176BBF31fca1f9CFd76bd3b9a
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from your deployment settings. Do not commit real secrets.

Required environment variables:

```bash
# Agent runtime mode: "live" (real AI provider, no mock fallback) or
# "mock" (deterministic local testing only).
AGENT_RUNTIME_MODE=live

# Contract + chain
NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS=
NEXT_PUBLIC_ARC_RPC_URL=
NEXT_PUBLIC_AGENT_MODE=live

# Selected AI provider. Only the selected provider needs to be configured.
AI_PROVIDER=gemini

# Gemini (default provider)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Optional alternative providers (configure only if you select one):

```bash
# xAI Grok
AI_PROVIDER=xai
XAI_API_KEY=
XAI_MODEL=grok-4-latest

# Groq
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
```

> Note: `gemini-1.5-flash` is retired on the v1beta `generateContent` API (returns
> 404). Use `gemini-2.5-flash` (the default in code) or another current model.

### Live provider vs mock mode

The agent runtime is strict — there is **no silent mock fallback** in live mode.

- `AGENT_RUNTIME_MODE=live` (production): a real AI provider must run. On success the
  API returns `mode: "live"` and `provider: "gemini" | "xai" | "groq"`. If the provider
  fails (bad key, quota, model, billing), the API returns `success: false` with a clear
  error — it never fakes a result. The UI shows: *"Live AI provider failed. Check API
  key, quota, model, or billing."*
- `AGENT_RUNTIME_MODE=mock` (local testing only): the deterministic mock runs and the
  API returns `mode: "mock"`, `provider: "mock"`.

Error `details` are only included when `NODE_ENV=development`. API keys are never
returned by any endpoint, including the health check.

Escrow actions are unaffected by the AI provider: release, refund, cancel, and dispute
resolution always require an explicit human click and wallet confirmation.

## Local Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful routes:

- `/`
- `/jobs`
- `/jobs/1`
- `/dashboard`
- `/post`
- `/admin`
- `/admin/disputes`

## Verify the live agent

Check that the selected provider is ready (never returns the API key):

```bash
curl -X GET http://localhost:3000/api/agent/health
```

A healthy live provider returns:

```json
{ "success": true, "mode": "live", "provider": "gemini", "model": "gemini-2.5-flash", "liveProviderReady": true }
```

Run a real analysis. In live mode this must return `mode: "live"` and the selected
`provider` — never `mock_fallback`:

```bash
curl -X POST http://localhost:3000/api/agent/analyze-job \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build an Arc escrow dashboard",
    "description": "Build a responsive dashboard with wallet connection, escrow job cards, delivery evidence, and dispute summary.",
    "budget": "1200",
    "deadline": "2026-07-01",
    "deliverables": ["Dashboard", "Wallet connection", "Evidence panel", "Deployment link"]
  }'
```

If the live provider fails, the response is `{ "success": false, "mode": "live", "provider": "...", "error": "Live AI provider failed. Check API key, quota, model, or billing." }` with an HTTP 502, and no mock result is substituted.

## Build

```bash
npm run build
```

## Deployment

1. Deploy or verify the Arc escrow contract.
2. Set `NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS` to the Arc escrow address.
3. Set `NEXT_PUBLIC_ARC_RPC_URL` to the Arc RPC endpoint.
4. Set agent variables for mock or Gemini-backed mode.
5. Deploy the Next.js frontend to Vercel or another Node-compatible host.
6. Confirm read/write wallet flows against the Arc escrow contract.

## Safety Model

- AI never releases escrow funds automatically.
- AI never refunds escrow funds automatically.
- AI never signs user wallet transactions.
- AI never selects freelancers automatically.
- AI never resolves disputes automatically.
- Every escrow write action requires a human click and wallet confirmation.
- The verification panel records a local agent economic action log only; it does not control escrow funds.
- `.env.local` must stay local and must not be committed.

## Demo and Architecture

- [Demo script](./DEMO_SCRIPT.md)
- [Architecture](./ARCHITECTURE.md)
- [Challenge submission](./CHALLENGE_SUBMISSION.md)
