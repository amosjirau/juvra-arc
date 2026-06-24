import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/job-status";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Assigned: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Submitted: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  Approved: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
  Disputed: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  Refunded: "border-zinc-300/30 bg-zinc-300/10 text-zinc-200",
  Cancelled: "border-rose-300/40 bg-rose-300/10 text-rose-100",
};

export function JobStatusBadge({ status }: { status: number }) {
  const label = getStatusLabel(status);

  return (
    <Badge className={cn("border", statusStyles[label] ?? statusStyles.Open)}>
      {label}
    </Badge>
  );
}
