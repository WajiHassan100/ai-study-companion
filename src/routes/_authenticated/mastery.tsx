import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Waypoints, ArrowRight, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatTile } from "@/components/common/StatTile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentProfile } from "@/lib/api/assessment";

export const Route = createFileRoute("/_authenticated/mastery")({
  head: () => ({
    meta: [
      { title: "Mastery Map — Scholar" },
      {
        name: "description",
        content:
          "A topic-by-topic map of what you have mastered, what is shaky and what needs attention across every course.",
      },
      { property: "og:title", content: "Mastery Map — Scholar" },
      {
        property: "og:description",
        content: "See exactly which topics you've mastered and which still need work.",
      },
    ],
  }),
  component: MasteryMap,
});

type Level = "strong" | "shaky" | "weak";

interface Topic {
  id: string;
  name: string;
  score: number;
  level: Level;
  subtopics: Array<{ name: string; score: number }>;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  topics: Topic[];
}

function levelOf(score: number): Level {
  return score >= 75 ? "strong" : score >= 50 ? "shaky" : "weak";
}

function topic(id: string, name: string, score: number, subtopics: Array<[string, number]>): Topic {
  return {
    id,
    name,
    score,
    level: levelOf(score),
    subtopics: subtopics.map(([n, s]) => ({ name: n, score: s })),
  };
}

const subjects: Subject[] = [
  {
    id: "biol_101",
    code: "BIOL 101",
    name: "Cell & Molecular Biology",
    topics: [
      topic("b1", "Cell structure", 88, [["Organelles", 92], ["Membranes", 84]]),
      topic("b2", "Photosynthesis", 64, [["Light reactions", 58], ["Calvin cycle", 70]]),
      topic("b3", "Respiration", 41, [["Glycolysis", 46], ["Electron transport", 36]]),
    ],
  },
  {
    id: "math_201",
    code: "MATH 201",
    name: "Multivariable Calculus",
    topics: [
      topic("m1", "Partial derivatives", 79, [["Chain rule", 82], ["Implicit forms", 76]]),
      topic("m2", "Gradient vectors", 38, [["Directional derivatives", 34], ["Level curves", 42]]),
      topic("m3", "Multiple integrals", 57, [["Double integrals", 61], ["Polar form", 53]]),
    ],
  },
  {
    id: "cs_101",
    code: "CS 101",
    name: "Data Structures & Algorithms",
    topics: [
      topic("c1", "Recursion", 91, [["Base cases", 94], ["Tree recursion", 88]]),
      topic("c2", "Big-O analysis", 52, [["Amortised cost", 47], ["Space complexity", 57]]),
      topic("c3", "Hash maps", 83, [["Collisions", 80], ["Load factor", 86]]),
    ],
  },
];

const levelStyles: Record<Level, { dot: string; chip: string; label: string; bar: string }> = {
  strong: {
    dot: "bg-primary",
    chip: "border-primary/30 bg-primary/10 text-primary",
    label: "Mastered",
    bar: "[&>div]:bg-primary",
  },
  shaky: {
    dot: "bg-chart-2",
    chip: "border-chart-2/30 bg-chart-2/15 text-chart-2",
    label: "Shaky",
    bar: "[&>div]:bg-chart-2",
  },
  weak: {
    dot: "bg-destructive",
    chip: "border-destructive/30 bg-destructive/10 text-destructive",
    label: "Needs work",
    bar: "[&>div]:bg-destructive",
  },
};

function MasteryMap() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: () => getStudentProfile(user?.id || "demo_student"),
    enabled: !!user?.id,
  });

  const liveSubjects = useMemo(() => {
    if (!profile) return subjects;
    const topicMastery = profile.topic_mastery || {};

    return subjects.map((sub) => ({
      ...sub,
      topics: sub.topics.map((t) => {
        const liveScore = Object.entries(topicMastery).find(
          ([name]) => name.toLowerCase() === t.name.toLowerCase()
        )?.[1] ?? t.score;

        return {
          ...t,
          score: liveScore,
          level: levelOf(liveScore),
          subtopics: t.subtopics.map((st) => {
            const subLiveScore = Object.entries(topicMastery).find(
              ([name]) => name.toLowerCase() === st.name.toLowerCase()
            )?.[1] ?? st.score;
            return { ...st, score: subLiveScore };
          }),
        };
      }),
    }));
  }, [profile]);

  const allTopics = useMemo(() => liveSubjects.flatMap((s) => s.topics), [liveSubjects]);
  const [selectedId, setSelectedId] = useState("b1");

  // Keep selectedId synchronized if liveSubjects changes
  const selected = useMemo(() => {
    return allTopics.find((t) => t.id === selectedId) || allTopics[0];
  }, [allTopics, selectedId]);

  const counts = useMemo(() => {
    return {
      strong: allTopics.filter((t) => t.level === "strong").length,
      shaky: allTopics.filter((t) => t.level === "shaky").length,
      weak: allTopics.filter((t) => t.level === "weak").length,
    };
  }, [allTopics]);

  const overall = useMemo(() => {
    if (allTopics.length === 0) return 0;
    return Math.round(allTopics.reduce((a, t) => a + t.score, 0) / allTopics.length);
  }, [allTopics]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading your mastery map...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="You"
        title="Mastery Map"
        description="Every topic scored by the Profiler agent, drillable down to subtopic level."
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Waypoints className="h-5 w-5" />
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Overall mastery" value={`${overall}%`} hint="Across all tracked topics" tone="primary" />
        <StatTile label="Mastered" value={counts.strong} hint="75% and above" />
        <StatTile label="Shaky" value={counts.shaky} hint="50–74%" tone="warning" />
        <StatTile label="Needs work" value={counts.weak} hint="Below 50%" tone="danger" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {liveSubjects.map((subject) => (
            <Card key={subject.id} className="border-border/70">
              <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-sm font-bold">{subject.name}</CardTitle>
                  <p className="truncate text-[11px] text-muted-foreground">{subject.topics.length} tracked topics</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] font-bold">{subject.code}</Badge>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {subject.topics.map((t) => {
                  const style = levelStyles[t.level];
                  const isSelected = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                        isSelected ? "border-primary/50 bg-primary/6" : "border-border/70 bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                          <span className="truncate text-xs font-bold text-foreground">{t.name}</span>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-foreground">{t.score}%</span>
                      </div>
                      <Progress value={t.score} className={`mt-2 h-1.5 ${style.bar}`} />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {selected && (
          <Card className="h-fit border-border/70 lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <CardTitle className="truncate text-sm font-bold">{selected.name}</CardTitle>
                <Badge variant="outline" className={`shrink-0 text-[10px] font-bold ${levelStyles[selected.level].chip}`}>
                  {levelStyles[selected.level].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Topic mastery
                  </span>
                  <span className="font-display text-2xl font-bold">{selected.score}%</span>
                </div>
                <Progress value={selected.score} className={`mt-2 h-2 ${levelStyles[selected.level].bar}`} />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Subtopics</p>
                {selected.subtopics.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-foreground/85">{s.name}</span>
                      <span className="shrink-0 font-bold">{s.score}%</span>
                    </div>
                    <Progress value={s.score} className={`h-1.5 ${levelStyles[levelOf(s.score)].bar}`} />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate({ to: "/tutor", search: { topic: selected.name } })}
                size="sm"
                className="w-full rounded-xl font-bold"
              >
                Send to Tutor <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
