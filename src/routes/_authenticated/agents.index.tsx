import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AgentCard } from "@/components/agents/AgentCard";
import { agents, AGENT_CATEGORY_LABEL, type AgentCategory } from "@/lib/agents";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/agents/")({
  head: () => ({
    meta: [
      { title: "AI Agents Hub — Scholar" },
      {
        name: "description",
        content:
          "Launch every specialist AI agent — tutor, coach, planner, quiz, exam, feedback, RAG and profiler — from one hub.",
      },
      { property: "og:title", content: "AI Agents Hub — Scholar" },
      {
        property: "og:description",
        content: "Launch every specialist AI agent in your study workspace from one hub.",
      },
    ],
  }),
  component: AgentsHub,
});

const filters: Array<{ id: "all" | AgentCategory; label: string }> = [
  { id: "all", label: "All agents" },
  { id: "learning", label: AGENT_CATEGORY_LABEL.learning },
  { id: "assessment", label: AGENT_CATEGORY_LABEL.assessment },
  { id: "planning", label: AGENT_CATEGORY_LABEL.planning },
  { id: "teaching", label: AGENT_CATEGORY_LABEL.teaching },
];

function AgentsHub() {
  const [filter, setFilter] = useState<"all" | AgentCategory>("all");
  const visible = filter === "all" ? agents : agents.filter((a) => a.category === filter);
  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="AI Agents"
        title="Your agent team"
        description={`${agents.length} specialist agents orchestrated behind one assistant · ${activeCount} active right now.`}
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </span>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            onClick={() => setFilter(f.id)}
            className="rounded-full text-xs font-bold"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
