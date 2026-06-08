import { BriefcaseBusiness } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/15 backdrop-blur">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 shadow-lg shadow-emerald-950/20">
        <BriefcaseBusiness className="size-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
