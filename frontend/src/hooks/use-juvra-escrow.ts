"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {
  type JuvraJob,
  isEscrowConfigured,
  juvraEscrowAbi,
  juvraEscrowAddress,
  normalizeJuvraJob,
} from "@/lib/juvraEscrow";

export function useJobCount() {
  return useReadContract({
    address: juvraEscrowAddress,
    abi: juvraEscrowAbi,
    functionName: "getJobCount",
    query: {
      enabled: isEscrowConfigured(),
    },
  });
}

export function useJobs() {
  const countQuery = useJobCount();
  const count = countQuery.data ? Number(countQuery.data) : 0;

  const contracts = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        address: juvraEscrowAddress,
        abi: juvraEscrowAbi,
        functionName: "getJob",
        args: [BigInt(index + 1)],
      })),
    [count],
  );

  const jobsQuery = useReadContracts({
    contracts,
    query: {
      enabled: isEscrowConfigured() && count > 0,
    },
  });

  const jobs = useMemo(() => {
    return (jobsQuery.data ?? [])
      .map((item) => (item.status === "success" ? normalizeJuvraJob(item.result) : null))
      .filter((job): job is JuvraJob => Boolean(job))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [jobsQuery.data]);

  return {
    count,
    jobs,
    isLoading: countQuery.isLoading || jobsQuery.isLoading,
    isError: !isEscrowConfigured() || countQuery.isError || jobsQuery.isError,
    error: countQuery.error ?? jobsQuery.error,
    refetch: async () => {
      await countQuery.refetch();
      await jobsQuery.refetch();
    },
  };
}

export function useJob(jobId: bigint | undefined) {
  return useReadContract({
    address: juvraEscrowAddress,
    abi: juvraEscrowAbi,
    functionName: "getJob",
    args: jobId === undefined ? undefined : [jobId],
    query: {
      enabled: isEscrowConfigured() && jobId !== undefined,
    },
  });
}

export function useApplicants(jobId: bigint | undefined) {
  return useReadContract({
    address: juvraEscrowAddress,
    abi: juvraEscrowAbi,
    functionName: "getApplicants",
    args: jobId === undefined ? undefined : [jobId],
    query: {
      enabled: isEscrowConfigured() && jobId !== undefined,
    },
  });
}

export function useArbitrator() {
  return useReadContract({
    address: juvraEscrowAddress,
    abi: juvraEscrowAbi,
    functionName: "arbitrator",
    query: {
      enabled: isEscrowConfigured(),
    },
  });
}

export function useEscrowWrite() {
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
  });

  return {
    ...write,
    receipt,
    isPending: write.isPending || receipt.isLoading,
    isSuccess: receipt.isSuccess,
    transactionHash: write.data,
  };
}

export function useCurrentRole(job?: JuvraJob | null) {
  const { address } = useAccount();
  const lowerAddress = address?.toLowerCase();

  return {
    address,
    isClient: Boolean(job && lowerAddress === job.client.toLowerCase()),
    isSelectedFreelancer: Boolean(
      job &&
        job.freelancer !== "0x0000000000000000000000000000000000000000" &&
        lowerAddress === job.freelancer.toLowerCase(),
    ),
  };
}

export function isSameAddress(a?: Address | string, b?: Address | string) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}
