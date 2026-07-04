"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useAccount } from "wagmi";

import { useAdminAccess } from "@/hooks/use-admin-access";
import { shortAddress } from "@/lib/format";

/**
 * Warm off-white, editorial landing — restrained "auwa" design grammar.
 * Self-contained light theme (does not depend on the app's dark globals).
 * Single accent (purple / orange); typography does the heavy lifting.
 */

const PAPER = "#F6F3EC";
const INK = "#1C1917";
const INK_SOFT = "#6B655C";
const LINE = "rgba(28,25,23,0.12)";
const PURPLE = "#B46CFF";
const ORANGE = "#FF7A18";

const serif: CSSProperties = { fontFamily: "var(--font-fraunces)" };

function Reveal({
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
      initial={{ opacity: 0, y: 26 }}
      ref={ref}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
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
      className="rounded-full px-4 py-2 text-sm font-medium text-[#F6F3EC] transition-transform duration-300 hover:-translate-y-0.5"
      onClick={() => (isConnected ? openAccountModal?.() : openConnectModal?.())}
      style={{ background: INK }}
      type="button"
    >
      {isConnected && address ? shortAddress(address) : "Connect wallet"}
    </button>
  );
}

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/jobs", label: "Jobs" },
  { href: "/agent-treasury", label: "Agent" },
  { href: "/dashboard", label: "Dashboard" },
];

