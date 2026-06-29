// Agent-driven CCTP V2: the agent autonomously bridges USDC from Ethereum
// Sepolia INTO Arc (Arc as a settlement hub). Burn on Sepolia -> Circle
// attestation -> mint on Arc. Server-only; signs with the agent wallet key.
//
// Verified against Circle's "Transfer USDC from Ethereum to Arc" V2 quickstart.

import "server-only";

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  formatUnits,
  http,
  pad,
  parseUnits,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { arcExplorerUrl, arcRpcUrl, arcTestnet } from "@/lib/arc";

export function arcExplorerTx(hash: string): string {
  return `${arcExplorerUrl}/tx/${hash}`;
}

export const CCTP = {
  // Same deterministic addresses on every CCTP V2 chain (incl. Sepolia + Arc).
  tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as Address,
  messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as Address,
  sepolia: {
    domain: 0,
    usdc: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238" as Address,
  },
  arc: {
    domain: 26,
    usdc: "0x3600000000000000000000000000000000000000" as Address,
  },
  attestationBase: "https://iris-api-sandbox.circle.com",
} as const;

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

// Fast Transfer params (per the Arc quickstart).
const MAX_FEE = 500n; // 0.0005 USDC
const MIN_FINALITY_THRESHOLD = 1000;

const depositForBurnAbi = [
  {
    type: "function",
    name: "depositForBurn",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
    ],
    outputs: [],
  },
] as const;

const receiveMessageAbi = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

function getAgentKey(): `0x${string}` | undefined {
  const raw = process.env.AGENT_WALLET_PRIVATE_KEY?.trim();

  return raw && /^0x[0-9a-fA-F]{64}$/.test(raw)
    ? (raw as `0x${string}`)
    : undefined;
}

export function isCctpConfigured(): boolean {
  return Boolean(getAgentKey());
}

const sepoliaRpc =
  process.env.SEPOLIA_RPC_URL?.trim() ||
  "https://ethereum-sepolia-rpc.publicnode.com";

function sepoliaPublicClient() {
  return createPublicClient({ chain: sepolia, transport: http(sepoliaRpc) });
}

function sepoliaWalletClient() {
  const key = getAgentKey();
  if (!key) throw new Error("AGENT_WALLET_PRIVATE_KEY is not configured.");
  return createWalletClient({
    account: privateKeyToAccount(key),
    chain: sepolia,
    transport: http(sepoliaRpc),
  });
}

function arcPublicClient() {
  return createPublicClient({ chain: arcTestnet, transport: http(arcRpcUrl) });
}

function arcWalletClient() {
  const key = getAgentKey();
  if (!key) throw new Error("AGENT_WALLET_PRIVATE_KEY is not configured.");
  return createWalletClient({
    account: privateKeyToAccount(key),
    chain: arcTestnet,
    transport: http(arcRpcUrl),
  });
}

export function getCctpAgentAddress(): Address | null {
  const key = getAgentKey();
  return key ? privateKeyToAccount(key).address : null;
}

export type CctpStatus = {
  configured: boolean;
  agentAddress: Address | null;
  sepolia: { usdcUSDC: string; ethBalance: string; domain: number };
  arc: { usdcUSDC: string; domain: number };
};

export async function getCctpStatus(): Promise<CctpStatus> {
  const agentAddress = getCctpAgentAddress();

  if (!agentAddress) {
    return {
      configured: false,
      agentAddress: null,
      sepolia: { usdcUSDC: "0.00", ethBalance: "0.0000", domain: CCTP.sepolia.domain },
      arc: { usdcUSDC: "0.0000", domain: CCTP.arc.domain },
    };
  }

  const sepoliaPublic = sepoliaPublicClient();
  const arcPublic = arcPublicClient();

  const [sepoliaUsdc, sepoliaEth, arcUsdc] = await Promise.all([
    sepoliaPublic
      .readContract({
        address: CCTP.sepolia.usdc,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [agentAddress],
      })
      .catch(() => 0n),
    sepoliaPublic.getBalance({ address: agentAddress }).catch(() => 0n),
    // On Arc, USDC is the native gas token (18 decimals).
    arcPublic.getBalance({ address: agentAddress }).catch(() => 0n),
  ]);

  return {
    configured: true,
    agentAddress,
    sepolia: {
      usdcUSDC: Number(formatUnits(sepoliaUsdc, 6)).toFixed(2),
      ethBalance: Number(formatEther(sepoliaEth)).toFixed(4),
      domain: CCTP.sepolia.domain,
    },
    arc: {
      usdcUSDC: Number(formatEther(arcUsdc)).toFixed(4),
      domain: CCTP.arc.domain,
    },
  };
}

/** Burn USDC on Sepolia, targeting the agent address on Arc. Returns the burn tx hash. */
export async function burnOnSepolia(amountUSDC: string): Promise<{
  burnTxHash: Hash;
  approveTxHash: Hash;
  amount: bigint;
}> {
  const agentAddress = getCctpAgentAddress();
  if (!agentAddress) throw new Error("Agent wallet is not configured.");

  const amount = parseUnits(amountUSDC, 6); // Sepolia USDC has 6 decimals.
  if (amount <= 0n) throw new Error("Amount must be greater than zero.");
  if (amount <= MAX_FEE) throw new Error("Amount must exceed the CCTP max fee.");

  const wallet = sepoliaWalletClient();
  const publicClient = sepoliaPublicClient();

  // 1) Approve the TokenMessenger to spend the agent's USDC.
  const approveTxHash = await wallet.sendTransaction({
    to: CCTP.sepolia.usdc,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [CCTP.tokenMessengerV2, amount],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  // 2) depositForBurn -> burns on Sepolia, mints to the agent on Arc (domain 26).
  const mintRecipient = pad(agentAddress, { size: 32 });
  const burnTxHash = await wallet.sendTransaction({
    to: CCTP.tokenMessengerV2,
    data: encodeFunctionData({
      abi: depositForBurnAbi,
      functionName: "depositForBurn",
      args: [
        amount,
        CCTP.arc.domain,
        mintRecipient,
        CCTP.sepolia.usdc,
        ZERO_BYTES32, // destinationCaller: anyone may mint
        MAX_FEE,
        MIN_FINALITY_THRESHOLD,
      ],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: burnTxHash });

  return { burnTxHash, approveTxHash, amount };
}

type Attestation = { status: string; message?: `0x${string}`; attestation?: `0x${string}` };

/** Poll Circle's attestation service for a completed message from a source burn tx. */
export async function fetchAttestation(
  srcDomain: number,
  burnTxHash: Hash
): Promise<Attestation> {
  const url = `${CCTP.attestationBase}/v2/messages/${srcDomain}?transactionHash=${burnTxHash}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    return { status: res.status === 404 ? "pending" : `error_${res.status}` };
  }

  const data = await res.json();
  const entry = data?.messages?.[0];

  if (!entry || entry.status !== "complete") {
    return { status: entry?.status ?? "pending" };
  }

  return {
    status: "complete",
    message: entry.message as `0x${string}`,
    attestation: entry.attestation as `0x${string}`,
  };
}

/** Mint on Arc by submitting the message + attestation to the MessageTransmitter. */
export async function mintOnArc(
  message: `0x${string}`,
  attestation: `0x${string}`
): Promise<Hash> {
  const wallet = arcWalletClient();
  const publicClient = arcPublicClient();

  const mintTxHash = await wallet.sendTransaction({
    to: CCTP.messageTransmitterV2,
    data: encodeFunctionData({
      abi: receiveMessageAbi,
      functionName: "receiveMessage",
      args: [message, attestation],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTxHash });

  return mintTxHash;
}
