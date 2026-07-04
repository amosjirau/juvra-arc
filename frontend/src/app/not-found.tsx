import { ArrowLeft, BriefcaseBusiness, Compass } from "lucide-react";
import Link from "next/link";

import { EditorialShell } from "@/components/shell/EditorialShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-paper-raised p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.06] text-accent-purple">
          <Compass className="size-7" />
        </div>
        <p className="mt-6 font-mono text-sm text-ink-soft">Error 404</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Head back to the marketplace
          to find escrow-backed work.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/jobs">
              <BriefcaseBusiness className="size-4" />
              Browse jobs
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </EditorialShell>
  );
}
