import Link from "next/link";

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
    <main className="min-h-screen bg-[#060816] px-6 pb-20 pt-36 text-white lg:px-8">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#8892a4] transition-colors hover:border-white/20 hover:text-white"
        >
          Back to Juvra
        </Link>
        <div className="rounded-3xl border border-white/10 bg-[#0b1020] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-10">
          <p className="mb-4 text-xs uppercase tracking-widest text-[#FF7A18]">{eyebrow}</p>
          <h1 className="mb-5 text-4xl text-white md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#8892a4]">{description}</p>

          <div className="mt-10 grid gap-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <h2 className="mb-2 text-base font-semibold text-white">{section.title}</h2>
                <p className="text-sm leading-relaxed text-[#8892a4]">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
