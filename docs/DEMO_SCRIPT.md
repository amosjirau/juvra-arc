# Juvra — 3-Minute Demo Script

**Track:** Agentic Economy (Build on Arc / Circle hackathon)
**Recording target:** 3:00 max · 1280×800 browser window · `http://localhost:3000`

---

## Pre-flight checklist (do BEFORE recording)

1. **Server:** `export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH" && cd frontend && npm run dev`
2. **Wallets ready in MetaMask:**
   - Client wallet (`0x4688…4eD4`) — funded with Arc Testnet USDC (gas + escrow)
   - Freelancer wallet (`0xE8d0…f9dd`)
   - Arbitrator wallet (the configured admin)
3. **Agent env live:** `GEMINI/XAI/GROQ` key set (strict live provider — no mock),
   `CIRCLE_API_KEY` + entity secret set, agent wallet funded (Arc USDC + Sepolia ETH for CCTP mint gas).
4. **Seed state:** at least one *Open* job, one *Approved* job (job #1), and one *Disputed* job so every panel has content.
5. **Warm every page once** (first compile is slow): `/`, `/jobs`, `/post`, `/jobs/1`, `/agent-treasury`, `/dashboard`, `/admin/disputes`.
6. Close all other tabs; hide bookmarks bar; 100% zoom.

---

## Shot list

### 0:00 – 0:20 — Hook (Landing `/`)
Slow scroll from hero through "Four ways it holds together."

> "Juvra is escrow-backed freelance commerce, built on Arc. Every job is funded
> into on-chain USDC escrow before work begins — and released the moment it's
> approved. On Arc, even gas is USDC — one asset settles everything."

**Judging hook:** native USDC settlement, Arc-first design.

### 0:20 – 0:45 — Post + fund a job (`/post`)
Fill title/budget quickly, submit, confirm the two wallet prompts (approve + fund).

> "A client posts a job and funds it in one flow. The USDC leaves the client's
> wallet and locks in the escrow contract — trust you can read on-chain, not
> hope for."

**Show:** the wallet confirmation popup. This proves *human-confirmed* escrow.

### 0:45 – 1:30 — Agent workspace (`/jobs/1`)
Open job #1. Point at the disclaimer banner, then run the **Scope Builder** live.

> "This is the agentic layer. A live AI agent — no mocks — structures the work:
> milestones, acceptance criteria, evidence requirements, risk notes. But read
> the banner: the agent never releases funds, never signs for a user, never
> picks a freelancer. Every escrow action still requires an explicit human
> wallet confirmation."

Then click **Approve work** on the submitted job and confirm in wallet — USDC releases to the freelancer.

**Judging hook:** real live agent + hard safety boundary between agent and money.

### 1:30 – 2:20 — Agent treasury (`/agent-treasury`) — the centerpiece
Show the agent's own Circle Programmable Wallet balance, then run one live action
(CCTP transfer Arc → Sepolia, or a Gateway deposit — whichever is pre-funded and fast).

> "The agent has its *own* treasury — a Circle developer-controlled wallet,
> separate from users and escrow, with a hard spend budget. Within that budget
> it pays autonomously: service fees, agent-to-agent payments. Here it moves
> USDC across chains itself using Circle CCTP V2 — burn on Arc, attestation,
> mint on Sepolia — and it works in both directions. Gateway gives it a unified
> USDC balance across chains."

**Show:** the tx hash / explorer link when the action lands. Real money moving, driven by the agent.

**Judging hook:** Circle Wallets + CCTP V2 + Gateway, all live — an actual agentic economy participant, not a chatbot.

### 2:20 – 2:45 — Dispute + human arbitration (`/admin/disputes`)
Switch to the arbitrator wallet, open the disputed job, show the AI summary, resolve.

> "When humans disagree, the agent summarizes the evidence — but a human
> arbitrator signs the resolution. AI advises; people decide; the contract
> settles."

### 2:45 – 3:00 — Close (Dashboard `/dashboard` or landing)

> "Juvra: on-chain USDC escrow, a live AI agent with its own budgeted Circle
> wallet, CCTP and Gateway for cross-chain treasury — freelance work, settled
> with certainty, on Arc."

---

## Fallbacks

- **CCTP slow on camera?** Pre-run a burn before recording; on camera, paste the
  burn tx hash into the *Complete* step so the mint lands in seconds.
- **AI provider hiccup?** Re-run once — strict mode surfaces a clear error, which
  is itself demonstrable ("no silent mock fallback"), but don't lead with it.
- **Cut for time:** the dispute segment (2:20–2:45) is the first thing to drop;
  fold one line about arbitration into the close.

## One-liners to keep handy

- "The agent's wallet, the user's wallet, and the escrow are three different keys."
- "Gas is USDC on Arc — no second token anywhere in the product."
- "Everything you just saw is live on Arc Testnet — every hash resolves on the explorer."
