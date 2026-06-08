"use client";

import { useEffect, useRef } from "react";

export function useTransactionSuccess(
  hash: `0x${string}` | undefined,
  isSuccess: boolean,
  onSuccess?: () => void,
) {
  const handledHash = useRef<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (!hash || !isSuccess || handledHash.current === hash) {
      return;
    }

    handledHash.current = hash;
    onSuccess?.();
  }, [hash, isSuccess, onSuccess]);
}
