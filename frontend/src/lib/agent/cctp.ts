// Agent-driven CCTP V2 — BIDIRECTIONAL cross-chain USDC between Ethereum
// Sepolia and Arc. Burn on the source chain -> Circle attestation -> mint on
// the destination chain. Server-only; the agent signs with its own wallet key.
//
// Verified against Circle's "Transfer USDC from Ethereum to Arc" V2 quickstart.
// CCTP USDC is 6 decimals on both chains (on Arc via the ERC-20 interface).

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
  type Chain,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { arcExplorerUrl, arcRpcUrl, arcTestnet } from "@/lib/arc";

export type CctpDirection = "sepolia_to_arc" | "arc_to_sepolia";

const TOKEN_MESSENGER_V2 =
  "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as Address;
const MESSAGE_TRANSMITTER_V2 =
  "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as Address;

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

// Fast Transfer params (per the Arc quickstart). USDC is 6 decimals.
const MAX_FEE = 500n; // 0.0005 USDC
const MIN_FINALITY_THRESHOLD = 1000;

const SEPOLIA_RPC =
  process.env.SEPOLIA_RPC_URL?.trim() ||
  "https://ethereum-sepolia-rpc.publicnode.com";

type ChainConfig = {
  key: "sepolia" | "arc";
  label: string;
  domain: number;
  usdc: Address;
  chain: Chain;
  rpc: string;
  gasAsset: string;
  explorerTx: (hash: string) => string;
};

const CHAINS: Record<"sepolia" | "arc", ChainConfig> = {
  sepolia: {
    key: "sepolia",
    label: "Ethereum Sepolia",
    domain: 0,
    usdc: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238" as Address,
    chain: sepolia,
    rpc: SEPOLIA_RPC,
    gasAsset: "ETH",
    explorerTx: (hash) => `https://sepolia.etherscan.io/tx/${hash}`,
  },
  arc: {
    key: "arc",
    label: "Arc Testnet",
    domain: 26,
    // Arc USDC ERC-20 interface (6 decimals); native USDC is the gas token.
    usdc: "0x3600000000000000000000000000000000000000" as Address,
    chain: arcTestnet,
    rpc: arcRpcUrl,
    gasAsset: "USDC",
    explorerTx: (hash) => `${arcExplorerUrl}/tx/${hash}`,
  },
};

export function arcExplorerTx(hash: string): string {
  return CHAINS.arc.explorerTx(hash);
}

function directionChains(direction: CctpDirection): {
  src: ChainConfig;
  dst: ChainConfig;
} {
  return direction === "sepolia_to_arc"
    ? { src: CHAINS.sepolia, dst: CHAINS.arc }
    : { src: CHAINS.arc, dst: CHAINS.sepolia };
}

export function getDirectionInfo(direction: CctpDirection) {
  const { src, dst } = directionChains(direction);
  return {
    direction,
    sourceLabel: src.label,
    destLabel: dst.label,
    sourceDomain: src.domain,
    destDomain: dst.domain,
    sourceGasAsset: src.gasAsset,
  };
}

export function sourceExplorerTx(direction: CctpDirection, hash: string): string {
  return directionChains(direction).src.explorerTx(hash);
}

export function destExplorerTx(direction: CctpDirection, hash: string): string {
  return directionChains(direction).dst.explorerTx(hash);
}

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

export function getCctpAgentAddress(): Address | null {
  const key = getAgentKey();
  return key ? privateKeyToAccount(key).address : null;
}

function publicClientFor(c: ChainConfig) {
  return createPublicClient({ chain: c.chain, transport: http(c.rpc) });
}

function walletClientFor(c: ChainConfig) {
  const key = getAgentKey();
  if (!key) throw new Error("AGENT_WALLET_PRIVATE_KEY is not configured.");
  return createWalletClient({
    account: privateKeyToAccount(key),
    chain: c.chain,
    transport: http(c.rpc),
  });
}

async function usdcBalance(c: ChainConfig, address: Address): Promise<bigint> {
  return publicClientFor(c)
    .readContract({
      address: c.usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    })
    .catch(() => 0n);
}

export type CctpStatus = {
  configured: boolean;
  agentAddress: Address | null;
  sepolia: { usdcUSDC: string; ethBalance: string; domain: number };
  arc: { usdcUSDC: string; nativeUSDC: string; domain: number };
};

