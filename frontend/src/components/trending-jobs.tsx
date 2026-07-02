"use client";

import { ArrowUpRight, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { CTAButton } from "@/components/ui/cta-button";
import { ErrorState } from "@/components/ui/error-state";
import { useJobs } from "@/hooks/use-juvra-escrow";
import { getEscrowReadErrorMessage } from "@/lib/contract";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
import { getStatusLabel } from "@/lib/job-status";
import type { JuvraJob } from "@/lib/juvraEscrow";
import { cn } from "@/lib/utils";

const categories = ["All", "Design", "Software", "Education", "Marketing", "Writing", "Other"] as const;

type Category = (typeof categories)[number];

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

// A job is "closed" once terminal (approved / refunded / cancelled).
const CLOSED_STATUSES = new Set([3, 5, 6]);

function isJobClosed(status: number): boolean {
  return CLOSED_STATUSES.has(status);
}

function JobField({ accent, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className={cn("mt-1 text-sm text-ink", accent && "font-serif text-lg")}>{value}</p>
    </div>
  );
}

function JobCard({ job }: { job: JuvraJob }) {
  const category = normalizeCategory(job.category);
  const closed = isJobClosed(job.status);

  return (
    <Link className="group block h-full" href={`/jobs/${job.id.toString()}`}>
      <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-raised p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_28px_60px_-42px_rgba(28,25,23,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
            {job.category || category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className={cn(
                "size-1.5 rounded-full",
                closed ? "bg-ink-faint" : "bg-accent-purple",
              )}
            />
            {getStatusLabel(job.status)}
          </span>
        </div>

        <h3 className="mt-5 line-clamp-2 font-serif text-2xl leading-snug tracking-[-0.01em] text-ink">
          {job.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
          <UserRound className="size-4" />
          <span className="font-mono">{shortAddress(job.client)}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
          <JobField accent label="Escrow" value={formatUsdc(job.amount)} />
          <JobField label="Deadline" value={formatDate(job.deadline)} />
          <JobField label="Posted" value={formatDate(job.createdAt)} />
          <JobField label="Status" value={getStatusLabel(job.status)} />
        </div>

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          View job
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </article>
    </Link>
  );
}

function JobCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6">
      <div className="h-3 w-24 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-5 h-7 w-3/4 animate-pulse rounded-lg bg-ink/10" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-ink/10" />
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
        <div className="h-10 animate-pulse rounded-lg bg-ink/10" />
        <div className="h-10 animate-pulse rounded-lg bg-ink/10" />
      </div>
    </div>
  );
}

function SectionHeading({ count, label, tone }: { count: number; label: string; tone: "open" | "closed" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("size-2 rounded-full", tone === "open" ? "bg-accent-orange" : "bg-ink-faint")} />
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">{label}</h3>
      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-soft">{count}</span>
    </div>
  );
}

export function TrendingJobs({ showSearch = false }: { showSearch?: boolean }) {
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
      });
  }, [activeCategory, jobs, query]);

  const { closedJobs, openJobs } = useMemo(() => {
    const open: JuvraJob[] = [];
    const closed: JuvraJob[] = [];

    for (const job of visibleJobs) {
      (isJobClosed(job.status) ? closed : open).push(job);
    }

    return { closedJobs: closed, openJobs: open };
  }, [visibleJobs]);

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              className={cn(
                "min-w-fit rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === category
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink/30 hover:text-ink",
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
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              className="h-11 w-full rounded-full border border-line bg-paper-raised pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs by title, category, or link"
              value={query}
            />
          </div>
        )}
      </div>

      {!isLoading && !isError && (
        <p className="mt-5 text-sm text-ink-soft">
          <span className="text-ink">{openJobs.length} open</span>
          {" · "}
          {closedJobs.length} closed
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        </p>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState title="Couldn't load the marketplace" description={readErrorMessage} />
        </div>
      )}

      {isLoading && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && visibleJobs.length > 0 && (
        <div className="mt-6 space-y-12">
          {openJobs.length > 0 && (
            <section>
              <SectionHeading count={openJobs.length} label="Open jobs" tone="open" />
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {openJobs.map((job) => (
                  <JobCard job={job} key={job.id.toString()} />
                ))}
              </div>
            </section>
          )}

          {closedJobs.length > 0 && (
            <section>
              <SectionHeading count={closedJobs.length} label="Closed jobs" tone="closed" />
              <div className="mt-5 grid gap-5 opacity-70 transition-opacity hover:opacity-100 sm:grid-cols-2 lg:grid-cols-3">
                {closedJobs.map((job) => (
                  <JobCard job={job} key={job.id.toString()} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!isLoading && !isError && visibleJobs.length === 0 && (
        <div className="mt-6">
          <EmptyState
            action={
              <CTAButton asChild>
                <Link href="/post">
                  <Plus className="size-4" />
                  Post a Job
                </Link>
              </CTAButton>
            }
            description={
              query || activeCategory !== "All"
                ? "No jobs match your search yet. Try a different category or clear the search."
                : "Be the first to create a funded opportunity on Arc."
            }
            title={query || activeCategory !== "All" ? "No matching jobs" : "No escrow-backed jobs yet"}
          />
        </div>
      )}
    </div>
  );
}
