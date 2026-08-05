import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Play,
  FileText,
  Brain,
  Zap,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Bot,
  Layers,
  Star,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personal AI School Assistant — Next-Gen AI Learning Workspace" },
      {
        name: "description",
        content:
          "Transform your learning with 6 specialized AI agents: Socratic Tutor, Student Profiler, 7-Day Planner, Adaptive Quiz Generator, RAG Document Studio & Teacher Assistant.",
      },
      { property: "og:title", content: "Personal AI School Assistant — Next-Gen AI Learning Workspace" },
      {
        property: "og:description",
        content:
          "Transform your learning with 6 specialized AI agents: Socratic Tutor, Student Profiler, 7-Day Planner, Adaptive Quiz Generator, RAG Document Studio & Teacher Assistant.",
      },
    ],
  }),
  component: Index,
});

const heroPrompts = [
  {
    topic: "🧬 Biology",
    prompt: "Explain thylakoid light reactions and ATP synthase rotary motor simply",
    response: "Light reactions capture solar photons in Photosystem II & I, driving an electron transport chain across the thylakoid membrane to rotate ATP Synthase!",
  },
  {
    topic: "📐 Mathematics",
    prompt: "Show step-by-step how to find directional derivative of f(x,y) = x^2 + y^2",
    response: "Step 1: Compute gradient vector ∇f = <2x, 2y>. Step 2: Calculate dot product ∇f · u in direction of unit vector u!",
  },
  {
    topic: "📜 History",
    prompt: "Summarize the top 3 causes of the Industrial Revolution in bullet points",
    response: "1. Steam engine innovations. 2. Commercial capital & coal reserves. 3. Agricultural efficiency releasing factory labor!",
  },
];

const agentFeatures = [
  {
    id: "tutor",
    badge: "Agent #1",
    title: "Socratic AI Tutor",
    icon: Bot,
    description: "Personalized 1-on-1 tutoring with adaptive hint scaling, persistent vector memory, LaTeX formulas & Mermaid.js diagrams.",
    highlights: ["Socratic hint scaling", "LaTeX Math (E=mc²)", "Automatic Mermaid flowcharts"],
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-700",
  },
  {
    id: "profiler",
    badge: "Agent #2",
    title: "Student Profiler & Evaluator",
    icon: Brain,
    description: "Tracks student concept weaknesses, overall mastery scores (0–100%), and tailors explanations to beginner or advanced levels.",
    highlights: ["Weakness tracking radar", "Adaptive level adjustment", "Mastery scoring engine"],
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-700",
  },
  {
    id: "planner",
    badge: "Agent #3",
    title: "7-Day Revision Planner",
    icon: Zap,
    description: "Generates custom daily study timetables based on exam deadlines, complete with direct 'Watch Video Lesson' buttons.",
    highlights: ["Spaced Repetition schedules", "YouTube Video Lesson integration", "Daily task checklist"],
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-700",
  },
  {
    id: "quiz",
    badge: "Agent #4",
    title: "Adaptive Quiz & Flashcards",
    icon: Sparkles,
    description: "Creates dynamic MCQ quizzes and active recall flashcards on any topic, providing instant answer grading & explanations.",
    highlights: ["Instant MCQ grading", "Active recall flashcards", "Detailed explanation feedback"],
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-700",
  },
  {
    id: "rag",
    badge: "Agent #5",
    title: "RAG Course Knowledge Studio",
    icon: Layers,
    description: "Upload PDFs, Word DOCX & lecture notes. Uses Gemini text-embedding-004 + BM25 hybrid search for page-cited answers.",
    highlights: ["PDF & DOCX file uploads", "768-Dim Dense Vector Search", "Page-cited document sources"],
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-700",
  },
  {
    id: "teacher",
    badge: "Agent #6",
    title: "Teacher Assistant & Auto-Grader",
    icon: GraduationCap,
    description: "Empowers educators with automated lesson plan drafting, minute-by-minute timelines, and rubric-based essay grading.",
    highlights: ["Minute-by-minute lesson plans", "Rubric essay auto-grading", "Constructive student feedback"],
    color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-700",
  },
];

