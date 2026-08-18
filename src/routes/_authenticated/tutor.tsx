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
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { evaluateAnswer } from "@/lib/api/assessment";
import { toast } from "sonner";

import { z } from "zod";

const tutorSearchSchema = z.object({
  topic: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/tutor")({
  validateSearch: (search) => tutorSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "AI Socratic Tutor Workspace — Scholar AI" },
      {
        name: "description",
        content:
          "Focused Socratic AI tutoring workspace with active practice evaluations, worked derivations, and document citations.",
      },
    ],
  }),
  component: TutorWorkspace,
});

const materials = [
  { id: "m1", title: "Lecture 5 — Cell Energy & Photosynthesis", course: "BIOL 101", pages: 42 },
  { id: "m2", title: "Chapter 8 — Partial Derivatives & Gradient Vectors", course: "MATH 201", pages: 28 },
  { id: "m3", title: "Lab Manual — Newton's Friction & Vectors", course: "PHYS 102", pages: 16 },
  { id: "m4", title: "Notes — Big-O Asymptotic Complexity", course: "CS 101", pages: 12 },
];

const modes = [
  { id: "explain", label: "Explain Simply", icon: Lightbulb, prompt: "Explain this topic simply with an intuitive analogy: " },
  { id: "example", label: "Worked Example", icon: FlaskConical, prompt: "Walk me through a step-by-step worked derivation for: " },
  { id: "test", label: "Diagnostic Quiz", icon: ListChecks, prompt: "Quiz me with 3 conceptual practice questions on: " },
  { id: "summary", label: "Study Summary", icon: FileText, prompt: "Create a structured key-takeaways summary of: " },
  { id: "visual", label: "Diagram Scaffold", icon: Wand2, prompt: "Describe a mental visual model and flowchart for: " },
];

const suggestions = [
  "Why do light reactions require water hydrolysis?",
  "Compare cyclic vs non-cyclic photophosphorylation",
  "How does the proton gradient rotate ATP synthase?",
];

const practice = [
  "State the core products of the light-dependent reactions.",
  "Explain how the thylakoid proton gradient generates ATP.",
  "Predict the biochemical outcome if Photosystem II is inhibited.",
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
      toast.success("Answer evaluated by Socratic Assessment Engine!");
    } catch {
      toast.error("Evaluation failed. Please check backend connection.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── HEADER BANNER ── */}
      <Card className="border border-emerald-600/30 bg-linear-to-r from-emerald-950/10 via-background to-sky-950/10 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-700 text-white font-bold text-[11px] gap-1 px-2.5">
                <Brain className="h-3.5 w-3.5" />
                <span>AI Socratic Workspace</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                🟢 Live Socratic Guidance Active
              </Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Socratic AI Tutor
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Deep-dive concept guidance, step-by-step math derivations, and instant rubric feedback on your practice answers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 border border-border">
              Topic: <strong className="ml-1 text-foreground">{focusTopic}</strong>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── MODES QUICK PICKER ── */}
      <div className="grid gap-2 sm:grid-cols-5">
        {modes.map((m) => {
          const IconComp = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setPrompt(`${m.prompt} ${focusTopic}`)}
              className="p-3 rounded-2xl bg-card border border-border/80 hover:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left space-y-1 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                <IconComp className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{m.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">
                Prompt Socratic Tutor
              </p>
            </button>
          );
        })}
      </div>

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Context, Materials & Practice Test Sandbox (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Active Course Materials */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span>Indexed Course Materials</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Select material to ground Socratic explanations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveMaterial(m.id);
                    setFocusTopic(m.title);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    activeMaterial === m.id
                      ? "border-emerald-600 bg-emerald-500/10 font-bold text-foreground"
                      : "border-border/60 hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="block font-semibold text-foreground">{m.title}</span>
                    <span className="text-[11px] text-muted-foreground">{m.course} • {m.pages} Pages Indexed</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">{m.course}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Socratic Practice Diagnostic Sandbox */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span>Practice Question Auto-Evaluator</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Submit your answer for AI diagnostic scoring</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">1. Select a Practice Question:</label>
                <div className="space-y-1">
                  {practice.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveQuestion(q);
                        setEvalResult(null);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                        activeQuestion === q
                          ? "border-purple-600 bg-purple-500/10 font-bold text-foreground"
                          : "border-border/60 hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      {idx + 1}. {q}
                    </button>
                  ))}
                </div>
              </div>

              {activeQuestion && (
                <form onSubmit={handleEvaluate} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">2. Write your answer:</label>
                    <Textarea
                      required
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your explanation here..."
                      className="min-h-[100px] text-xs resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={evaluating || !answerText.trim()}
                    className="w-full h-8 text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold gap-1.5"
                  >
                    {evaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>Evaluate My Answer</span>
                  </Button>
                </form>
              )}

              {/* Evaluation Feedback Result */}
              {evalResult && (
                <div className="p-3 rounded-2xl bg-secondary/60 border border-border/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Evaluated
                    </span>
                    <Badge className={evalResult.is_correct ? "bg-emerald-700 text-white" : "bg-amber-700 text-white"}>
                      {evalResult.is_correct ? "Correct Concept" : "Needs Review"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {evalResult.feedback || "Good conceptual framing. Consider adding specific biochemical enzyme details."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Assistant Streaming Panel (7 cols) */}
        <div className="lg:col-span-7">
          <AiAssistantPanel
            title="Socratic Conversation Stream"
            description="Discuss concepts with step-by-step hints and derivations"
            suggestions={suggestions}
            externalPrompt={prompt}
          />
        </div>
      </div>
    </div>
  );
}
