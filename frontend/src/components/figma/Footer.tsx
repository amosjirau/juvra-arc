"use client";

import Link from "next/link";

export function Footer() {
  const links = [
    { href: "/jobs", label: "Jobs" },
    { href: "/post", label: "Post a Job" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/#about", label: "About" },
    { href: "/#how-it-works", label: "Docs" },
    { href: "/#about", label: "Privacy" },
    { href: "/#about", label: "Terms" },
  ];

  return (
    <footer className="border-t border-white/8 py-12 bg-[#060816]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF7A18] to-[#FF9A4A] flex items-center justify-center">
              <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060816] text-xs font-semibold">J</span>
            </div>
            <span style={{ fontFamily: "var(--font-display)" }} className="text-white text-base">Juvra</span>
            <span className="text-[#8892a4] text-xs ml-2">The settlement layer for freelance commerce.</span>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-xs text-[#8892a4]">
            {links.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white transition-colors duration-200">{item.label}</Link>
            ))}
          </nav>

          <p className="text-[#8892a4] text-xs">
            © 2026 Juvra. Built on Arc Protocol.
          </p>
        </div>
      </div>
    </footer>
  );
}
