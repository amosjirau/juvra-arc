import { NextResponse } from "next/server";
import { formatEther, parseEther, type Address } from "viem";

import { getAgentWallet } from "@/lib/agent/agentWallet";
import {
  decideVerificationPayment,
  getPerTxCapUSDC,
  getSessionBudgetUSDC,
  isAllowedRecipient,
  type AutonomousPurpose,
} from "@/lib/agent/autonomyPolicy";
import {
  getSessionSpentUSDC,
  recordAutonomousPayment,
} from "@/lib/agent/autonomousLedger";
import { arcExplorerUrl } from "@/lib/arc";
import type { EvidenceItem } from "@/lib/agent/evidence";
import {
  getNanopaymentMemo,
  toNativeUSDCValue,
} from "@/lib/agent/nanopaymentPolicy";

// Gas headroom kept in the agent wallet for the native-USDC transfer fee.
const GAS_BUFFER = parseEther("0.005");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jobId = String(body.jobId ?? "").trim();

    if (!jobId) {
      throw new Error("jobId is required.");
    }

    const purpose: AutonomousPurpose =
      body.purpose === "service" ? "service" : "verification";
    const evidenceItems: EvidenceItem[] = Array.isArray(body.evidenceItems)
      ? body.evidenceItems
      : [];
    const riskFlags: string[] = Array.isArray(body.riskFlags)
      ? body.riskFlags.filter((item: unknown): item is string => typeof item === "string")
      : [];

    const wallet = getAgentWallet();

    if (!wallet.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Agent wallet is not configured. Set AGENT_WALLET_PRIVATE_KEY and fund the address.",
        },
        { status: 503 }
      );
    }

    let amountUSDC: string;
    let recipient: Address;
    let reason: string;
    let signals: string[] = [];

    if (purpose === "service") {
      const to = String(body.recipient ?? "").trim();

      if (!/^0x[a-fA-F0-9]{40}$/.test(to) || !isAllowedRecipient(to)) {
        return NextResponse.json(
          {
            success: false,
            error: "Recipient is not on the agent allowlist.",
          },
          { status: 400 }
        );
      }

      recipient = to as Address;
      const cap = Number(getPerTxCapUSDC());
      const requested = Number(body.amountUSDC ?? "0.01");
      amountUSDC = Math.min(requested > 0 ? requested : 0.01, cap).toFixed(2);
      reason = "Agent-to-service nanopayment to an allowlisted service agent.";
      signals = ["agent-to-agent service request"];
    } else {
      const decision = decideVerificationPayment({
        jobStatus: body.jobStatus,
        riskFlags,
        evidenceItems,
      });

      if (!decision.approved) {
        // A real autonomous decision: the agent chose NOT to spend.
        return NextResponse.json(
          { success: true, autonomous: true, paid: false, decision },
          { status: 200 }
        );
      }

      recipient = decision.recipient;
      amountUSDC = decision.amountUSDC;
      reason = decision.reason;
      signals = decision.signals;
    }

    // Session budget guard.
    const sessionBudget = Number(getSessionBudgetUSDC());
    const spent = getSessionSpentUSDC();

    if (spent + Number(amountUSDC) > sessionBudget) {
      return NextResponse.json(
        {
          success: false,
          error: `Session budget exhausted (${spent.toFixed(
            2
          )}/${sessionBudget.toFixed(2)} USDC). The agent stops spending.`,
        },
        { status: 429 }
      );
    }

    // On-chain balance guard (hard cap).
    const value = toNativeUSDCValue(amountUSDC);
    const balance = await wallet.getBalance();

    if (balance < value + GAS_BUFFER) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent wallet has insufficient USDC. Fund ${wallet.getAddress()} on Arc Testnet (need ~${amountUSDC} USDC + gas).`,
          address: wallet.getAddress(),
          balanceUSDC: Number(formatEther(balance)).toFixed(4),
        },
        { status: 402 }
      );
    }

    // Autonomous spend: the agent signs and sends this itself. No human signature.
    const txHash = await wallet.sendNativeUSDC(recipient, value);
    const explorerUrl = `${arcExplorerUrl}/tx/${txHash}`;
    const payment = {
      id: `auto-${txHash}`,
      jobId,
      purpose,
      amountUSDC,
      to: recipient,
      txHash,
      explorerUrl,
      reason,
      createdAt: new Date().toISOString(),
    };

    recordAutonomousPayment(payment);

    return NextResponse.json({
      success: true,
      autonomous: true,
      paid: true,
      payment,
      signals,
      memo: getNanopaymentMemo(
        jobId,
        purpose === "service" ? "agent-service" : "evidence-verification"
      ),
      safetyNotice:
        "Autonomous agent payment from the agent's own wallet. Escrow funds are not controlled by the agent and remain human-confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Autonomous payment failed.",
      },
      { status: 500 }
    );
  }
}
