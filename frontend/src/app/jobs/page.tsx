import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";

import { TrendingJobs } from "@/components/trending-jobs";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  return (
    <main className="min-h-screen text-white">
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_15%_20%,rgba(217,70,239,0.18),transparent_24rem),radial-gradient(circle_at_90%_0%,rgba(99,102,241,0.18),transparent_22rem)]" />
        <div className="premium-panel p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="eyebrow mb-4">
                <BriefcaseBusiness className="size-4" />
                Escrow-backed marketplace
              </div>
              <h1 className="font-display heading-gradient text-4xl font-semibold tracking-normal sm:text-5xl">
                Trending Jobs on Arc
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                Browse escrow-backed freelance work funded on Arc. Newest jobs appear
                first so active opportunities stay easy to scan.
              </p>
            </div>
            <Button
              asChild
              className="h-11 px-4"
            >
              <Link href="/post">
                <Plus className="size-4" />
                Post a Job
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <TrendingJobs showSearch />
    </main>
  );
}
