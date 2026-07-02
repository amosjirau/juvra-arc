import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { EditorialHeader, EditorialShell } from "@/components/shell/EditorialShell";

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
    <EditorialShell>
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        href="/"
      >
        <ArrowLeft className="size-4" />
        Back to Juvra
      </Link>

      <div className="mt-6">
        <EditorialHeader description={description} eyebrow={eyebrow} title={title} />
      </div>

      <div className="mt-10 grid gap-4">
        {sections.map((section) => (
          <div
            className="rounded-2xl border border-line bg-paper-raised p-6"
            key={section.title}
          >
            <h2 className="font-serif text-xl text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{section.body}</p>
          </div>
        ))}
      </div>
    </EditorialShell>
  );
}
