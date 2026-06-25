import { Badge } from "@/components/ui/badge";
import { getStatusLabel, type JobStatus } from "@/lib/job-status";
import { cn } from "@/lib/utils";

const statusClasses: Record<JobStatus, string> = {
  Open: "border-status-open/30 bg-status-open/10 text-status-open",
  Assigned: "border-status-assigned/30 bg-status-assigned/10 text-status-assigned",
  Submitted: "border-status-submitted/30 bg-status-submitted/10 text-status-submitted",
  Approved: "border-status-approved/40 bg-status-approved/10 text-status-approved",
  Disputed: "border-status-disputed/40 bg-status-disputed/10 text-status-disputed",
  Refunded: "border-status-refunded/30 bg-status-refunded/10 text-status-refunded",
  Cancelled: "border-status-cancelled/40 bg-status-cancelled/10 text-status-cancelled",
};

/**
 * Status pill backed by the shared semantic status tokens. `status` is the
 * on-chain numeric job status (0-6); the label comes from `getStatusLabel`.
 */
export function StatusBadge({
  status,
  withDot = true,
  className,
}: {
  status: number;
  withDot?: boolean;
  className?: string;
}) {
  const label = getStatusLabel(status);
  const tone = statusClasses[label as JobStatus] ?? statusClasses.Open;

  return (
    <Badge className={cn("gap-1.5 border", tone, className)}>
      {withDot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {label}
    </Badge>
  );
}
