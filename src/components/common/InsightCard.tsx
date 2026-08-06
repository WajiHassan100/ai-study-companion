import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InsightCard({
  icon: Icon,
  eyebrow,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-primary/25 bg-primary/5 p-5 shadow-xs",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative space-y-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Icon className="h-4.5 w-4.5" />
            </span>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
            ) : null}
            <h3 className="truncate font-display text-base font-bold tracking-tight text-foreground">
              {title}
            </h3>
          </div>
        </div>
        {children ? <div className="text-sm leading-relaxed text-foreground/85">{children}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