function Nav() {
  const { isAdmin, isConnected } = useAdminAccess();
  const links =
    isConnected && isAdmin
      ? [...NAV_LINKS, { href: "/admin", label: "Admin" }]
      : NAV_LINKS;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(246,243,236,0.72)", borderBottom: `1px solid ${LINE}` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link className="text-xl tracking-tight" href="/" style={{ ...serif, color: INK }}>
          Juvra
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              className="text-sm transition-colors duration-200 hover:text-[#1C1917]"
              href={link.href}
              key={link.href}
              style={{ color: INK_SOFT }}
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

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
      <div className="grid items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p
              className="text-xs font-medium uppercase tracking-[0.24em]"
              style={{ color: INK_SOFT }}
            >
              Escrow-backed freelance commerce · Built on Arc
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1
              className="mt-7 text-5xl leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
              style={{ ...serif, color: INK }}
            >
              Freelance work,{" "}
              <em className="italic" style={{ color: ORANGE }}>
                settled
              </em>{" "}
              with certainty.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p
              className="mt-8 max-w-xl text-lg leading-8"
              style={{ color: INK_SOFT }}
            >
              Every job is funded into on-chain USDC escrow before work begins —
              and released the moment it&apos;s approved. Trust becomes something
              you can read on-chain, not something you hope for.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-[#F6F3EC] transition-transform duration-300 hover:-translate-y-0.5"
                href="/jobs"
                style={{ background: INK }}
              >
                Browse jobs
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 hover:bg-[#1C1917]/[0.04]"
                href="/post"
                style={{ color: INK, border: `1px solid ${LINE}` }}
              >
                Post a job
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.3}>
            <HeroReceipt />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HeroReceipt() {
  return (
    <div
      className="rounded-2xl bg-white/40 p-6 backdrop-blur-sm"
      style={{ border: `1px solid ${LINE}`, boxShadow: "0 24px 60px -40px rgba(28,25,23,0.4)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: INK_SOFT }}
        >
          Live escrow
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: INK_SOFT }}>
          <span className="size-1.5 rounded-full" style={{ background: PURPLE }} />
          Arc Testnet
        </span>
      </div>

      <p className="mt-6 text-sm" style={{ color: INK_SOFT }}>
        Amount in escrow
      </p>
      <p className="mt-1 text-4xl tracking-tight" style={{ ...serif, color: INK }}>
        1,200 <span className="text-lg align-middle">USDC</span>
      </p>

      <div className="mt-6 space-y-3" style={{ borderTop: `1px solid ${LINE}`, paddingTop: "1.25rem" }}>
        {[
          { k: "Client", v: "0x4688…4eD4" },
          { k: "Freelancer", v: "0xE8d0…f9dd" },
          { k: "Status", v: "Funds locked" },
        ].map((row) => (
          <div className="flex items-center justify-between text-sm" key={row.k}>
            <span style={{ color: INK_SOFT }}>{row.k}</span>
            <span className="font-mono" style={{ color: INK }}>
              {row.v}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs" style={{ color: INK_SOFT }}>
        Released only on human-confirmed approval — never by the agent.
      </p>
    </div>
  );
}

type Path = {
  n: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  connect?: boolean;
};

const PATHS: Path[] = [
  {
    n: "01",
    kicker: "Escrow",
    title: "USDC, locked on-chain",
    body: "Funds sit in an Arc smart contract from the moment a job is posted. They move only when work is approved, refunded, or a dispute is resolved — each by a human, with a wallet signature.",
    cta: "See a live contract",
    href: "/jobs",
  },
  {
    n: "02",
    kicker: "Work",
    title: "Funded jobs only",
    body: "Freelancers see the escrow before they apply. No unfunded briefs, no chasing invoices — the money is already there, on-chain, before anyone starts.",
    cta: "Browse open work",
    href: "/jobs",
  },
  {
    n: "03",
    kicker: "Wallet",
    title: "Onboard in one connect",
    body: "Connect a wallet and switch to Arc — that's it. Gas is paid in USDC, so there's no separate token to hold and no bridge to cross before you begin.",
    cta: "Connect a wallet",
    connect: true,
  },
  {
    n: "04",
    kicker: "Agents",
    title: "Verified, then settled",
    body: "Juvra's agents review delivery evidence, run USDC-denominated checks, and settle nanopayments autonomously from their own budget — but escrow always waits for a human.",
    cta: "Meet the agent",
    href: "/agent-treasury",
  },
];

function PathCard({ path }: { path: Path }) {
  const { openConnectModal } = useConnectModal();

  const cta = (
    <span
      className="group/cta mt-8 inline-flex items-center gap-1.5 text-sm font-medium"
      style={{ color: INK }}
    >
      {path.cta}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
    </span>
  );

  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-sm" style={{ color: INK_SOFT }}>
          {path.n}
        </span>
        <span
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: INK_SOFT }}
        >
          {path.kicker}
        </span>
      </div>
      <h3 className="mt-6 text-2xl tracking-[-0.01em]" style={{ ...serif, color: INK }}>
        {path.title}
      </h3>
      <p className="mt-3 text-[0.95rem] leading-7" style={{ color: INK_SOFT }}>
        {path.body}
      </p>
      <div className="mt-auto">{cta}</div>
    </div>
  );

  const cardStyle: CSSProperties = {
    border: `1px solid ${LINE}`,
    background: "rgba(255,255,255,0.35)",
  };
  const cardClass =
    "group block h-full rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:bg-white/60";

  if (path.connect) {
    return (
      <button
        className={cardClass + " text-left"}
        onClick={() => openConnectModal?.()}
        style={cardStyle}
        type="button"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link className={cardClass} href={path.href ?? "/"} style={cardStyle}>
      {inner}
    </Link>
  );
}

function WaysIn() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.24em]" style={{ color: INK_SOFT }}>
          The system
        </p>
        <h2
          className="mt-5 max-w-2xl text-4xl leading-[1.08] tracking-[-0.02em] sm:text-5xl"
          style={{ ...serif, color: INK }}
        >
          Four ways it holds together.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {PATHS.map((path, i) => (
          <Reveal delay={i * 0.06} key={path.n}>
            <PathCard path={path} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function PullQuote() {
  return (
    <section
      className="px-6 py-28 sm:px-8 sm:py-36"
      style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}
    >
      <Reveal className="mx-auto max-w-4xl text-center">
        <span
          className="mx-auto block h-px w-10"
          style={{ background: ORANGE }}
        />
        <p
          className="mt-10 text-3xl leading-[1.25] tracking-[-0.01em] sm:text-4xl lg:text-[2.9rem]"
          style={{ ...serif, color: INK }}
        >
          Escrow you can read on-chain.{" "}
          <span className="italic" style={{ color: INK_SOFT }}>
            Settlement you can trust.
          </span>
        </p>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xl tracking-tight" style={{ ...serif, color: INK }}>
            Juvra
          </p>
          <p className="mt-2 max-w-xs text-sm leading-6" style={{ color: INK_SOFT }}>
            The settlement layer for freelance commerce. USDC-native escrow on Arc.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {[...NAV_LINKS, { href: "/docs", label: "Docs" }].map((link) => (
            <Link
              className="text-sm transition-colors duration-200 hover:text-[#1C1917]"
              href={link.href}
              key={link.href}
              style={{ color: INK_SOFT }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div
        className="mt-10 flex flex-col justify-between gap-3 pt-8 text-xs sm:flex-row"
        style={{ borderTop: `1px solid ${LINE}`, color: INK_SOFT }}
      >
        <span>Arc Testnet · USDC-native settlement</span>
        <span className="font-mono">escrow 0x29e0…3b9a</span>
      </div>
    </footer>
  );
}

export function SiteLanding() {
  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <Nav />
      <main>
        <Hero />
        <WaysIn />
        <PullQuote />
      </main>
      <Footer />
    </div>
  );
}
