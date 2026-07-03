"use client";

import { usePathname } from "next/navigation";

import { Navbar as AppNavbar } from "@/components/figma/Navbar";

// Routes on the warm editorial system render their own light nav (via
// EditorialShell / SiteLanding), so the global dark app nav is suppressed there.
// Routes not yet migrated keep the dark app nav.
const EDITORIAL_ROUTES = new Set([
  "/",
  "/jobs",
  "/post",
  "/how-it-works",
  "/agent-treasury",
  "/about",
  "/docs",
  "/privacy",
  "/terms",
]);

export function Navbar() {
  const pathname = usePathname();

  if (EDITORIAL_ROUTES.has(pathname)) {
    return null;
  }

  return <AppNavbar />;
}
