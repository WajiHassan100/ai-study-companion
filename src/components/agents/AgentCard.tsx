import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AGENT_CATEGORY_LABEL,
  AGENT_STATUS_LABEL,
  type AgentDefinition,
} from "@/lib/agents";

const statusStyles: Record<AgentDefinition["status"], string> = {
  active: "bg-primary/12 text-primary border-primary/30",
  idle: "bg-muted text-muted-foreground border-border",
  "needs-input": "bg-chart-2/15 text-chart-2 border-chart-2/30",
};

export function AgentCard({ agent, className }: { agent: AgentDefinition; className?: string }) {
  const Icon = agent.icon;

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Agent #{agent.number} · {AGENT_CATEGORY_LABEL[agent.category]}
            </p>
            <h3 className="truncate font-display text-base font-bold tracking-tight text-foreground">
              {agent.shortName}
            </h3>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[10px] font-bold", statusStyles[agent.status])}>
          {AGENT_STATUS_LABEL[agent.status]}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{agent.description}</p>

      <ul className="flex flex-wrap gap-1.5">
        {agent.capabilities.map((c) => (
          <li
            key={c}
            className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 border-t border-border/60 pt-3">
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">Last:</span> {agent.lastActivity}
        </p>
        <Button asChild size="sm" className="w-full rounded-xl font-bold">
          {agent.id === "rag" ? (
            <Link to="/courses/$courseId" params={{ courseId: "biol_101" }}>
              Launch {agent.shortName}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          ) : agent.id === "tutor" ? (
            <Link to="/tutor">
              Launch {agent.shortName}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          ) : (
            <Link to="/agents/$agentId" params={{ agentId: agent.id }}>
              Launch {agent.shortName}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </Button>
      </div>
    </article>
  );
}
