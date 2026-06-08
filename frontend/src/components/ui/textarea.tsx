import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5 text-base text-white shadow-inner shadow-black/10 transition-all duration-200 outline-none placeholder:text-zinc-500 hover:border-white/20 hover:bg-white/[0.075] focus-visible:border-emerald-300/45 focus-visible:ring-3 focus-visible:ring-emerald-300/15 disabled:cursor-not-allowed disabled:bg-white/[0.035] disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/[0.055] dark:disabled:bg-input/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