function Index() {
  const [activePromptIdx, setActivePromptIdx] = useState(0);

  const activePrompt = heroPrompts[activePromptIdx];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Navbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-background border-b border-border/50 pb-20 pt-16 md:pb-32 md:pt-24">
          <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-100/80 dark:bg-emerald-950/60 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase shadow-xs mb-6">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>THE ALL-IN-ONE AI SCHOOL PLATFORM • POWERED BY 6 AI AGENTS</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl max-w-4xl mx-auto">
              AI Spaces for Every <span className="text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">Student</span>, <span className="text-amber-600 dark:text-amber-400">Classroom</span> & Subject
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-xl leading-relaxed font-normal">
              Empower your study workflow with Socratic 1-on-1 tutoring, hybrid vector RAG document search, 7-day study revision timetables, and instant assignment auto-grading.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-lg hover:shadow-emerald-700/20 transition-all h-auto"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  Get Started Free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-card hover:bg-secondary/60 text-foreground font-semibold border-border/80 text-base py-3.5 px-8 rounded-xl shadow-xs h-auto"
              >
                <Link to="/dashboard/student" className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-emerald-600 fill-current" /> Open Student Dashboard
                </Link>
              </Button>
            </div>

            {/* Trust Badges Bar */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-8 border-t border-border/40">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Rated 4.9/5 by Students & Educators
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Free Open AI Companion
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600" /> Gemini 2.0 & text-embedding-004 Powered
              </span>
            </div>

            {/* ── INTERACTIVE LIVE PROMPT SANDBOX DEMO (SchoolAI Style) ── */}
            <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-emerald-600/30 bg-card p-5 md:p-8 shadow-2xl text-left space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 text-xs font-bold text-foreground">Interactive AI Tutor Sandbox — Click a Topic to Try:</span>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/40 text-emerald-700 bg-emerald-50">
                  Live Agent #1 Demo
                </Badge>
              </div>

              {/* Subject Tabs */}
              <div className="flex flex-wrap gap-2">
                {heroPrompts.map((p, idx) => (
                  <button
                    key={p.topic}
                    onClick={() => setActivePromptIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activePromptIdx === idx
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {p.topic}
                  </button>
                ))}
              </div>

              {/* Interactive Prompt & Response Preview Box */}
              <div className="space-y-4 p-4 rounded-2xl bg-secondary/30 border border-border/60">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    You
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-xs font-semibold text-foreground">
                    "{activePrompt.prompt}"
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="h-8 w-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/80 text-xs text-foreground leading-relaxed shadow-xs flex-1 space-y-2">
                    <span className="font-bold text-emerald-700 block">Agent #1 Socratic Tutor:</span>
                    <p>{activePrompt.response}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Try this live in the student workspace:</span>
                <Button size="sm" asChild className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  <Link to="/dashboard/student">Ask AI Tutor Now →</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6 SPECIALIZED AI AGENTS SHOWCASE GRID ── */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:py-28 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs uppercase font-bold text-emerald-700 border-emerald-300 bg-emerald-50">
              Complete Multi-Agent Architecture
            </Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Meet Your 6 Autonomous AI Study Agents
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Each AI agent is purpose-built to automate a core dimension of learning, from Socratic concept explanations to hybrid vector RAG document queries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agentFeatures.map((agent) => (
              <Card key={agent.id} className="border border-border/80 shadow-xs rounded-2xl overflow-hidden hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <CardHeader className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="h-12 w-12 rounded-2xl bg-emerald-700/10 border border-emerald-500/30 text-emerald-700 flex items-center justify-center">
                      <agent.icon className="h-6 w-6" />
                    </span>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold ${agent.color}`}>
                      {agent.badge}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="font-display text-xl font-bold text-foreground">{agent.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {agent.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  <ul className="space-y-2 pt-3 border-t border-border/50 text-xs font-medium text-foreground">
                    {agent.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── ROLE-BASED WORKSPACES SECTION ── */}
        <section className="bg-secondary/40 border-y border-border/50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Designed for Students, Teachers & Administrators
              </h2>
              <p className="text-sm text-muted-foreground">
                One unified platform with tailored role-aware views and permissions.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
                <span className="h-10 w-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <BookOpen className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-lg text-foreground">Student Workspace</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access 1-on-1 Socratic tutoring, track weak concepts, view 7-day revision timetables, and submit assignments for automated grading.
                </p>
                <Button size="sm" asChild variant="outline" className="w-full text-xs font-semibold">
                  <Link to="/dashboard/student">Open Student View →</Link>
                </Button>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
                <span className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-lg text-foreground">Teacher Assistant</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate minute-by-minute lesson plans, draft adaptive quizzes, review student submission queues, and grade essays automatically.
                </p>
                <Button size="sm" asChild variant="outline" className="w-full text-xs font-semibold">
                  <Link to="/dashboard/teacher">Open Teacher View →</Link>
                </Button>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
                <span className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-lg text-foreground">Admin Console</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manage user roles, course catalogs, system configuration, database connectivity, and platform analytics in one control console.
                </p>
                <Button size="sm" asChild variant="outline" className="w-full text-xs font-semibold">
                  <Link to="/dashboard/admin">Open Admin Console →</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION BANNER ── */}
        <section className="mx-auto max-w-5xl px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-16 text-center text-white shadow-2xl md:px-12 md:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700/80 border border-emerald-500/40 text-white mb-6">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Elevate Your Learning with AI Today
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-emerald-100/90 leading-relaxed">
              Join thousands of students and teachers using the Personal AI School Assistant to master concepts, solve assignments, and build custom study plans.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base py-3 px-8 rounded-xl shadow-md h-auto">
                <Link to="/auth" className="flex items-center gap-2">
                  Create Account Free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 bg-card text-center text-xs text-muted-foreground font-medium">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap items-center justify-between gap-4">
          <span>Personal AI School Assistant © 2026 • Powered by Gemini 2.0 & FastAPI</span>
          <div className="flex items-center gap-4">
            <Link to="/dashboard/student" className="hover:underline">Student Dashboard</Link>
            <Link to="/assignments" className="hover:underline">Assignments Hub</Link>
            <Link to="/courses/biol_101" className="hover:underline">Course RAG Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
