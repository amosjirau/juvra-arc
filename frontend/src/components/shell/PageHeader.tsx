import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Standard page header: optional eyebrow chip, display title (optionally
 * gradient), supporting copy, and an actions slot. Uses the CSS-only
 * `.scroll-reveal` entrance so it stays a server component.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  actions,
  gradient = true,
  className,
  align = "start",
}: {
  eyebrow?: ReactNode;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  gradient?: boolean;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <header
      className={cn(
        "scroll-reveal flex flex-col gap-5",
        align === "center"
          ? "items-center text-center"
          : "items-start sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <span className="eyebrow">
            {EyebrowIcon ? <EyebrowIcon className="size-3.5 text-[#ff9a4a]" /> : null}
            {eyebrow}
          </span>
        ) : null}
        <h1
          className={cn(
            "text-display-2 mt-4 font-semibold text-balance",
            gradient ? "heading-gradient" : "text-white",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
