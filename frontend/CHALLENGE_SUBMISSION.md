# Juvra — Agentic Freelance Commerce Network on Arc

## Short Description

Juvra is an AI-assisted escrow and dispute coordination layer for freelance commerce, built on Arc. It uses agentic workflows to structure jobs, review delivery evidence, summarize disputes, and recommend human-confirmed settlement actions, with USDC positioned as the stable settlement layer.

## Track

Best Agentic Economy Experience on Arc

## Circle Products Used

- USDC: settlement rail
- Circle Wallets: future secure agent-wallet interaction layer
- Gateway: future treasury and routing layer
- Nanopayments: future pay-per-verification and agentic API usage layer

## Functional MVP

- Arc escrow contract
- Live job reads
- Job posting
- Job detail workspace
- Agent risk analysis
- Delivery review
- Dispute summary
- Recommendation engine
- Evidence collection
- Admin dispute console
- Timeline
- Safe manual action buttons
- Agent Scope Builder for milestone, evidence, revision, and escrow-structure suggestions

## Safety Model

Juvra is agent-assisted and human-confirmed. The AI agent cannot release funds, refund funds, sign transactions, select freelancers, or resolve disputes. Every escrow write action requires an explicit user click and wallet confirmation.

## Circle Product Feedback

### Why USDC Fits Freelance Escrow

Freelance work benefits from predictable settlement value. USDC makes funded jobs easier for clients and freelancers to reason about because escrow value is not exposed to the volatility of native tokens during negotiation, delivery, review, and dispute windows.

### Why Circle Wallets Matter Next

Circle Wallets are useful for future agent-safe transaction preparation. Juvra can imagine agents preparing structured transaction intents, policy checks, or settlement recommendations while the user or authorized operator still confirms the final action.

### Why Gateway And Nanopayments Fit Future Workflows

Gateway and nanopayment patterns fit future verification and pay-per-agent workflows. Delivery checks, reputation APIs, evidence validation, and proof services could be paid for as small commerce events without giving agents control over escrow funds.

### Developer Experience Improvements

Useful improvements would include clearer starter templates for agent-safe wallet flows, more sample apps combining stablecoin settlement with AI decision support, and reference architectures for separating agent recommendations from final user-confirmed transactions.

## Live Versus Future Integrations

Live today:

- Arc smart contract escrow reads and writes
- USDC-denominated escrow positioning and settlement UX
- AI-assisted risk, delivery, dispute, recommendation, and scope-building workflows
- Manual wallet-confirmed escrow actions

Future-ready or planned:

- Circle Wallets for secure agent-assisted transaction preparation
- Gateway for treasury routing
- Nanopayments for pay-per-verification and agentic API usage

Agent wallets must not control escrow release or refund in this MVP.
