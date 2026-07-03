"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { CTAButton } from "@/components/ui/cta-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

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
    <AppShell contentClassName="max-w-2xl" showFooter={false}>
      <GlassCard className="p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-300/40 bg-rose-500/[0.06] text-rose-700">
          <RefreshCw className="size-7" />
        </div>
        <h1 className="mt-6 text-display-2 font-semibold text-white">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-400">
          An unexpected error interrupted this page. Your wallet and on-chain escrow are unaffected  - 
          you can retry or return home.
        </p>
        {error?.digest ? (
          <p className="mt-3 font-mono text-xs text-zinc-600">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTAButton type="button" onClick={() => reset()}>
            <RefreshCw className="size-4" />
            Try again
          </CTAButton>
          <GlowButton asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back home
            </Link>
          </GlowButton>
        </div>
      </GlassCard>
    </AppShell>
  );
}
