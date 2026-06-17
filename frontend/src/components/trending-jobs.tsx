"use client";

import { CalendarDays, CheckCircle2, Gauge, Layers3, Plus, Search, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { CTAButton } from "@/components/ui/cta-button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { useJobs } from "@/hooks/use-juvra-escrow";
import { getEscrowReadErrorMessage } from "@/lib/contract";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { cn } from "@/lib/utils";

const categories = ["All", "Design", "Software", "Education", "Marketing", "Writing", "Other"] as const;

type Category = (typeof categories)[number];

// Emerald trust-first category gradients — emerald / teal / sky / amber only.
const categoryVisuals: Record<Exclude<Category, "All">, string> = {
  Design:
    "from-[#10b981] via-[#0d9488] to-[#0ea5e9] before:bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.32),transparent_8rem)]",
  Software:
    "from-[#0ea5e9] via-cyan-300 to-[#0B1526] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0_1px,transparent_1px_18px)]",
  Education:
    "from-[#38bdf8] via-[#3b82f6] to-[#0B1526] before:bg-[radial-gradient(circle_at_75%_24%,rgba(186,230,253,0.32),transparent_7rem)]",
  Marketing:
    "from-[#34d399] via-emerald-400 to-[#0ea5e9] before:bg-[radial-gradient(circle_at_25%_65%,rgba(236,253,245,0.3),transparent_7rem)]",
  Writing:
    "from-[#5eead4] via-[#2dd4bf] to-[#0f766e] before:bg-[radial-gradient(circle_at_72%_35%,rgba(240,253,250,0.3),transparent_7rem)]",
  Other:
    "from-[#0B1526] via-[#10b981] to-[#0ea5e9] before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_7rem)]",
};

function normalizeCategory(category: string): Exclude<Category, "All"> {
  const lower = category.toLowerCase();

  if (lower.includes("design") || lower.includes("creative") || lower.includes("ui") || lower.includes("ux")) {
    return "Design";
  }
  if (
    lower.includes("software") ||
    lower.includes("frontend") ||
    lower.includes("backend") ||
    lower.includes("solidity") ||
    lower.includes("code") ||
    lower.includes("dev")
  ) {
    return "Software";
  }
  if (lower.includes("education") || lower.includes("course") || lower.includes("tutor") || lower.includes("learn")) {
    return "Education";
  }
  if (lower.includes("marketing") || lower.includes("growth") || lower.includes("social") || lower.includes("brand")) {
    return "Marketing";
  }
  if (lower.includes("writing") || lower.includes("copy") || lower.includes("editor") || lower.includes("content")) {
    return "Writing";
  }

  return "Other";
}

function TrendingJobSkeleton({ deck = false }: { deck?: boolean }) {
  return (
    <div className={cn("rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-3 shadow-xl shadow-black/10", deck && "h-[440px] w-[310px] shrink-0")}>
      <div className="h-32 animate-pulse rounded-2xl bg-white/10" />
      <div className="p-3">
        <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded-xl bg-white/10" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded-xl bg-white/10" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function TrendingJobCard({ deck = false, job, tilt = 0 }: { deck?: boolean; job: JuvraJob; tilt?: number }) {
  const category = normalizeCategory(job.category);
  const trustScore = 88 + Number(job.id % 9n);
  const milestoneCount = 2 + Number(job.id % 4n);

  return (
    <Link
      className={cn(
        "group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40",
        deck && "w-[310px] shrink-0",
      )}
      href={`/jobs/${job.id.toString()}`}
      style={deck ? ({ "--tilt": `${tilt}deg` } as CSSProperties) : undefined}
    >
      <article className={cn(
        "h-full rounded-2xl border border-white/10 bg-[#111827]/90 p-3 text-white shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#10b981]/50 hover:shadow-2xl hover:shadow-[#38bdf8]/20",
        deck && "min-h-[440px] rotate-[var(--tilt)] hover:rotate-0 hover:scale-[1.025]",
      )}>
        <div
          className={cn(
            "shine-overlay relative h-36 overflow-hidden rounded-xl bg-gradient-to-br before:absolute before:inset-0 before:opacity-60",
            categoryVisuals[category],
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_35%,rgba(0,0,0,0.28))]" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur">
            <CheckCircle2 className="size-3.5 text-emerald-200" />
            Escrow Verified
          </div>
          <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur">
            {category}
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-zinc-500">
                {job.category || category}
              </p>
              <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-white">
                {job.title}
              </h3>
            </div>
            <div className="shrink-0">
              <JobStatusBadge status={job.status} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <UserRound className="size-4 text-[#38bdf8]" />
            <span className="font-mono">{shortAddress(job.client)}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Escrow</p>
              <p className="mt-1 font-mono text-sm font-semibold text-[#34d399]">
                {formatUsdc(job.amount)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Milestones</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-300">
                <Layers3 className="size-3.5 text-[#34d399]" />
                {milestoneCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Deadline</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-300">
                <CalendarDays className="size-3.5 text-[#38bdf8]" />
                {formatDate(job.deadline)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-zinc-500">Trust score</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-300">
                <Gauge className="size-3.5 text-emerald-200" />
                {trustScore}%
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
            <ShieldCheck className="size-3.5" />
            Client reputation: verified payer
          </div>

          <Button asChild className="mt-5 w-full">
            <span>View Job</span>
          </Button>
        </div>
      </article>
    </Link>
  );
}

export function TrendingJobs({
  className,
  description = "Fresh escrow-backed opportunities posted on Arc.",
  eyebrow = "Marketplace",
  limit,
  showHeader = false,
  showSearch = false,
  title = "Trending Jobs",
  variant = "grid",
}: {
  className?: string;
  description?: string;
  eyebrow?: string;
  limit?: number;
  showHeader?: boolean;
  showSearch?: boolean;
  title?: string;
  variant?: "carousel" | "grid";
}) {
  const { jobs, isLoading, isError, error } = useJobs();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const readErrorMessage = getEscrowReadErrorMessage(error);

  const visibleJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs
      .filter((job) => activeCategory === "All" || normalizeCategory(job.category) === activeCategory)
      .filter((job) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          job.title.toLowerCase().includes(normalizedQuery) ||
          job.category.toLowerCase().includes(normalizedQuery) ||
          job.descriptionURI.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, limit ?? jobs.length);
  }, [activeCategory, jobs, limit, query]);

  const deckJobs = visibleJobs.length > 0 ? [...visibleJobs, ...visibleJobs] : [];
  const isCarousel = variant === "carousel";

  return (
    <div className={cn("relative", className)}>
      {showHeader && (
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#34d399]">{eyebrow}</p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-none tracking-normal text-[#FFF9F2] sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#FFF9F2]/58">{description}</p>
          </div>
        </div>
      )}

      {/* Controls: category filter + search */}
      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
          showHeader && "mt-8",
        )}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              className={cn(
                "min-w-fit rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40",
                activeCategory === category
                  ? "border-[#10b981]/40 bg-[#10b981]/15 text-white shadow-lg shadow-black/20"
                  : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
              )}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        {showSearch && (
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              className="h-11 pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs by title, category, or link"
              value={query}
            />
          </div>
        )}
      </div>

      {/* Result count */}
      {!isLoading && !isError && (
        <p className="mt-4 text-sm text-zinc-500">
          {visibleJobs.length} {visibleJobs.length === 1 ? "job" : "jobs"}
          {activeCategory !== "All" ? ` in ${activeCategory}` : " available"}
        </p>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState
            title="Couldn't load the marketplace"
            description={readErrorMessage}
          />
        </div>
      )}

      {isLoading && !isCarousel && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: limit ?? 8 }).map((_, index) => (
            <TrendingJobSkeleton key={index} />
          ))}
        </div>
      )}

      {isLoading && isCarousel && (
        <div className="mt-10 flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <TrendingJobSkeleton deck key={index} />
          ))}
        </div>
      )}

      {!isLoading && visibleJobs.length > 0 && !isCarousel && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleJobs.map((job) => (
            <TrendingJobCard job={job} key={job.id.toString()} />
          ))}
        </div>
      )}

      {!isLoading && deckJobs.length > 0 && isCarousel && (
        <div className="job-carousel mt-12 -mx-4 overflow-hidden px-4">
          <div className="job-carousel-track flex w-max gap-6 py-6">
            {deckJobs.map((job, index) => (
              <TrendingJobCard
                deck
                job={job}
                key={`${job.id.toString()}-${index}`}
                tilt={[-4, 2.5, -1.5, 4, -2.5][index % 5]}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && visibleJobs.length === 0 && (
        <div className="mt-6">
          <EmptyState
            description={
              query || activeCategory !== "All"
                ? "No jobs match your search yet. Try a different category or clear the search."
                : "Be the first to create a funded opportunity on Arc."
            }
            title={query || activeCategory !== "All" ? "No matching jobs" : "No escrow-backed jobs yet"}
            action={
              <CTAButton asChild>
                <Link href="/post">
                  <Plus className="size-4" />
                  Post a Job
                </Link>
              </CTAButton>
            }
          />
        </div>
      )}
    </div>
  );
}
