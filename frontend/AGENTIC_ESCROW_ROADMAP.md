# Juvra Agentic Escrow Roadmap

## What Juvra Agent Can Do Now

- Analyze job scope clarity and escrow dispute risk.
- Review delivery notes and saved evidence against expected deliverables.
- Summarize disputes for human review.
- Recommend advisory next steps such as revision, admin escalation, or manual release review.
- Persist local agent results and evidence in browser storage per job.
- Display advisory flags and timeline context for clients, freelancers, and admins.

## What Juvra Agent Must Never Do

- Never release escrow funds.
- Never refund escrow funds.
- Never sign transactions.
- Never select freelancers automatically.
- Never resolve disputes automatically.
- Never replace wallet confirmation, admin judgment, or human review.
- Never store secrets or private credentials in local evidence notes.

## Current Safe Architecture

- Smart contract writes remain in wallet-connected UI buttons only.
- Agent outputs are decision support only.
- Local persistence is the active default through a Supabase-ready abstraction.
- AI provider fallback is Gemini to mock, or mock only when no provider is configured.
- Evidence storage is local URL/note persistence only. No file uploads are performed.
- Timeline and automation flags are generated from available job data, saved agent runs, and local evidence.

## Future Circle Agent Wallet / x402 Uses

- Paying tiny API fees for delivery verification.
- Calling x402-protected verification endpoints.
- Running reputation checks for clients and freelancers.
- Triggering reminder services for deadlines, reviews, or evidence gaps.
- Performing document/proof validation against external verification services.

Agent wallets must not control escrow release/refund in this beginner version.
Any future agent-wallet capability must be isolated from escrow fund control and must not bypass explicit human wallet confirmation.
