"use client";

import { usePathname } from "next/navigation";

import { Navbar as AppNavbar } from "@/components/figma/Navbar";

// Routes on the warm editorial system render their own light nav (via
// EditorialShell / SiteLanding), so the global dark app nav is suppressed there.
// The whole app is now editorial, so this covers every route; the dark app nav
// is kept only as a fallback for any route not listed.
const EDITORIAL_ROUTES = new Set([
  "/",
  "/jobs",
  "/post",
  "/how-it-works",
  "/agent-treasury",
  "/dashboard",
  "/admin",
  "/about",
  "/docs",
  "/privacy",
  "/terms",
]);

function isEditorialRoute(pathname: string): boolean {
  if (EDITORIAL_ROUTES.has(pathname)) {
    return true;
  }
  // Job workspace (/jobs/[id]) and any admin subpage.
  return pathname.startsWith("/jobs/") || pathname.startsWith("/admin");
}

export function Navbar() {
  const pathname = usePathname();

  if (isEditorialRoute(pathname)) {
    return null;
  }

  return <AppNavbar />;
}
