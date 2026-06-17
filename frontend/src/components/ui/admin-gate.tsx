"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import type { ReactNode } from "react";

import { CTAButton } from "@/components/ui/cta-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAdminAccess } from "@/hooks/use-admin-access";

/**
 * Gates admin-only UI behind the existing wallet/arbitrator check
 * (`useAdminAccess`). Renders a premium restricted screen for non-admins —
 * it never exposes the children to unauthorized wallets.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, isConnected, arbitratorQuery } = useAdminAccess();

  if (isAdmin) {
    return <>{children}</>;
  }

  const checking = isConnected && arbitratorQuery.isLoading;

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center">
      <GlassCard className="w-full p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#10b981]/25 bg-[#10b981]/10 text-[#34d399]">
          {checking ? (
            <Loader2 className="size-6 animate-spin" />
          ) : isConnected ? (
            <ShieldAlert className="size-6" />
          ) : (
            <Wallet className="size-6" />
          )}
        </div>

        <h1 className="mt-6 text-xl font-semibold text-white">
          {checking
            ? "Verifying admin access…"
            : isConnected
              ? "Restricted area"
              : "Admin access required"}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          {checking
            ? "Confirming your wallet against the on-chain arbitrator address."
            : isConnected
              ? "This wallet isn't the Juvra arbitrator. Dispute resolution and admin controls are limited to the arbitrator account."
              : "Connect the arbitrator wallet to access dispute resolution and system controls."}
        </p>

        {!isConnected && !checking ? (
          <div className="mt-6 flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => (
                <CTAButton
                  type="button"
                  onClick={openConnectModal}
                  disabled={!mounted}
                >
                  <Wallet className="size-4" />
                  Connect wallet
                </CTAButton>
              )}
            </ConnectButton.Custom>
          </div>
        ) : null}

        {isConnected && !checking ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-400">
            <ShieldCheck className="size-3.5 text-emerald-300" />
            Gating verified on-chain via the escrow arbitrator
          </p>
        ) : null}
      </GlassCard>
    </div>
  );
}
