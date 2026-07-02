"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";
import { TrendingJobs } from "@/components/trending-jobs";

export default function JobsPage() {
  return (
    <EditorialShell>
      <EditorialHeader
        actions={
          <Link
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5"
            href="/post"
          >
            Post a job
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        }
        description="Every job is funded into on-chain escrow before a freelancer is selected, so payment is guaranteed the moment work is approved."
        eyebrow="Escrow-backed marketplace"
        title="Browse jobs on Arc"
      />
      <div className="mt-12">
        <TrendingJobs showSearch />
      </div>
    </EditorialShell>
  );
}
