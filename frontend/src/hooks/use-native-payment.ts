"use client";

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

/**
 * Native-value payment helper, mirroring `useEscrowWrite` but for a plain
 * value transfer (used for the on-chain USDC verification fee on Arc, where
 * USDC is the native gas token). The human signs in their wallet; the agent
 * only prepares the transaction parameters and never signs.
 */
export function useNativePayment() {
  const send = useSendTransaction();
  const receipt = useWaitForTransactionReceipt({
    hash: send.data,
  });

  return {
    ...send,
    receipt,
    isPending: send.isPending || receipt.isLoading,
    isSuccess: receipt.isSuccess,
    transactionHash: send.data,
  };
}
