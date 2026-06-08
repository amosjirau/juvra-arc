import { formatEther } from "viem";

export function shortAddress(address?: string) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUsdc(amount: bigint) {
  return `${Number(formatEther(amount)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })} USDC`;
}

export function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function errorMessage(error: { message?: string } | null | undefined) {
  if (!error?.message) {
    return "Transaction failed.";
  }

  const knownError = error as {
    shortMessage?: string;
    details?: string;
    cause?: { shortMessage?: string; message?: string };
  };

  return (
    knownError.shortMessage ||
    knownError.details ||
    knownError.cause?.shortMessage ||
    knownError.cause?.message ||
    error.message.split("\n")[0]
  );
}
