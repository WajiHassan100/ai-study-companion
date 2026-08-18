import { AlertCircle } from "lucide-react";

export function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive flex items-start gap-2">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
    </div>
  );
}
