"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { useAccount } from "wagmi";

import { useAdminAccess } from "@/hooks/use-admin-access";
import { shortAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Shared warm off-white editorial chrome (nav + canvas + footer), built on the
 * design tokens (paper / ink / line / accent). App pages adopt this to match
 * the landing so the whole product reads as one continuous piece.
 */

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/jobs", label: "Jobs" },
  { href: "/agent-treasury", label: "Agent" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      ref={ref}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ConnectPill() {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();

  return (
    <button
      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
      onClick={() => (isConnected ? openAccountModal?.() : openConnectModal?.())}
      type="button"
    >
      {isConnected && address ? shortAddress(address) : "Connect wallet"}
    </button>
  );
}

function EditorialNav() {
  const pathname = usePathname();
  const { isAdmin, isConnected } = useAdminAccess();

  const links =
    isConnected && isAdmin
      ? [...NAV_LINKS, { href: "/admin", label: "Admin" }]
      : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link className="font-serif text-xl tracking-tight text-ink" href="/">
          Juvra
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              className={cn(
                "text-sm transition-colors duration-200 hover:text-ink",
                (link.href === "/admin"
                  ? pathname.startsWith("/admin")
                  : pathname === link.href)
                  ? "text-ink"
                  : "text-ink-soft",
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ConnectPill />
      </div>
    </header>
  );
}

function EditorialFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-6xl px-6 py-14 sm:px-8">
      <div className="flex flex-col justify-between gap-6 border-t border-line pt-8 text-xs text-ink-soft sm:flex-row">
        <span>Juvra · The settlement layer for freelance commerce</span>
        <span className="font-mono">Arc Testnet · escrow 0x29e0…3b9a</span>
      </div>
    </footer>
  );
}

/**
 * Editorial page header: small eyebrow, large serif title, muted description,
 * optional actions slot — the light-canvas counterpart to the app PageHeader.
 */
export function EditorialHeader({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-ink-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </Reveal>
  );
}

export function EditorialShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <EditorialNav />
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-16 sm:px-8 sm:pt-20"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>
      {showFooter ? <EditorialFooter /> : null}
    </div>
  );
}
