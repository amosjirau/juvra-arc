"use client";

import Link from "next/link";

type FooterLink = { href: string; label: string; external?: boolean };

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/jobs", label: "Jobs" },
      { href: "/post", label: "Post a Job" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "About" },
      { href: "/docs", label: "Docs" },
      { href: "https://testnet.arcscan.app", label: "Arcscan", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

function FooterAnchor({ href, label, external }: FooterLink) {
  const className =
    "text-sm text-[#8892a4] transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none";
  if (external) {
    return (
      <a className={className} href={href} rel="noreferrer" target="_blank">
        {label}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#060816]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10b981]/40 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#10b981] to-[#34d399]">
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-sm font-semibold text-[#060816]"
                >
                  J
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-display)" }} className="text-lg text-white">
                Juvra
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#8892a4]">
              The settlement layer for freelance commerce - onchain escrow that protects clients and
              freelancers from the first deposit to final release.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-[#93c5fd]">
              <span className="size-1.5 rounded-full bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.72)]" />
              Live on Arc Testnet
            </span>
          </div>

          {groups.map((group) => (
            <nav key={group.title} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {group.title}
              </p>
              {group.links.map((link) => (
                <FooterAnchor key={link.label} {...link} />
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-[#8892a4] sm:flex-row">
          <p>© 2026 Juvra. Built on Arc Protocol.</p>
          <p>Onchain escrow · Native USDC settlement</p>
        </div>
      </div>
    </footer>
  );
}
