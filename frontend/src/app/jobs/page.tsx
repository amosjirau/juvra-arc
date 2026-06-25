"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { TrendingJobs } from "@/components/trending-jobs";
import { CTAButton } from "@/components/ui/cta-button";

export default function JobsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Escrow-backed marketplace"
        eyebrowIcon={BriefcaseBusiness}
        title="Browse jobs on Arc"
        description="Every job is funded into onchain escrow before a freelancer is selected, so payment is guaranteed the moment work is approved. Newest opportunities appear first."
        actions={
          <CTAButton asChild>
            <Link href="/post">
              <Plus className="size-4" />
              Post a Job
            </Link>
          </CTAButton>
        }
      />
      <div className="mt-10">
        <TrendingJobs showSearch />
      </div>
    </AppShell>
  );
}
