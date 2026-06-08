import { NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  isAddress,
  zeroAddress,
  type Address,
} from "viem";

import { arcRpcUrl, arcTestnet } from "@/lib/arc";
import { JUVRA_ESCROW_ABI } from "@/lib/contract";
import { normalizeJuvraJob, type JuvraJob } from "@/lib/juvraEscrow";

export const dynamic = "force-dynamic";

type SerializedJob = {
  id: string;
  client: Address;
  freelancer: Address;
  title: string;
  category: string;
  descriptionURI: string;
  submissionURI: string;
  amount: string;
  createdAt: number;
  deadline: number;
  status: number;
};

export async function GET() {
  const escrowAddress = process.env.NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS;
  const isValidAddress = Boolean(
    escrowAddress && isAddress(escrowAddress) && escrowAddress !== zeroAddress
  );
  const client = createPublicClient({
    chain: arcTestnet,
    transport: http(arcRpcUrl),
  });

  let chainId: number = arcTestnet.id;
  let contractCode: string | undefined;
  let getJobCountWorks = false;
  let getJobCountValue: string | null = null;
  let getJobCountError: string | null = null;
  let firstJobReadWorks = false;
  let firstJobReadValue: SerializedJob | null = null;
  let firstJobReadError: string | null = null;

  try {
    chainId = await client.getChainId();
  } catch (error) {
    getJobCountError = `getChainId failed: ${getErrorMessage(error)}`;
  }

  if (isValidAddress && escrowAddress) {
    try {
      contractCode = await client.getCode({
        address: escrowAddress as Address,
      });
    } catch (error) {
      getJobCountError = `getCode failed: ${getErrorMessage(error)}`;
    }

    if (contractCode && contractCode !== "0x") {
      let count: bigint | null = null;

      try {
        const rawCount = await client.readContract({
          address: escrowAddress as Address,
          abi: JUVRA_ESCROW_ABI,
          functionName: "getJobCount",
        });

        if (typeof rawCount !== "bigint") {
          throw new Error("getJobCount() returned an unexpected value.");
        }

        count = rawCount;
        getJobCountWorks = true;
        getJobCountValue = count.toString();
      } catch (error) {
        getJobCountError = getErrorMessage(error);
      }

      if (count && count > 0n) {
        try {
          const rawJob = await client.readContract({
            address: escrowAddress as Address,
            abi: JUVRA_ESCROW_ABI,
            functionName: "getJob",
            args: [1n],
          });
          firstJobReadValue = serializeJob(normalizeJuvraJob(rawJob));
          firstJobReadWorks = Boolean(firstJobReadValue);
          firstJobReadError = firstJobReadValue
            ? null
            : "getJob(1) returned an unexpected shape.";
        } catch (error) {
          firstJobReadError = getErrorMessage(error);
        }
      } else if (count === 0n) {
        firstJobReadWorks = true;
      }
    } else if (!getJobCountError) {
      getJobCountError =
        "No contract code found at NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS on the configured Arc RPC.";
    }
  } else if (!getJobCountError) {
    getJobCountError =
      "NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS is missing or invalid.";
  }

  const contractCodeExists = Boolean(contractCode && contractCode !== "0x");

  return NextResponse.json({
    success: true,
    escrowAddress,
    rpcUrl: arcRpcUrl,
    chainId,
    contractCodeExists,
    contractCodePreview: contractCode ? contractCode.slice(0, 42) : null,
    getJobCountWorks,
    getJobCountValue,
    getJobCountError,
    firstJobReadWorks,
    firstJobReadValue,
    firstJobReadError,
    indexingAssumption: "1-based",
  });
}

function serializeJob(job: JuvraJob | null): SerializedJob | null {
  if (!job) {
    return null;
  }

  return {
    id: job.id.toString(),
    client: job.client,
    freelancer: job.freelancer,
    title: job.title,
    category: job.category,
    descriptionURI: job.descriptionURI,
    submissionURI: job.submissionURI,
    amount: job.amount.toString(),
    createdAt: job.createdAt,
    deadline: job.deadline,
    status: job.status,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