export async function getCctpStatus(): Promise<CctpStatus> {
  const agentAddress = getCctpAgentAddress();

  if (!agentAddress) {
    return {
      configured: false,
      agentAddress: null,
      sepolia: { usdcUSDC: "0.00", ethBalance: "0.0000", domain: 0 },
      arc: { usdcUSDC: "0.00", nativeUSDC: "0.0000", domain: 26 },
    };
  }

  const [sepoliaUsdc, sepoliaEth, arcUsdcErc20, arcNative] = await Promise.all([
    usdcBalance(CHAINS.sepolia, agentAddress),
    publicClientFor(CHAINS.sepolia).getBalance({ address: agentAddress }).catch(() => 0n),
    usdcBalance(CHAINS.arc, agentAddress),
    publicClientFor(CHAINS.arc).getBalance({ address: agentAddress }).catch(() => 0n),
  ]);

  return {
    configured: true,
    agentAddress,
    sepolia: {
      usdcUSDC: Number(formatUnits(sepoliaUsdc, 6)).toFixed(2),
      ethBalance: Number(formatEther(sepoliaEth)).toFixed(4),
      domain: CHAINS.sepolia.domain,
    },
    arc: {
      // ERC-20 view (6 decimals) is what CCTP burns; native (18) is the gas view.
      usdcUSDC: Number(formatUnits(arcUsdcErc20, 6)).toFixed(2),
      nativeUSDC: Number(formatEther(arcNative)).toFixed(4),
      domain: CHAINS.arc.domain,
    },
  };
}

/** Source-chain USDC balance (6-decimal CCTP units) for the chosen direction. */
export async function getSourceUsdcUSDC(direction: CctpDirection): Promise<string> {
  const agentAddress = getCctpAgentAddress();
  if (!agentAddress) return "0.00";
  const { src } = directionChains(direction);
  const bal = await usdcBalance(src, agentAddress);
  return Number(formatUnits(bal, 6)).toFixed(2);
}

/** Source-chain gas balance (native) for the chosen direction. */
export async function getSourceGas(direction: CctpDirection): Promise<{ gas: string; asset: string }> {
  const agentAddress = getCctpAgentAddress();
  const { src } = directionChains(direction);
  if (!agentAddress) return { gas: "0.0000", asset: src.gasAsset };
  const bal = await publicClientFor(src).getBalance({ address: agentAddress }).catch(() => 0n);
  return { gas: Number(formatEther(bal)).toFixed(4), asset: src.gasAsset };
}

/** Burn USDC on the source chain, targeting the agent on the destination chain. */
export async function burn(
  direction: CctpDirection,
  amountUSDC: string
): Promise<{ burnTxHash: Hash; approveTxHash: Hash; srcDomain: number }> {
  const agentAddress = getCctpAgentAddress();
  if (!agentAddress) throw new Error("Agent wallet is not configured.");

  const { src, dst } = directionChains(direction);
  const amount = parseUnits(amountUSDC, 6); // CCTP USDC: 6 decimals on both chains.
  if (amount <= 0n) throw new Error("Amount must be greater than zero.");
  if (amount <= MAX_FEE) throw new Error("Amount must exceed the CCTP max fee.");

  const wallet = walletClientFor(src);
  const publicClient = publicClientFor(src);

  // 1) Approve the TokenMessenger to spend the agent's USDC on the source chain.
  const approveTxHash = await wallet.sendTransaction({
    to: src.usdc,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [TOKEN_MESSENGER_V2, amount],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  // 2) depositForBurn -> burns on source, mints to the agent on the destination.
  const mintRecipient = pad(agentAddress, { size: 32 });
  const burnTxHash = await wallet.sendTransaction({
    to: TOKEN_MESSENGER_V2,
    data: encodeFunctionData({
      abi: depositForBurnAbi,
      functionName: "depositForBurn",
      args: [
        amount,
        dst.domain,
        mintRecipient,
        src.usdc,
        ZERO_BYTES32, // destinationCaller: anyone may mint
        MAX_FEE,
        MIN_FINALITY_THRESHOLD,
      ],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: burnTxHash });

  return { burnTxHash, approveTxHash, srcDomain: src.domain };
}

type Attestation = { status: string; message?: `0x${string}`; attestation?: `0x${string}` };

/** Poll Circle's attestation service for a completed message from a source burn tx. */
export async function fetchAttestation(
  srcDomain: number,
  burnTxHash: Hash
): Promise<Attestation> {
  const url = `https://iris-api-sandbox.circle.com/v2/messages/${srcDomain}?transactionHash=${burnTxHash}`;
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

/** Mint on the destination chain via receiveMessage(message, attestation). */
export async function mint(
  direction: CctpDirection,
  message: `0x${string}`,
  attestation: `0x${string}`
): Promise<Hash> {
  const { dst } = directionChains(direction);
  const wallet = walletClientFor(dst);
  const publicClient = publicClientFor(dst);

  const mintTxHash = await wallet.sendTransaction({
    to: MESSAGE_TRANSMITTER_V2,
    data: encodeFunctionData({
      abi: receiveMessageAbi,
      functionName: "receiveMessage",
      args: [message, attestation],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTxHash });

  return mintTxHash;
}
