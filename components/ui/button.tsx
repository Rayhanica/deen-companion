import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-reed text-white shadow-soft hover:bg-oasis focus-visible:ring-reed",
  secondary:
    "border border-reed/20 bg-white/85 text-ink shadow-sm hover:border-reed/40 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
  ghost: "text-ink hover:bg-reed/10 dark:text-white dark:hover:bg-white/10",
  danger: "bg-clay text-white hover:bg-clay/90 focus-visible:ring-clay"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0"
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
