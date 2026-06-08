import type { Address } from "viem";

import {
  JUVRA_ESCROW_ABI,
  JUVRA_ESCROW_ADDRESS,
  isJuvraEscrowConfigured,
} from "@/lib/contract";

export const juvraEscrowAddress = JUVRA_ESCROW_ADDRESS;
export const juvraEscrowAbi = JUVRA_ESCROW_ABI;

export const jobStatuses = [
  "Open",
  "Assigned",
  "Submitted",
  "Approved",
  "Disputed",
  "Refunded",
  "Cancelled",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type JuvraJob = {
  id: bigint;
  client: Address;
  freelancer: Address;
  title: string;
  category: string;
  descriptionURI: string;
  submissionURI: string;
  amount: bigint;
  createdAt: number;
  deadline: number;
  status: number;
};

export function normalizeJuvraJob(job: unknown): JuvraJob | null {
  if (!job) {
    return null;
  }

  const raw = job as Partial<{
    id: bigint;
    client: Address;
    freelancer: Address;
    title: string;
    category: string;
    descriptionURI: string;
    submissionURI: string;
    amount: bigint;
    createdAt: bigint;
    deadline: bigint;
    status: number;
  }> &
    readonly unknown[];

  const id = raw.id ?? (raw[0] as bigint | undefined);
  const client = raw.client ?? (raw[1] as Address | undefined);
  const freelancer = raw.freelancer ?? (raw[2] as Address | undefined);
  const title = raw.title ?? (raw[3] as string | undefined);
  const category = raw.category ?? (raw[4] as string | undefined);
  const descriptionURI = raw.descriptionURI ?? (raw[5] as string | undefined);
  const submissionURI = raw.submissionURI ?? (raw[6] as string | undefined);
  const amount = raw.amount ?? (raw[7] as bigint | undefined);
  const createdAt = raw.createdAt ?? (raw[8] as bigint | undefined);
  const deadline = raw.deadline ?? (raw[9] as bigint | undefined);
  const status = Number(raw.status ?? raw[10] ?? 0);

  if (
    id === undefined ||
    !client ||
    !freelancer ||
    amount === undefined ||
    title === undefined ||
    category === undefined ||
    descriptionURI === undefined ||
    submissionURI === undefined ||
    createdAt === undefined ||
    deadline === undefined
  ) {
    return null;
  }

  return {
    id,
    client,
    freelancer,
    title,
    category,
    descriptionURI,
    submissionURI,
    amount,
    createdAt: Number(createdAt),
    deadline: Number(deadline),
    status,
  };
}

export function getStatusLabel(status: number) {
  return jobStatuses[status] ?? "Unknown";
}

export function isEscrowConfigured() {
  return isJuvraEscrowConfigured;
}
