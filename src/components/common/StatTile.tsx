import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "warning" | "danger";
  className?: string;
}) {
  const toneRing =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "warning"
        ? "bg-chart-2/15 text-chart-2"
        : tone === "danger"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl", toneRing)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
