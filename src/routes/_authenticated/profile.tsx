import { createFileRoute, Link } from "@tanstack/react-router";
import {
  UserCircle2,
  Eye,
  Clock3,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatTile } from "@/components/common/StatTile";
import { InsightCard } from "@/components/common/InsightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressChart } from "@/components/Charts/ProgressChart";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Learning Profile — Scholar" },
      {
        name: "description",
        content:
          "Your AI learning identity: style, level, strengths, weak spots and the hours when you study best.",
      },
      { property: "og:title", content: "Learning Profile — Scholar" },
      {
        property: "og:description",
        content: "Your AI-generated learning identity, built from every study session.",
      },
    ],
  }),
  component: LearningProfile,
});

const strengths = ["Cell structure", "Kinematics", "Recursion", "Data interpretation"];
const weaknesses = ["Gradient vectors", "Organic mechanisms", "Big-O proofs"];

const hours = [
  { label: "6a", value: 1 },
  { label: "9a", value: 3 },
  { label: "12p", value: 5 },
  { label: "3p", value: 4 },
  { label: "6p", value: 8 },
  { label: "9p", value: 9 },
  { label: "12a", value: 3 },
];

function LearningProfile() {
  const { profile, user } = useAuth();
  const name = profile?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="You"
        title="Learning Profile"
        description="Continuously updated from your study sessions, quizzes, and practice submissions."
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UserCircle2 className="h-5 w-5" />
          </span>
        }
      />

      <InsightCard icon={Sparkles} eyebrow="AI learning identity" title={`${name} — visual, intermediate learner`}>
        You retain concepts fastest through diagrams and worked examples, and your accuracy peaks in evening
        sessions. Short, frequent revision beats long blocks for you — your personalized planner already schedules
        around that.
      </InsightCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Learning style" value="Visual" hint="Diagrams over prose" icon={Eye} tone="primary" />
        <StatTile label="Level" value="Intermediate" hint="Across 6 active courses" icon={TrendingUp} />
        <StatTile label="Avg. session" value="34 min" hint="Best window: 6–9pm" icon={Clock3} />
        <StatTile label="Study streak" value="6 days" hint="Personal best: 11" icon={Flame} tone="warning" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {strengths.map((s) => (
              <Badge key={s} className="bg-primary/12 text-primary hover:bg-primary/20">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pb-3">
            <CardTitle className="truncate text-sm font-bold">Needs work</CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-7 shrink-0 text-[11px] font-bold">
              <Link to="/mastery">
                Mastery map <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {weaknesses.map((w) => (
              <Badge key={w} variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                {w}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <ProgressChart
        title="Productive hours"
        description="When your study sessions actually produce correct answers."
        data={hours}
        seriesLabel="Effective study intensity"
      />
    </div>
  );
}
