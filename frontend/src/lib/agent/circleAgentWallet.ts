// Circle Programmable Wallet (developer-controlled) as the agent's wallet.
//
// Implements the same AgentWallet interface as the local-key wallet, so the
// agent's autonomous payments can run through Circle Wallets instead of a raw
// private key. Circle custodies the key and signs via the entity secret; the
// agent still spends only from its own budgeted wallet; escrow settlement runs
// separately via escrowSettler.ts and is verdict-gated on-chain.

import "server-only";

import { createPublicClient, formatEther, http, type Address, type Hash } from "viem";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

import { arcRpcUrl, arcTestnet } from "@/lib/arc";
import type { AgentWallet } from "./agentWallet";

function circleConfig() {
  return {
    apiKey: process.env.CIRCLE_API_KEY?.trim(),
    entitySecret: process.env.CIRCLE_ENTITY_SECRET?.trim(),
    walletId: process.env.CIRCLE_WALLET_ID?.trim(),
    address: process.env.CIRCLE_WALLET_ADDRESS?.trim(),
  };
}

type CircleClient = ReturnType<typeof initiateDeveloperControlledWalletsClient>;
let cachedClient: CircleClient | null = null;

function getClient(): CircleClient {
  const { apiKey, entitySecret } = circleConfig();
  if (!apiKey || !entitySecret) {
    throw new Error("Circle wallet is not configured (CIRCLE_API_KEY / CIRCLE_ENTITY_SECRET).");
  }
  if (!cachedClient) {
    cachedClient = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  }
  return cachedClient;
}

const TERMINAL_FAILURE_STATES = new Set(["FAILED", "DENIED", "CANCELLED"]);

class CircleAgentWallet implements AgentWallet {
  readonly kind = "circle" as const;

  isConfigured(): boolean {
    const { apiKey, entitySecret, walletId, address } = circleConfig();
    return Boolean(apiKey && entitySecret && walletId && address);
  }

  getAddress(): Address | null {
    const { address } = circleConfig();
    return address && /^0x[a-fA-F0-9]{40}$/.test(address) ? (address as Address) : null;
  }

  async getBalance(): Promise<bigint> {
    const address = this.getAddress();
    if (!address) return 0n;
    // On Arc, USDC is the native gas token; read it on-chain directly.
    return createPublicClient({ chain: arcTestnet, transport: http(arcRpcUrl) })
      .getBalance({ address })
      .catch(() => 0n);
  }

  async sendNativeUSDC(to: Address, value: bigint): Promise<Hash> {
    const { walletId } = circleConfig();
    if (!walletId) {
      throw new Error("CIRCLE_WALLET_ID is not configured.");
    }

    const client = getClient();
    // Native USDC on Arc uses 18 decimals; formatEther yields the USDC amount.
    const amount = formatEther(value);

    // The installed SDK's blockchain union is stale and omits ARC-TESTNET, which
    // the API supports (the wallet was created on it). Cast to the param type.
    type CreateTxParams = Parameters<CircleClient["createTransaction"]>[0];
    const params = {
      walletId,
      destinationAddress: to,
      amounts: [amount],
      blockchain: "ARC-TESTNET",
      tokenAddress: "", // empty token address => native token (USDC on Arc)
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    } as unknown as CreateTxParams;

    const created = await client.createTransaction(params);

    const txId = created.data?.id;
    if (!txId) {
      throw new Error("Circle did not return a transaction id.");
    }

    // Circle signs + broadcasts asynchronously; poll for the on-chain tx hash.
    for (let i = 0; i < 20; i++) {
      const detail = await client.getTransaction({ id: txId });
      const tx = detail.data?.transaction;

      if (tx?.txHash) {
        return tx.txHash as Hash;
      }
      if (tx?.state && TERMINAL_FAILURE_STATES.has(tx.state)) {
        throw new Error(`Circle transaction ${tx.state}.`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Circle transaction did not produce a tx hash in time.");
  }
}

const circleAgentWallet = new CircleAgentWallet();

export function getCircleAgentWallet(): AgentWallet {
  return circleAgentWallet;
}
