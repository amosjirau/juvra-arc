import { NextResponse } from "next/server";
import { formatEther, parseEther, type Address } from "viem";

import { getAgentWallet } from "@/lib/agent/agentWallet";
import { getSessionBudgetUSDC } from "@/lib/agent/autonomyPolicy";
import {
  getSessionSpentUSDC,
  recordAutonomousPayment,
} from "@/lib/agent/autonomousLedger";
import { verifyEvidenceGemini } from "@/lib/agent/geminiAgent";
import { verifyEvidenceMock } from "@/lib/agent/mockAgent";
import { verifyEvidenceOpenAICompat } from "@/lib/agent/openaiCompatAgent";
import {
  getNanopaymentMemo,
  toNativeUSDCValue,
} from "@/lib/agent/nanopaymentPolicy";
import { runAgentTask } from "@/lib/agent/provider";
import {
  normalizeAgentVerificationResult,
  validateAgentVerificationInput,
} from "@/lib/agent/schemas";
import {
  confirmPaymentReceived,
  getServiceAgentAddress,
  getServiceFeeUSDC,
  isServiceAgentConfigured,
  signServiceReceipt,
} from "@/lib/agent/serviceAgent";
import { arcExplorerUrl, arcTestnet } from "@/lib/arc";

// Gas headroom kept in the orchestrator wallet for the native-USDC transfer fee.
const GAS_BUFFER = parseEther("0.005");

// Agent-to-agent commerce: the orchestrator agent commissions verification work
// from a DISTINCT service agent, pays it in USDC on Arc, and the service agent
// confirms the payment on-chain and returns a signed verification receipt.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateAgentVerificationInput(body);

    const orchestrator = getAgentWallet();

    if (!orchestrator.isConfigured()) {
      return NextResponse.json(
        { success: false, error: "Orchestrator agent wallet is not configured." },
        { status: 503 }
      );
    }

    if (!isServiceAgentConfigured()) {
      return NextResponse.json(
        { success: false, error: "Verification service agent is not configured." },
        { status: 503 }
      );
    }

    const serviceAddress = getServiceAgentAddress() as Address;
    const fee = getServiceFeeUSDC();

    // 1) The service agent performs the verification work (strict live provider).
    //    If it cannot complete, no payment is made.
    const outcome = await runAgentTask({
      routeName: "use-verification-service",
      gemini: () => verifyEvidenceGemini(input),
      openaiCompat: () => verifyEvidenceOpenAICompat(input),
      mock: () => verifyEvidenceMock(input),
      normalize: (result) => normalizeAgentVerificationResult(result, input),
    });

    if (!outcome.body.success) {
      return NextResponse.json(
        { ...outcome.body, stage: "verification" },
        { status: outcome.status }
      );
    }

    const verification = outcome.body.result;

    // 2) Budget + balance guards before the orchestrator spends.
    const sessionBudget = Number(getSessionBudgetUSDC());
    const spent = getSessionSpentUSDC();

    if (spent + Number(fee) > sessionBudget) {
      return NextResponse.json(
        {
          success: false,
          error: `Session budget exhausted (${spent.toFixed(
            2
          )}/${sessionBudget.toFixed(2)} USDC).`,
        },
        { status: 429 }
      );
    }

    const value = toNativeUSDCValue(fee);
    const balance = await orchestrator.getBalance();

    if (balance < value + GAS_BUFFER) {
      return NextResponse.json(
        {
          success: false,
          error: `Orchestrator wallet has insufficient USDC. Fund ${orchestrator.getAddress()} on Arc Testnet.`,
          address: orchestrator.getAddress(),
          balanceUSDC: Number(formatEther(balance)).toFixed(4),
        },
        { status: 402 }
      );
    }

    // 3) Orchestrator autonomously pays the distinct service agent.
    const txHash = await orchestrator.sendNativeUSDC(serviceAddress, value);
    const explorerUrl = `${arcExplorerUrl}/tx/${txHash}`;

    // 4) The service agent independently confirms the payment on-chain.
    const paymentCheck = await confirmPaymentReceived(txHash);

    // 5) The service agent signs a verification receipt with its own key.
    const receiptMessage = JSON.stringify({
      kind: "juvra-verification-service-receipt",
      jobId: input.jobId,
      serviceAgent: serviceAddress,
      priceUSDC: fee,
      paymentTxHash: txHash,
      paymentVerified: paymentCheck.verified,
      verificationStatus: verification.verificationStatus,
      settlementImpact: verification.settlementImpact,
    });
    const signature = await signServiceReceipt(receiptMessage);

    // 6) Record the agent-to-agent payment.
    recordAutonomousPayment({
      id: `auto-${txHash}`,
      jobId: input.jobId,
      purpose: "service",
      amountUSDC: fee,
      to: serviceAddress,
      txHash,
      explorerUrl,
      reason:
        "Agent-to-agent: orchestrator paid the verification service agent for verification work.",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      autonomous: true,
      orchestratorAgent: orchestrator.getAddress(),
      serviceAgent: serviceAddress,
      payment: {
        txHash,
        explorerUrl,
        amountUSDC: fee,
        to: serviceAddress,
        chainId: arcTestnet.id,
      },
      paymentVerifiedByService: paymentCheck.verified,
      verification: {
        mode: outcome.body.mode,
        provider: outcome.body.provider,
        verificationStatus: verification.verificationStatus,
        settlementImpact: verification.settlementImpact,
        findings: verification.findings,
        checkedSignals: verification.checkedSignals,
        riskFlags: verification.riskFlags,
      },
      receipt: { message: receiptMessage, signature, signer: serviceAddress },
      memo: getNanopaymentMemo(input.jobId, "agent-service"),
      safetyNotice:
        "Autonomous agent-to-agent payment between the orchestrator and service agent wallets. Escrow funds are not controlled by the agents and remain human-confirmed.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Agent-to-agent verification failed.",
      },
      { status: 500 }
    );
  }
}
