import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { agents } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({
    meta: [
      { title: "AI Activity — Scholar" },
      {
        name: "description",
        content: "A timeline of every action your AI agents took on your behalf, grouped by day.",
      },
      { property: "og:title", content: "AI Activity — Scholar" },
      {
        property: "og:description",
        content: "A timeline of every action your AI agents took on your behalf.",
      },
    ],
  }),
  component: ActivityTimeline,
});

interface Event {
  id: string;
  agentId: string;
  time: string;
  summary: string;
}

const days: Array<{ label: string; events: Event[] }> = [
  {
    label: "Today",
    events: [
      { id: "e1", agentId: "tutor", time: "09:14", summary: "Explained light-dependent reactions with two diagrams." },
      { id: "e2", agentId: "profiler", time: "09:31", summary: "Raised Photosynthesis mastery from 61% to 78%." },
      { id: "e3", agentId: "coach", time: "11:02", summary: "Suggested a 25-minute focus block before the BIOL lab." },
      { id: "e4", agentId: "rag", time: "13:47", summary: "Answered a query with 3 page citations from Lecture 5." },
    ],
  },
  {
    label: "Yesterday",
    events: [
      { id: "e5", agentId: "quiz", time: "18:20", summary: "Generated 10 MCQs on cell energy; you scored 8/10." },
      { id: "e6", agentId: "planner", time: "19:05", summary: "Rebalanced the week around the MATH 201 deadline." },
      { id: "e7", agentId: "feedback", time: "21:12", summary: "Reviewed your lab report draft against the rubric." },
    ],
  },
  {
    label: "Earlier this week",
    events: [
      { id: "e8", agentId: "exam", time: "Tue", summary: "Assembled a timed BIOL 101 midterm simulation." },
      { id: "e9", agentId: "profiler", time: "Mon", summary: "Flagged gradient vectors as a new weak topic." },
    ],
  },
];

function ActivityTimeline() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="You"
        title="AI Activity"
        description="Everything your agents did, newest first."
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </span>
        }
      />

      {days.map((day) => (
        <section key={day.label} className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{day.label}</h3>
          <Card className="border-border/70">
            <CardContent className="divide-y divide-border/50 p-0">
              {day.events.map((e) => {
                const agent = agents.find((a) => a.id === e.agentId);
                const Icon = agent?.icon ?? History;
                return (
                  <div key={e.id} className="flex gap-3 p-4 transition-colors hover:bg-muted/40">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <Badge variant="outline" className="w-fit text-[10px] font-bold">
                          {agent?.shortName ?? "Agent"}
                        </Badge>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{e.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/85">{e.summary}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}
