import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  Target,
  Lightbulb,
  FlaskConical,
  FileText,
  ListChecks,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "Tutor Workspace — Scholar" },
      {
        name: "description",
        content:
          "A focused AI tutoring environment with your course material, a Socratic conversation and live practice suggestions.",
      },
      { property: "og:title", content: "Tutor Workspace — Scholar" },
      {
        property: "og:description",
        content: "A focused AI tutoring environment with material, conversation and practice side by side.",
      },
    ],
  }),
  component: TutorWorkspace,
});

const materials = [
  { id: "m1", title: "Lecture 5 — Cell Energy & Photosynthesis", course: "BIOL 101", pages: 42 },
  { id: "m2", title: "Chapter 8 — Partial Derivatives", course: "MATH 201", pages: 28 },
  { id: "m3", title: "Lab Manual — Inclined Friction", course: "PHYS 102", pages: 16 },
  { id: "m4", title: "Notes — Big-O Complexity", course: "CS 101", pages: 12 },
];

const modes = [
  { id: "explain", label: "Explain Simply", icon: Lightbulb, prompt: "Explain this topic as simply as possible: " },
  { id: "example", label: "Give Example", icon: FlaskConical, prompt: "Give a worked example for: " },
  { id: "test", label: "Test Me", icon: ListChecks, prompt: "Test me with 5 questions on: " },
  { id: "summary", label: "Create Summary", icon: FileText, prompt: "Create a concise revision summary of: " },
  { id: "visual", label: "Show Visualization", icon: Wand2, prompt: "Describe a visual diagram that explains: " },
];

const suggestions = [
  "Why do light reactions need water?",
  "Compare cyclic and non-cyclic photophosphorylation",
  "Where does the oxygen we breathe come from?",
];

const practice = [
  "State the products of the light-dependent reactions.",
  "Explain the role of the thylakoid membrane gradient.",
  "Predict the effect of blocking photosystem II.",
];

function TutorWorkspace() {
  const { user } = useAuth();
  const [focusTopic, setFocusTopic] = useState("Photosynthesis: light-dependent reactions");
  const [activeMaterial, setActiveMaterial] = useState(materials[0].id);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);

  function runMode(template: string) {
    setPrompt(`${template}${focusTopic}`);
  }

  const leftPane = (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Target className="h-4 w-4 text-primary" />
            Current learning goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm font-semibold text-foreground">{focusTopic}</p>
          <div className="flex flex-wrap gap-1.5">
            {["Photosynthesis", "Gradient vectors", "Big-O analysis"].map((t) => (
              <button
                key={t}
                onClick={() => setFocusTopic(t)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <BookOpen className="h-4 w-4 text-primary" />
            Course material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMaterial(m.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                activeMaterial === m.id
                  ? "border-primary/50 bg-primary/8"
                  : "border-border/70 bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px] font-bold">{m.course}</Badge>
                <span className="shrink-0 text-[10px] text-muted-foreground">{m.pages} pages</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-foreground">{m.title}</p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const rightPane = (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">AI suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="w-full rounded-xl border border-border/70 bg-card px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              {s}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Practice questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
            {practice.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );

  const chatPane = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {modes.map((m) => (
          <Button
            key={m.id}
            size="sm"
            variant="outline"
            onClick={() => runMode(m.prompt)}
            className="h-8 rounded-full text-[11px] font-bold"
          >
            <m.icon className="mr-1 h-3.5 w-3.5" />
            {m.label}
          </Button>
        ))}
      </div>
      <AiAssistantPanel
        title="Socratic Tutor Agent"
        description="Grounded, step-by-step teaching tuned to your level and current goal."
        suggestions={suggestions}
        studentId={user?.id}
        externalPrompt={prompt}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader
        eyebrow="Agent #1"
        title="Tutor Workspace"
        description="Material, conversation and practice in one focused environment."
        action={
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </span>
        }
      />

      {/* Desktop: three panes */}
      <div className="hidden gap-5 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        {leftPane}
        {chatPane}
        {rightPane}
      </div>

      {/* Mobile / tablet: tabs */}
      <div className="xl:hidden">
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="material">Material</TabsTrigger>
            <TabsTrigger value="chat">Tutor</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>
          <TabsContent value="material" className="mt-4">{leftPane}</TabsContent>
          <TabsContent value="chat" className="mt-4">{chatPane}</TabsContent>
          <TabsContent value="practice" className="mt-4">{rightPane}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
