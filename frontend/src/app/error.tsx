"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { EditorialShell } from "@/components/shell/EditorialShell";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-paper-raised p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-500/[0.06] text-rose-700">
          <RefreshCw className="size-7" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
          An unexpected error interrupted this page. Your wallet and on-chain escrow are unaffected —
          you can retry or return home.
        </p>
        {error?.digest ? (
          <p className="mt-3 font-mono text-xs text-ink-faint">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()} type="button">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </EditorialShell>
  );
}
