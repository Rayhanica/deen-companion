import { AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Card className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="flex min-h-40 flex-col items-center justify-center text-center">
      <AlertCircle className="mb-3 h-7 w-7 text-saffron" aria-hidden="true" />
      <h3 className="font-semibold text-ink dark:text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </Card>
  );
}
