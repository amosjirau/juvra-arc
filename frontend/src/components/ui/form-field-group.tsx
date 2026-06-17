import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Accessible label + description + error wrapper for a form control. Pass the
 * control as children and wire `htmlFor` to its `id`.
 */
export function FormFieldGroup({
  label,
  htmlFor,
  description,
  hint,
  error,
  required = false,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-200">
          {label}
          {required ? <span className="ml-0.5 text-[#34d399]">*</span> : null}
        </label>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </div>
      {description ? <p className="text-xs leading-5 text-zinc-500">{description}</p> : null}
      {children}
      {error ? <p className="text-xs font-medium text-rose-300">{error}</p> : null}
    </div>
  );
}
