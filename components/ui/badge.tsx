import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-reed/15 bg-reed/8 px-2.5 py-1 text-xs font-medium text-reed dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100",
        className
      )}
      {...props}
    />
  );
}
