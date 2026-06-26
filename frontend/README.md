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
- Gemini-compatible agent provider with mock fallback
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
NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS=
NEXT_PUBLIC_ARC_RPC_URL=
NEXT_PUBLIC_AGENT_MODE=
AI_PROVIDER=
GEMINI_MODEL=
GEMINI_API_KEY=
```

For local mock-only agent behavior, leave `AI_PROVIDER` and `GEMINI_API_KEY` empty or unset. The verification, risk, delivery, dispute, scope, and recommendation APIs safely fall back to mock logic.

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
