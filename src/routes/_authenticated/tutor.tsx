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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { evaluateAnswer } from "@/lib/api/assessment";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      topic: (search.topic as string) || undefined,
    };
  },
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
  const search = Route.useSearch();
  const [focusTopic, setFocusTopic] = useState(search.topic || "Photosynthesis: light-dependent reactions");
  const [activeMaterial, setActiveMaterial] = useState(materials[0].id);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);

  // Practice Question Evaluation State
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !answerText.trim() || evaluating) return;

    setEvaluating(true);
    setEvalResult(null);

    try {
      const res = await evaluateAnswer({
        student_id: user?.id || "demo_student",
        topic: focusTopic,
        question: activeQuestion,
        student_answer: answerText,
      });
      setEvalResult(res);
      toast.success("Answer evaluated by Skill Diagnostics!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to evaluate answer. Make sure backend is running.");
    } finally {
      setEvaluating(false);
    }
  };

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

      <Card className="border-border/70 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Practice questions
          </CardTitle>
          <CardDescription className="text-[10px]">
            Write answers to submit to Skill Diagnostics for grading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeQuestion ? (
            <ol className="list-decimal space-y-2.5 pl-4 text-xs font-semibold leading-relaxed text-foreground/80">
              {practice.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => {
                      setActiveQuestion(p);
                      setAnswerText("");
                      setEvalResult(null);
                    }}
                    className="text-left hover:text-primary hover:underline transition-colors leading-relaxed"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-2.5 text-xs border border-border/50">
                <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                  Active Question:
                </span>
                <p className="font-medium text-foreground leading-relaxed">{activeQuestion}</p>
              </div>

              {evalResult ? (
                <div className="space-y-3 rounded-lg border border-border/80 p-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    {evalResult.is_correct ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] gap-1 flex items-center">
                        <CheckCircle2 className="h-3 w-3" /> CORRECT ({evalResult.score}%)
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="font-bold text-[10px] gap-1 flex items-center">
                        <AlertCircle className="h-3 w-3" /> REVIEW ({evalResult.score}%)
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-bold">
                      Mastery: {evalResult.updated_mastery}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {evalResult.feedback}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveQuestion(null);
                      setEvalResult(null);
                    }}
                    className="w-full text-xs font-bold h-8 rounded-xl"
                  >
                    Next Question
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEvaluate} className="space-y-3">
                  <Textarea
                    placeholder="Type your explanation or answer here..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={evaluating}
                    className="min-h-[100px] text-xs leading-relaxed rounded-xl resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveQuestion(null)}
                      disabled={evaluating}
                      className="w-1/2 text-xs font-bold h-9 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!answerText.trim() || evaluating}
                      className="w-1/2 text-xs font-bold h-9 rounded-xl"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Grading...
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
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
        eyebrow="AI Learning Suite"
        title="Personal AI Socratic Tutor"
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
