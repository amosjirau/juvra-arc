// Agent escrow settlement — the agent executes a verdict the parties recorded
// on-chain. The contract's agentSettle() only moves funds in the direction of
// the recorded verdict (release on ClientApproved, refund on ClientRejected),
// so the agent has autonomy over WHEN settlement happens, never WHERE funds go.
// Server-only; the agent signs with its own wallet key.

import "server-only";

import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { arcRpcUrl, arcTestnet } from "@/lib/arc";
import { JUVRA_ESCROW_ABI, JUVRA_ESCROW_ADDRESS } from "@/lib/contract";
import { normalizeJuvraJob, type JuvraJob } from "@/lib/juvraEscrow";

function getPrivateKey(): `0x${string}` | null {
  const raw = process.env.AGENT_WALLET_PRIVATE_KEY?.trim();

  if (!raw) {
    return null;
  }

  return (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(arcRpcUrl),
});

export function isSettlerConfigured(): boolean {
  return Boolean(getPrivateKey());
}

export function getSettlerAddress(): Address | null {
  const pk = getPrivateKey();

  return pk ? privateKeyToAccount(pk).address : null;
}

export async function getOnChainAgentSettler(): Promise<Address> {
  return (await publicClient.readContract({
    address: JUVRA_ESCROW_ADDRESS,
    abi: JUVRA_ESCROW_ABI,
    functionName: "agentSettler",
  })) as Address;
}

export async function readJob(jobId: bigint): Promise<JuvraJob | null> {
  const raw = await publicClient.readContract({
    address: JUVRA_ESCROW_ADDRESS,
    abi: JUVRA_ESCROW_ABI,
    functionName: "getJob",
    args: [jobId],
  });

  return normalizeJuvraJob(raw);
}

export async function getSettlerGasBalance(): Promise<bigint> {
  const address = getSettlerAddress();

  if (!address) {
    return 0n;
  }

  return publicClient.getBalance({ address });
}

/**
 * Sends agentSettle(jobId) from the agent wallet and waits for inclusion.
 * Throws if the wallet is unconfigured or the transaction reverts.
 */
export async function sendAgentSettle(jobId: bigint): Promise<Hash> {
  const pk = getPrivateKey();

  if (!pk) {
    throw new Error("Agent wallet is not configured (AGENT_WALLET_PRIVATE_KEY).");
  }

  const account = privateKeyToAccount(pk);
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(arcRpcUrl),
  });

  const txHash = await walletClient.writeContract({
    address: JUVRA_ESCROW_ADDRESS,
    abi: JUVRA_ESCROW_ABI,
    functionName: "agentSettle",
    args: [jobId],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  if (receipt.status === "reverted") {
    throw new Error(`agentSettle reverted (tx ${txHash}).`);
  }

  return txHash;
}
