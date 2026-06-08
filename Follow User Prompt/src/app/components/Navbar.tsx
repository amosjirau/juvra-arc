import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Wallet, ChevronDown } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Jobs", href: "#jobs", section: "jobs" },
    { label: "Post a Job", href: "#post", section: "post" },
    { label: "Dashboard", href: "#dashboard", section: "dashboard" },
    { label: "About", href: "#about", section: "about" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-500 ${
        scrolled
          ? "bg-[#060816]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-[#060816]/40 backdrop-blur-md border border-white/5"
      } rounded-2xl px-6 py-3`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF7A18] to-[#FF9A4A] flex items-center justify-center shadow-[0_0_16px_rgba(255,122,24,0.4)] group-hover:shadow-[0_0_24px_rgba(255,122,24,0.6)] transition-shadow duration-300">
            <span style={{ fontFamily: "Instrument Serif, serif" }} className="text-[#060816] text-sm font-semibold">J</span>
          </div>
          <span style={{ fontFamily: "Instrument Serif, serif" }} className="text-white text-lg tracking-tight">Juvra</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveSection(link.section)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                activeSection === link.section
                  ? "text-white bg-white/10"
                  : "text-[#8892a4] hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              walletConnected
                ? "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30 hover:bg-[#FF7A18]/25"
                : "bg-white/5 text-[#8892a4] border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Wallet size={14} />
            {walletConnected ? (
              <span className="font-mono text-xs">0x4f...3a7b</span>
            ) : (
              "Connect Wallet"
            )}
          </button>
          <a
            href="#jobs"
            className="px-4 py-2 rounded-xl text-sm bg-[#FF7A18] text-[#060816] hover:bg-[#FF9A4A] transition-colors duration-200 shadow-[0_4px_16px_rgba(255,122,24,0.3)] hover:shadow-[0_4px_24px_rgba(255,122,24,0.5)]"
          >
            Launch App
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#8892a4] hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-4 pb-2 border-t border-white/10 pt-4 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => { setActiveSection(link.section); setMobileOpen(false); }}
                className="px-4 py-2.5 rounded-lg text-sm text-[#8892a4] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => setWalletConnected(!walletConnected)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
                  walletConnected
                    ? "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                    : "bg-white/5 text-[#8892a4] border border-white/10"
                }`}
              >
                <Wallet size={14} />
                {walletConnected ? "0x4f...3a7b" : "Connect Wallet"}
              </button>
              <a
                href="#jobs"
                className="px-4 py-2.5 rounded-xl text-sm bg-[#FF7A18] text-[#060816] text-center"
              >
                Launch App
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
