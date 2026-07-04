// Agent-driven Circle Gateway: a unified USDC balance with instant crosschain
// transfers (deposit -> unified balance -> burn intent -> attestation -> mint).
// Server-only; the agent signs with its own local key (the same wallet that
// holds Arc USDC + Sepolia ETH). Escrow is never touched.
//
// The EIP-712 typed data and contract calls are copied verbatim from Circle's
// official Gateway skill (circlefin/skills). Per Circle's security rule, these
// MUST NOT be modified — changing fields/types/order produces invalid signatures.

import "server-only";

import { randomBytes } from "node:crypto";

import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  http,
  maxUint256,
  pad,
  parseUnits,
  zeroAddress,
  type Address,
  type Chain,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import { arcExplorerUrl, arcRpcUrl, arcTestnet } from "@/lib/arc";

export const GATEWAY_WALLET_ADDRESS =
  "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as Address;
export const GATEWAY_MINTER_ADDRESS =
  "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as Address;
const GATEWAY_API = "https://gateway-api-testnet.circle.com/v1";

// Max Circle fee the agent permits per transfer (from the Circle reference).
const MAX_FEE = 2_010000n;

const SEPOLIA_RPC =
  process.env.SEPOLIA_RPC_URL?.trim() ||
  "https://ethereum-sepolia-rpc.publicnode.com";

export type GatewayChainKey = "arc" | "sepolia";

type GatewayChain = {
  key: GatewayChainKey;
  label: string;
  domain: number;
  usdc: Address;
  chain: Chain;
  rpc: string;
  gasAsset: string;
  explorerTx: (hash: string) => string;
};

const CHAINS: Record<GatewayChainKey, GatewayChain> = {
  arc: {
    key: "arc",
    label: "Arc Testnet",
    domain: 26,
    usdc: "0x3600000000000000000000000000000000000000" as Address,
    chain: arcTestnet,
    rpc: arcRpcUrl,
    gasAsset: "USDC",
    explorerTx: (hash) => `${arcExplorerUrl}/tx/${hash}`,
  },
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
};

// ---- EIP-712 typed data — copied verbatim from Circle's Gateway skill ----
const typedData = {
  domain: { name: "GatewayWallet", version: "1" },
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
    ],
    TransferSpec: [
      { name: "version", type: "uint32" },
      { name: "sourceDomain", type: "uint32" },
      { name: "destinationDomain", type: "uint32" },
      { name: "sourceContract", type: "bytes32" },
      { name: "destinationContract", type: "bytes32" },
      { name: "sourceToken", type: "bytes32" },
      { name: "destinationToken", type: "bytes32" },
      { name: "sourceDepositor", type: "bytes32" },
      { name: "destinationRecipient", type: "bytes32" },
      { name: "sourceSigner", type: "bytes32" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "value", type: "uint256" },
      { name: "salt", type: "bytes32" },
      { name: "hookData", type: "bytes" },
    ],
    BurnIntent: [
      { name: "maxBlockHeight", type: "uint256" },
      { name: "maxFee", type: "uint256" },
      { name: "spec", type: "TransferSpec" },
    ],
  },
  primaryType: "BurnIntent" as const,
};
// -------------------------------------------------------------------------

const gatewayWalletAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const gatewayMinterAbi = [
  {
    type: "function",
    name: "gatewayMint",
    inputs: [
      { name: "attestationPayload", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

function getAgentKey(): `0x${string}` | undefined {
  const raw = process.env.AGENT_WALLET_PRIVATE_KEY?.trim();
  return raw && /^0x[0-9a-fA-F]{64}$/.test(raw) ? (raw as `0x${string}`) : undefined;
}

export function isGatewayConfigured(): boolean {
  return Boolean(getAgentKey());
}

export function getGatewayAgentAddress(): Address | null {
  const key = getAgentKey();
  return key ? privateKeyToAccount(key).address : null;
}

function toBytes32(address: `0x${string}`) {
  return pad(address.toLowerCase() as `0x${string}`, { size: 32 });
}

function publicClientFor(c: GatewayChain) {
  return createPublicClient({ chain: c.chain, transport: http(c.rpc) });
}

function walletClientFor(c: GatewayChain) {
  const key = getAgentKey();
  if (!key) throw new Error("AGENT_WALLET_PRIVATE_KEY is not configured.");
  return createWalletClient({
    account: privateKeyToAccount(key),
    chain: c.chain,
    transport: http(c.rpc),
  });
}

async function usdcBalance(c: GatewayChain, address: Address): Promise<bigint> {
  return publicClientFor(c)
    .readContract({ address: c.usdc, abi: erc20Abi, functionName: "balanceOf", args: [address] })
    .catch(() => 0n);
}

/** Query the unified Gateway balance (POST /balances) across Arc + Sepolia. */
export async function getUnifiedBalances(
  depositor: Address
): Promise<Record<GatewayChainKey, string> & { total: string }> {
  const res = await fetch(`${GATEWAY_API}/balances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: "USDC",
      sources: [
        { domain: CHAINS.arc.domain, depositor },
        { domain: CHAINS.sepolia.domain, depositor },
      ],
    }),
  });

  const out: Record<GatewayChainKey, string> & { total: string } = {
    arc: "0.00",
    sepolia: "0.00",
    total: "0.00",
  };

  if (!res.ok) return out;

  const data = await res.json();
  let total = 0;
  for (const b of data?.balances ?? []) {
    const bal = Number(b.balance) || 0;
    total += bal;
    if (b.domain === CHAINS.arc.domain) out.arc = bal.toFixed(2);
    if (b.domain === CHAINS.sepolia.domain) out.sepolia = bal.toFixed(2);
  }
  out.total = total.toFixed(2);
  return out;
}

export type GatewayStatus = {
  configured: boolean;
  agentAddress: Address | null;
  unified: Record<GatewayChainKey, string> & { total: string };
  onchain: { arcUSDC: string; sepoliaETH: string };
};

export async function getGatewayStatus(): Promise<GatewayStatus> {
  const agentAddress = getGatewayAgentAddress();
  if (!agentAddress) {
    return {
      configured: false,
      agentAddress: null,
      unified: { arc: "0.00", sepolia: "0.00", total: "0.00" },
      onchain: { arcUSDC: "0.00", sepoliaETH: "0.0000" },
    };
  }

  const [unified, arcUsdc, sepoliaEth] = await Promise.all([
    getUnifiedBalances(agentAddress).catch(() => ({
      arc: "0.00",
      sepolia: "0.00",
      total: "0.00",
    })),
    usdcBalance(CHAINS.arc, agentAddress),
    publicClientFor(CHAINS.sepolia).getBalance({ address: agentAddress }).catch(() => 0n),
  ]);

  return {
    configured: true,
    agentAddress,
    unified,
    onchain: {
      arcUSDC: Number(formatUnits(arcUsdc, 6)).toFixed(2),
      sepoliaETH: Number(formatUnits(sepoliaEth, 18)).toFixed(4),
    },
  };
}

/** Deposit USDC into the Gateway Wallet on a source chain (approve + deposit). */
export async function depositToGateway(
  sourceKey: GatewayChainKey,
  amountUSDC: string
): Promise<{ approveTxHash: Hash; depositTxHash: Hash }> {
  const c = CHAINS[sourceKey];
  const amount = parseUnits(amountUSDC, 6);
  if (amount <= 0n) throw new Error("Amount must be greater than zero.");

  const wallet = walletClientFor(c);
  const publicClient = publicClientFor(c);

  const approveTxHash = await wallet.sendTransaction({
    to: c.usdc,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [GATEWAY_WALLET_ADDRESS, amount],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  const depositTxHash = await wallet.sendTransaction({
    to: GATEWAY_WALLET_ADDRESS,
    data: encodeFunctionData({
      abi: gatewayWalletAbi,
      functionName: "deposit",
      args: [c.usdc, amount],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

  return { approveTxHash, depositTxHash };
}

/**
 * Transfer unified USDC: build + sign a burn intent on the source domain, get
 * Circle's attestation, then gatewayMint on the destination chain. Instant
 * (no source-chain finality wait once the unified balance exists).
 */
export async function transferUnified(
  sourceKey: GatewayChainKey,
  destKey: GatewayChainKey,
  amountUSDC: string
): Promise<{ mintTxHash: Hash }> {
  const src = CHAINS[sourceKey];
  const dst = CHAINS[destKey];
  const key = getAgentKey();
  if (!key) throw new Error("AGENT_WALLET_PRIVATE_KEY is not configured.");

  const account = privateKeyToAccount(key);
  const value = parseUnits(amountUSDC, 6);

  const burnIntent = {
    maxBlockHeight: maxUint256,
    maxFee: MAX_FEE,
    spec: {
      version: 1,
      sourceDomain: src.domain,
      destinationDomain: dst.domain,
      sourceContract: toBytes32(GATEWAY_WALLET_ADDRESS),
      destinationContract: toBytes32(GATEWAY_MINTER_ADDRESS),
      sourceToken: toBytes32(src.usdc),
      destinationToken: toBytes32(dst.usdc),
      sourceDepositor: toBytes32(account.address),
      destinationRecipient: toBytes32(account.address),
      sourceSigner: toBytes32(account.address),
      destinationCaller: toBytes32(zeroAddress),
      value,
      salt: `0x${randomBytes(32).toString("hex")}` as `0x${string}`,
      hookData: "0x" as `0x${string}`,
    },
  };

  // Cast only to satisfy viem's strict typed-data generics; the object passed is
  // byte-identical to Circle's reference (do not change its fields/types/order).
  const signature = await account.signTypedData({
    ...typedData,
    message: burnIntent,
  } as unknown as Parameters<typeof account.signTypedData>[0]);

  const apiResponse = await fetch(`${GATEWAY_API}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ burnIntent, signature }], (_key, val) =>
      typeof val === "bigint" ? val.toString() : val
    ),
  });

  if (!apiResponse.ok) {
    throw new Error(
      `Gateway transfer API failed: ${apiResponse.status} ${(await apiResponse.text()).slice(0, 300)}`
    );
  }

  const { attestation, signature: attestationSig } = (await apiResponse.json()) as {
    attestation: `0x${string}`;
    signature: `0x${string}`;
  };

  const wallet = walletClientFor(dst);
  const publicClient = publicClientFor(dst);

  const mintTxHash = await wallet.sendTransaction({
    to: GATEWAY_MINTER_ADDRESS,
    data: encodeFunctionData({
      abi: gatewayMinterAbi,
      functionName: "gatewayMint",
      args: [attestation, attestationSig],
    }),
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTxHash });

  return { mintTxHash };
}

export function gatewayExplorerTx(key: GatewayChainKey, hash: string): string {
  return CHAINS[key].explorerTx(hash);
}
