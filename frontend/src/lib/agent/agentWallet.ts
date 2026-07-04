// Autonomous agent operating wallet (server-only).
//
// This is the agent's OWN wallet, funded with a small USDC budget. The agent
// signs and sends nanopayments from it autonomously — it is NOT the user's
// wallet and it NEVER touches escrow. The user's escrow release/refund/dispute
// actions remain human-clicked and wallet-confirmed.
//
// The implementation is behind an interface so a Circle Programmable Wallet can
// be swapped in later without changing the routes that consume it.

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
import { getCircleAgentWallet } from "./circleAgentWallet";

export type AgentWalletKind = "local-key" | "circle";

export interface AgentWallet {
  readonly kind: AgentWalletKind;
  isConfigured(): boolean;
  getAddress(): Address | null;
  getBalance(): Promise<bigint>;
  sendNativeUSDC(to: Address, value: bigint): Promise<Hash>;
}

function getPrivateKey(): `0x${string}` | undefined {
  const raw = process.env.AGENT_WALLET_PRIVATE_KEY?.trim();

  return raw && /^0x[0-9a-fA-F]{64}$/.test(raw)
    ? (raw as `0x${string}`)
    : undefined;
}

function getPublicClient() {
  return createPublicClient({
    chain: arcTestnet,
    transport: http(arcRpcUrl),
  });
}

/** Local-key agent wallet. Holds the agent's own EOA private key in env. */
class LocalKeyAgentWallet implements AgentWallet {
  readonly kind = "local-key" as const;

  isConfigured(): boolean {
    return Boolean(getPrivateKey());
  }

  getAddress(): Address | null {
    const pk = getPrivateKey();

    return pk ? privateKeyToAccount(pk).address : null;
  }

  async getBalance(): Promise<bigint> {
    const address = this.getAddress();

    if (!address) {
      return 0n;
    }

    return getPublicClient().getBalance({ address });
  }

  async sendNativeUSDC(to: Address, value: bigint): Promise<Hash> {
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

    // Native USDC value transfer on Arc — the agent signs this itself.
    return walletClient.sendTransaction({ account, to, value, chain: arcTestnet });
  }
}

const localKeyAgentWallet = new LocalKeyAgentWallet();

/**
 * Returns the active agent wallet. Set AGENT_WALLET_PROVIDER=circle to run the
 * agent's autonomous payments through a Circle Programmable Wallet (when it is
 * configured); otherwise the local-key wallet is used.
 */
export function getAgentWallet(): AgentWallet {
  if (process.env.AGENT_WALLET_PROVIDER?.trim().toLowerCase() === "circle") {
    const circle = getCircleAgentWallet();
    if (circle.isConfigured()) {
      return circle;
    }
  }

  return localKeyAgentWallet;
}
