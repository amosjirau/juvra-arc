import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "green" | "blue";
}) {
  return (
    <Card className="premium-card-hover border-white/10 bg-white/[0.045]">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-white">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border shadow-lg",
            tone === "green"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-emerald-950/20"
              : "border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-sky-950/20",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
