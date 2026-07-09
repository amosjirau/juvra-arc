import { NextResponse } from "next/server";
import { formatEther, parseEther } from "viem";

import {
  getAgentSettlements,
  recordAgentSettlement,
} from "@/lib/agent/autonomousLedger";
import {
  getOnChainAgentSettler,
  getSettlerAddress,
  getSettlerGasBalance,
  isSettlerConfigured,
  readJob,
  sendAgentSettle,
} from "@/lib/agent/escrowSettler";
import { arcExplorerUrl } from "@/lib/arc";

// Gas headroom the agent keeps for the settlement transaction fee.
const GAS_BUFFER = parseEther("0.005");

const STATUS_APPROVED = 3;
const STATUS_REFUNDED = 5;
const STATUS_CLIENT_APPROVED = 7;
const STATUS_CLIENT_REJECTED = 8;

// The agent executes the settlement of a party-recorded verdict. The contract
// enforces the direction (release on approve, refund on reject), so this route
// only decides WHEN to act — it re-reads on-chain state and is idempotent.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jobIdRaw = String(body.jobId ?? "").trim();

    if (!jobIdRaw || !/^\d+$/.test(jobIdRaw)) {
      throw new Error("jobId is required.");
    }

    const jobId = BigInt(jobIdRaw);

    if (!isSettlerConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Agent wallet is not configured. Set AGENT_WALLET_PRIVATE_KEY, or settle directly from your wallet — the contract lets either party execute a recorded verdict.",
        },
        { status: 503 }
      );
    }

    const [job, onChainSettler] = await Promise.all([
      readJob(jobId),
      getOnChainAgentSettler(),
    ]);

    if (!job) {
      return NextResponse.json(
        { success: false, error: `Job ${jobIdRaw} not found on-chain.` },
        { status: 404 }
      );
    }

    // Idempotent: a settled job is a success, not an error — retries converge.
    if (job.status === STATUS_APPROVED || job.status === STATUS_REFUNDED) {
      return NextResponse.json({
        success: true,
        alreadySettled: true,
        status: job.status,
      });
    }

    if (
      job.status !== STATUS_CLIENT_APPROVED &&
      job.status !== STATUS_CLIENT_REJECTED
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No verdict recorded for this job yet. The client must approve or reject the submitted work first.",
          status: job.status,
        },
        { status: 409 }
      );
    }

    const settlerAddress = getSettlerAddress();

    if (
      !settlerAddress ||
      settlerAddress.toLowerCase() !== onChainSettler.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Configured agent wallet ${settlerAddress} is not the contract's agentSettler (${onChainSettler}). Redeploy with AGENT_SETTLER_ADDRESS or call setAgentSettler as owner.`,
        },
        { status: 409 }
      );
    }

    const gasBalance = await getSettlerGasBalance();

    if (gasBalance < GAS_BUFFER) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent wallet has insufficient USDC for gas. Fund ${settlerAddress} on Arc Testnet.`,
          address: settlerAddress,
          balanceUSDC: Number(formatEther(gasBalance)).toFixed(4),
        },
        { status: 402 }
      );
    }

    const approved = job.status === STATUS_CLIENT_APPROVED;
    const direction = approved ? ("release" as const) : ("refund" as const);
    const recipient = approved ? job.freelancer : job.client;
    const amountUSDC = formatEther(job.amount);

    let txHash: `0x${string}`;

    try {
      txHash = await sendAgentSettle(jobId);
    } catch (error) {
      // A party may have settled concurrently — re-read and converge.
      const latest = await readJob(jobId);

      if (
        latest &&
        (latest.status === STATUS_APPROVED || latest.status === STATUS_REFUNDED)
      ) {
        return NextResponse.json({
          success: true,
          alreadySettled: true,
          status: latest.status,
        });
      }

      throw error;
    }

    const settlement = {
      id: `settle-${txHash}`,
      jobId: jobIdRaw,
      direction,
      amountUSDC,
      recipient,
      txHash,
      explorerUrl: `${arcExplorerUrl}/tx/${txHash}`,
      createdAt: new Date().toISOString(),
    };

    recordAgentSettlement(settlement);

    return NextResponse.json({
      success: true,
      autonomous: true,
      settlement,
      safetyNotice:
        "The agent executed a settlement whose direction was fixed on-chain by the client's verdict. The agent cannot choose where escrow funds go.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Agent settlement failed.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId")?.trim() || undefined;

  return NextResponse.json({
    success: true,
    settlements: getAgentSettlements(jobId),
  });
}
