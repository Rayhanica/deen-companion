import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  body,
  actions,
  className
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-reed dark:text-teal-200">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold text-ink dark:text-white md:text-4xl">{title}</h1>
        {body ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">{body}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
