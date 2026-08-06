import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Network, User2 } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { agents } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/system")({
  head: () => ({
    meta: [
      { title: "AI System Overview — Scholar" },
      {
        name: "description",
        content:
          "See how the central orchestrator routes each student request across nine specialist AI agents.",
      },
      { property: "og:title", content: "AI System Overview — Scholar" },
      {
        property: "og:description",
        content: "An interactive map of the multi-agent orchestration behind your study assistant.",
      },
    ],
  }),
  component: SystemOverview,
});

const detail: Record<string, { inputs: string; outputs: string }> = {
  tutor: { inputs: "Question, mastery level, learning style", outputs: "Explanation, examples, practice set" },
  coach: { inputs: "Streaks, workload, recent sessions", outputs: "Daily nudge, next best action" },
  planner: { inputs: "Deadlines, weak topics, availability", outputs: "Spaced study schedule" },
  quiz: { inputs: "Topic, difficulty, material", outputs: "MCQs, answers, mastery delta" },
  exam: { inputs: "Syllabus scope, duration", outputs: "Mock paper, mark scheme" },
  feedback: { inputs: "Draft submission, rubric", outputs: "Structured critique, revision steps" },
  rag: { inputs: "Indexed documents, query", outputs: "Grounded answer, page citations" },
  profiler: { inputs: "Quiz results, session history", outputs: "Weak topics, mastery scores" },
  teacher: { inputs: "Cohort submissions, rubric", outputs: "Grades, cohort insights" },
};

function SystemOverview() {
  const [selected, setSelected] = useState(agents[0].id);
  const active = agents.find((a) => a.id === selected)!;
  const ActiveIcon = active.icon;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Architecture"
        title="AI System Overview"
        description="One request in, orchestrated fan-out across nine specialist agents."
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Network className="h-5 w-5" />
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border-border/70">
          <CardContent className="p-5">
            {/* Flow row: request → orchestrator */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-2.5">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold text-foreground">Student request</span>
              </div>

              <div className="relative h-8 w-px overflow-hidden bg-border">
                <span className="absolute left-1/2 h-3 w-px -translate-x-1/2 animate-[marqueeUp_1.6s_linear_infinite] bg-primary" />
              </div>

              <div className="rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-center shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Central</p>
                <p className="font-display text-base font-bold text-foreground">Orchestrator Agent</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Intent detection · routing · memory</p>
              </div>

              <div className="relative h-8 w-px overflow-hidden bg-border">
                <span className="absolute left-1/2 h-3 w-px -translate-x-1/2 animate-[marqueeUp_1.6s_linear_infinite] bg-primary" />
              </div>

              <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
                {agents.map((a) => {
                  const Icon = a.icon;
                  const isSelected = a.id === selected;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelected(a.id)}
                      className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-primary/60 bg-primary/10 shadow-sm"
                          : "border-border/70 bg-card hover:border-primary/35"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-foreground">{a.shortName}</span>
                        <span className="block text-[10px] text-muted-foreground">Agent #{a.number}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70">
          <CardHeader className="pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <ActiveIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <CardTitle className="truncate text-sm font-bold">{active.name}</CardTitle>
                <p className="truncate text-[11px] text-muted-foreground">{active.tagline}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="leading-relaxed text-muted-foreground">{active.description}</p>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Inputs</p>
              <p className="text-foreground/85">{detail[active.id]?.inputs}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Outputs</p>
              <p className="text-foreground/85">{detail[active.id]?.outputs}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {active.capabilities.map((c) => (
                <Badge key={c} variant="outline" className="text-[10px] font-semibold">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
