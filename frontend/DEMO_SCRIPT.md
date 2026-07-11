# 3-Minute Demo Script

## 0:00-0:20 - Problem

Freelance work lacks trust and stable settlement. Clients worry about paying before delivery, freelancers worry about not getting paid after delivery, and disputes are hard to evaluate from messy chat threads and links.

## 0:20-0:45 - Juvra Overview

Juvra is an Agentic Freelance Commerce Network on Arc. It combines Arc smart contract escrow, USDC-denominated settlement, and AI agents that structure work, review risk, verify evidence, and recommend safe settlement actions.

## 0:45-1:10 - Post USDC Escrow Job On Arc

Open `/post` and show the client creating a USDC-denominated escrow job. Explain that Arc escrow holds the funds and that any write action requires a wallet confirmation.

## 1:10-1:40 - Agent Risk And Scope Review

Open a job workspace at `/jobs/1`. Run risk analysis and scope-building. Show how the agent identifies missing terms, acceptance criteria, delivery requirements, revision rules, and dispute risks.

## 1:40-2:10 - Freelancer Delivery And Evidence Verification

Add delivery evidence in the job workspace. Run "Run agent verification". Show the verification status, checked signals, findings, USDC cost, receipt, and "Agent economic action log". State clearly that this is a testnet/demo verification payment record and escrow funds are not controlled by the agent.

## 2:10-2:35 - Verdict And Autonomous Agent Settlement

Run the recommendation engine, then record the client verdict (approve or reject) with one wallet confirmation — this moves no funds, it only fixes the settlement direction on-chain. The agent then executes the settlement autonomously: release to the freelancer on approve, refund to the client on reject. Show the agent's settlement tx and Arcscan link.

## 2:35-2:50 - Admin Dispute Console

Open `/admin/disputes`. Show dispute summaries and admin review context. Explain that the agent helps summarize evidence, but it cannot resolve disputes automatically.

## 2:50-3:00 - Why Arc And Circle Matter

Arc provides programmable escrow and fast app-specific settlement. USDC gives stable value. Circle Wallets, Paymaster, Nanopayments, Gateway, and CCTP define the production path for agent-prepared payments, onboarding, verification commerce, treasury routing, and cross-chain USDC expansion.
