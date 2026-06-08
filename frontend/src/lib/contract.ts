import type { Abi, Address } from "viem";
import { isAddress, zeroAddress } from "viem";

import juvraEscrowAbi from "./JuvraEscrow.abi.json";

export const JUVRA_ESCROW_ADDRESS_ENV = "NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS";

const escrowAddress = process.env.NEXT_PUBLIC_JUVRA_ESCROW_ADDRESS;

export const JUVRA_ESCROW_ADDRESS = (escrowAddress ?? zeroAddress) as Address;

export const isJuvraEscrowConfigured =
  typeof escrowAddress === "string" &&
  isAddress(escrowAddress) &&
  escrowAddress !== zeroAddress;

export const JUVRA_ESCROW_ABI = juvraEscrowAbi as Abi;

export const JUVRA_ESCROW_CONFIG_ERROR = `Escrow contract address is missing or invalid. Set ${JUVRA_ESCROW_ADDRESS_ENV} in frontend/.env.local to a valid deployed escrow contract address.`;

export const JUVRA_ESCROW_NO_CODE_ERROR = `No contract code found at ${JUVRA_ESCROW_ADDRESS_ENV} on the configured Arc RPC. Confirm the deployed escrow address and network.`;

export function getEscrowReadErrorMessage(error?: unknown) {
  if (!isJuvraEscrowConfigured) {
    return JUVRA_ESCROW_CONFIG_ERROR;
  }

  const message = getUnknownErrorMessage(error);

  if (
    /returned no data|no data|ContractFunctionZeroDataError|could not decode|0x/i.test(
      message
    )
  ) {
    return JUVRA_ESCROW_NO_CODE_ERROR;
  }

  if (/getJobCount/i.test(message) && /revert|execution reverted/i.test(message)) {
    return "Escrow contract exists, but getJobCount() reverted. Confirm ABI and deployed contract version.";
  }

  if (/getJob/i.test(message) && /revert|execution reverted/i.test(message)) {
    return "Escrow job count loaded, but job details could not be read. Check job indexing or ABI.";
  }

  return "Could not read jobs from the escrow contract. Check the configured Arc RPC, escrow address, and ABI.";
}

function getUnknownErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "";
}
