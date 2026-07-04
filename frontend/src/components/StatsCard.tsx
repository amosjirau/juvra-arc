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
              ? "border-emerald-600/25 bg-emerald-500/[0.06] text-emerald-700 "
              : "border-accent-purple/25 bg-accent-purple/[0.06] text-accent-purple ",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
