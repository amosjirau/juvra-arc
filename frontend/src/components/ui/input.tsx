import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-base text-white shadow-inner shadow-black/10 transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-500 hover:border-white/20 hover:bg-white/[0.075] focus-visible:border-emerald-300/45 focus-visible:ring-3 focus-visible:ring-emerald-300/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-white/[0.035] disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/[0.055] dark:disabled:bg-input/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
