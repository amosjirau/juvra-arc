"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  ListChecks,
  Menu,
  ShieldCheck,
  SquarePen,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { useAdminAccess } from "@/hooks/use-admin-access";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  section: string;
};

const testnetTooltip =
  "Juvra is currently operating on Arc Testnet while agentic escrow workflows are being finalized.";

function TestnetBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/10 font-medium text-[#93c5fd]",
        compact ? "px-3 py-2 text-xs" : "hidden px-3 py-1.5 text-[11px] uppercase tracking-widest xl:inline-flex",
      )}
      title={testnetTooltip}
    >
      <span className="size-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.72)]" />
      Live on Arc Testnet
    </span>
  );
}

function WalletButton({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            aria-hidden={!ready}
            className={cn("transition-opacity duration-200", !ready && "pointer-events-none opacity-0")}
          >
            {!connected ? (
              <button
                className="flex h-11 items-center gap-2 rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-[#22C55E] to-[#16A34A] px-4 text-sm font-semibold text-[#04110a] shadow-[0_12px_32px_rgba(22,163,74,0.22)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_38px_rgba(22,163,74,0.28)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-300/40 sm:h-[46px] sm:px-5"
                onClick={openConnectModal}
                type="button"
              >
                <Wallet className="size-4" />
                <span>{compact ? "Connect" : "Connect Wallet"}</span>
              </button>
            ) : chain.unsupported ? (
              <button
                className="flex h-11 items-center gap-2 rounded-2xl border border-rose-300/24 bg-rose-300/12 px-4 text-sm font-semibold text-rose-100 transition-all duration-200 hover:-translate-y-px hover:bg-rose-300/18 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-rose-300/40 sm:h-[46px]"
                onClick={openChainModal}
                type="button"
              >
                <AlertTriangle className="size-4" />
                Wrong Network
              </button>
            ) : (
              <button
                className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-3.5 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-px hover:border-white/16 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/25 sm:h-[46px] sm:px-4"
                onClick={openAccountModal}
                type="button"
              >
                <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.72)]" />
                <span className="font-mono text-xs">{account.displayName}</span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useAdminAccess();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSection = useMemo(() => {
    if (pathname === "/jobs" || pathname.startsWith("/jobs/") || pathname.startsWith("/job/")) {
      return "jobs";
    }
    if (pathname === "/post" || pathname === "/post-job") {
      return "post";
    }
    if (pathname === "/dashboard") {
      return "dashboard";
    }
    if (pathname.startsWith("/admin")) {
      return "admin";
    }
    return "how";
  }, [pathname]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: "/#how-it-works", icon: ListChecks, label: "How It Works", section: "how" },
      { href: "/jobs", icon: BriefcaseBusiness, label: "Jobs", section: "jobs" },
      { href: "/post", icon: SquarePen, label: "Post a Job", section: "post" },
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
      ...(isAdmin
        ? [{ href: "/admin", icon: ShieldCheck, label: "Admin", section: "admin" }]
        : []),
    ],
    [isAdmin],
  );

  return (
    <header className="fixed left-1/2 top-3 z-[90] w-[calc(100%-24px)] max-w-[1520px] -translate-x-1/2 sm:top-4 sm:w-[calc(100%-48px)]">
      <div
        className="grid h-[68px] grid-cols-[1fr_auto] items-center gap-2 rounded-full border border-white/[0.09] px-3 shadow-[0_18px_60px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[24px] backdrop-saturate-[1.35] sm:h-20 sm:px-6 lg:grid-cols-[1fr_auto_1fr]"
        style={{ background: "rgba(10, 13, 24, 0.72)" }}
      >
        <div className="flex min-w-0 items-center gap-3 justify-self-start">
          <Link
            className="group flex min-w-0 items-center gap-3.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            href="/"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-gradient-to-br from-[#1E293B] via-[#312E81] to-[#0A0D18] text-base font-bold text-slate-50 shadow-[0_14px_34px_rgba(49,46,129,0.26)] transition-all duration-200 group-hover:-translate-y-px group-hover:shadow-[0_18px_42px_rgba(49,46,129,0.32)]">
              J
            </div>
            <div className="min-w-0 font-ui">
              <p className="text-[17px] font-bold leading-tight text-slate-50">Juvra</p>
              <p className="hidden text-xs font-medium leading-tight text-slate-500 sm:block">
                Settlement layer
              </p>
            </div>
          </Link>
          <TestnetBadge />
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.045] p-1.5 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.section;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-[7px] rounded-full px-3 text-sm font-medium text-slate-50/60 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-white/[0.075] hover:text-slate-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 xl:px-[18px]",
                  active &&
                    "bg-white/[0.13] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.18)]",
                )}
                href={item.href}
                key={item.label}
              >
                <Icon className="size-4" />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">
                  {item.label === "How It Works" ? "How" : item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <div className="sm:hidden">
            <WalletButton compact />
          </div>
          <button
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0D18]/94 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-[24px] md:hidden"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-2 pb-2">
              <TestnetBadge compact />
            </div>
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.section;

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.075] hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                      active && "bg-white/[0.13] text-slate-50",
                    )}
                    href={item.href}
                    key={item.label}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
