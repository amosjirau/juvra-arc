import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
};

export function InfoPage({ description, eyebrow, sections, title }: InfoPageProps) {
  return (
    <AppShell contentClassName="max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" />
        Back to Juvra
      </Link>

      <div className="mt-6">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
      </div>

      <div className="mt-10 grid gap-4">
        {sections.map((section) => (
          <GlassCard key={section.title} className="scroll-reveal p-6">
            <h2 className="font-heading text-base font-semibold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{section.body}</p>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  );
}
