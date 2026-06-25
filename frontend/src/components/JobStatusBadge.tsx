import { StatusBadge } from "@/components/ui/status-badge";

/**
 * Back-compat wrapper around the shared <StatusBadge>. Existing call sites
 * (`<JobStatusBadge status={n} />`) keep working and inherit the upgraded,
 * token-backed styling.
 */
export function JobStatusBadge({ status }: { status: number }) {
  return <StatusBadge status={status} />;
}
