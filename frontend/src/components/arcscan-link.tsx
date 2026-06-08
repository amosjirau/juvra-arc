import { ExternalLink } from "lucide-react";

import { arcExplorerUrl } from "@/lib/arc";
import { cn } from "@/lib/utils";

export function ArcscanLink({
  hash,
  className,
}: {
  hash?: `0x${string}`;
  className?: string;
}) {
  if (!hash) {
    return null;
  }

  return (
    <a
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200",
        className,
      )}
      href={`${arcExplorerUrl}/tx/${hash}`}
      rel="noreferrer"
      target="_blank"
    >
      View on Arcscan
      <ExternalLink className="size-3" />
    </a>
  );
}
