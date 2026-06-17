import { ArrowLeft, BriefcaseBusiness, Compass } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { CTAButton } from "@/components/ui/cta-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

export default function NotFound() {
  return (
    <AppShell contentClassName="max-w-2xl">
      <GlassCard className="p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#10b981]/25 bg-[#10b981]/10 text-[#34d399]">
          <Compass className="size-7" />
        </div>
        <p className="mt-6 font-mono text-sm text-zinc-500">Error 404</p>
        <h1 className="mt-2 text-display-2 font-semibold heading-gradient">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-400">
          The page you're looking for doesn't exist or may have moved. Head back to the marketplace
          to find escrow-backed work.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTAButton asChild>
            <Link href="/jobs">
              <BriefcaseBusiness className="size-4" />
              Browse jobs
            </Link>
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
