import { ExternalLink } from "lucide-react";
import { resolveReferences } from "@/lib/source-links";
import { cn } from "@/lib/utils";

export function ReferenceLinks({
  references,
  className,
  compact = false
}: {
  references: string[];
  className?: string;
  compact?: boolean;
}) {
  const resolved = resolveReferences(references);

  return (
    <ol className={cn("grid gap-2", className)}>
      {resolved.map((reference, index) => (
        <li key={`${reference.url}-${index}`}>
          <a
            href={reference.url}
            target={reference.url.startsWith("/") ? undefined : "_blank"}
            rel={reference.url.startsWith("/") ? undefined : "noreferrer"}
            className={cn(
              "group flex items-start gap-2 rounded-lg border border-slate-200/80 bg-white text-slate-700 transition hover:border-reed/35 hover:text-reed dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:text-teal-200",
              compact ? "px-3 py-2 text-xs" : "p-3 text-sm"
            )}
          >
            <span className="font-semibold text-reed dark:text-teal-200">[{index + 1}]</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{reference.label}</span>
              {!compact ? <span className="mt-0.5 block text-xs text-slate-400">{reference.provider}</span> : null}
            </span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-reed" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ol>
  );
}
