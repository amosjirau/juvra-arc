"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { CTAButton } from "@/components/ui/cta-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAdminAccess } from "@/hooks/use-admin-access";

/**
 * Gates admin-only UI behind the existing wallet/arbitrator check
 * (`useAdminAccess`). Renders an animated restricted screen for non-admins  - 
 * it never exposes the children to unauthorized wallets.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, isConnected, arbitratorQuery } = useAdminAccess();

  if (isAdmin) {
    return <>{children}</>;
  }

  const checking = isConnected && arbitratorQuery.isLoading;
  const Icon = checking ? Loader2 : isConnected ? ShieldAlert : Wallet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-[52vh] max-w-lg flex-col items-center justify-center"
    >
      <GlassCard beam className="w-full p-10 text-center">
        {/* radar/scan halo */}
        <div className="relative mx-auto flex size-20 items-center justify-center">
          <span className="radar-sweep absolute inset-0 overflow-hidden rounded-full opacity-70" />
          <span className="absolute inset-0 rounded-full border border-emerald-600/25" />
          <span className="absolute inset-2 rounded-full border border-emerald-600/25" />
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 16 }}
            className="relative flex size-12 items-center justify-center rounded-2xl border border-[#10b981]/30 bg-[#10b981]/12 text-[#34d399] shadow-lg "
          >
            <Icon className={checking ? "size-6 animate-spin" : "size-6"} />
          </motion.span>
        </div>

        <h1 className="mt-6 text-xl font-semibold text-ink">
          {checking
            ? "Verifying admin access…"
            : isConnected
              ? "Restricted area"
              : "Admin access required"}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-soft">
          {checking
            ? "Confirming your wallet against the on-chain arbitrator address."
            : isConnected
              ? "This wallet isn't the Juvra arbitrator. Dispute resolution and admin controls are limited to the arbitrator account."
              : "Connect the arbitrator wallet to access dispute resolution and system controls."}
        </p>

        {!isConnected && !checking ? (
          <div className="mt-7 flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => (
                <CTAButton type="button" onClick={openConnectModal} disabled={!mounted}>
                  <Wallet className="size-4" />
                  Connect wallet
                </CTAButton>
              )}
            </ConnectButton.Custom>
          </div>
        ) : null}

        {isConnected && !checking ? (
          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.05] px-3 py-1.5 text-xs text-ink-soft">
            <ShieldCheck className="size-3.5 text-emerald-700" />
            Gating verified on-chain via the escrow arbitrator
          </p>
        ) : null}
      </GlassCard>
    </motion.div>
  );
}
