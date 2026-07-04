// Verification service agent — a DISTINCT agent identity (its own keypair).
//
// In the agent-to-agent flow the orchestrator agent pays this service agent in
// USDC on Arc; the service agent confirms the payment on-chain, performs the
// verification work, and signs a receipt with its own key. Server-only.

import "server-only";

import { createPublicClient, formatEther, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { arcRpcUrl, arcTestnet } from "@/lib/arc";

function getServiceKey(): `0x${string}` | undefined {
  const raw = process.env.AGENT_SERVICE_AGENT_PRIVATE_KEY?.trim();

  return raw && /^0x[0-9a-fA-F]{64}$/.test(raw)
    ? (raw as `0x${string}`)
    : undefined;
}

export function isServiceAgentConfigured(): boolean {
  return Boolean(getServiceKey());
}

export function getServiceAgentAddress(): Address | null {
  const key = getServiceKey();

  return key ? privateKeyToAccount(key).address : null;
}

export function getServiceFeeUSDC(): string {
  const raw = process.env.AGENT_SERVICE_FEE_USDC?.trim();
  const value = Number(raw);

  return raw && Number.isFinite(value) && value > 0 ? value.toFixed(2) : "0.02";
}

/** The service agent signs its receipt so the orchestrator can verify authorship. */
export async function signServiceReceipt(message: string): Promise<`0x${string}`> {
  const key = getServiceKey();

  if (!key) {
    throw new Error("Service agent is not configured.");
  }

  return privateKeyToAccount(key).signMessage({ message });
}

/** The service agent independently confirms the orchestrator's USDC payment on-chain. */
export async function confirmPaymentReceived(txHash: `0x${string}`): Promise<{
  verified: boolean;
  to?: string;
  valueUSDC: string;
  status: string;
}> {
  const serviceAddress = getServiceAgentAddress();
  const client = createPublicClient({
    chain: arcTestnet,
    transport: http(arcRpcUrl),
  });

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  const tx = await client.getTransaction({ hash: txHash });

  const verified = Boolean(
    serviceAddress &&
      tx.to &&
      tx.to.toLowerCase() === serviceAddress.toLowerCase() &&
      receipt.status === "success"
  );

  return {
    verified,
    to: tx.to ?? undefined,
    valueUSDC: Number(formatEther(tx.value)).toFixed(4),
    status: receipt.status,
  };
}
