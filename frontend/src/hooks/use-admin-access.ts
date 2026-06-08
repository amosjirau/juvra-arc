"use client";

import { isAddress } from "viem";
import { useAccount } from "wagmi";

import { isSameAddress, useArbitrator } from "@/hooks/use-juvra-escrow";

const fallbackAdminAddress = process.env.NEXT_PUBLIC_JUVRA_ADMIN_ADDRESS;

export function useAdminAccess() {
  const { address, isConnected } = useAccount();
  const arbitratorQuery = useArbitrator();
  const contractAdminAddress = arbitratorQuery.data as `0x${string}` | undefined;
  const fallbackAddress =
    fallbackAdminAddress && isAddress(fallbackAdminAddress)
      ? (fallbackAdminAddress as `0x${string}`)
      : undefined;
  const adminAddress = contractAdminAddress ?? fallbackAddress;
  const isAdmin = isSameAddress(address, adminAddress);

  return {
    address,
    adminAddress,
    arbitratorQuery,
    isAdmin,
    isConnected,
  };
}
