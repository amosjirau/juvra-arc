import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. Duplicates content once and translates -50%,
 * reusing the global `juvra-scroll` keyframes. Pauses on hover; respects
 * reduced-motion (global CSS neutralizes the animation).
 */
export function Marquee({
  children,
  className,
  durationSeconds = 32,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  durationSeconds?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/marquee relative flex w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-4 will-change-transform job-carousel-track",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <div className="flex shrink-0 items-center gap-4">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
