import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
  Play,
  Brain,
  Zap,
  CheckCircle2,
  ArrowRight,
  Bot,
  Layers,
  Star,
  Award,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scholar AI — AI that connects teachers with every student" },
      {
        name: "description",
        content:
          "See how every student is doing, know what to do next, and spend more time with the students who need it most.",
      },
      { property: "og:title", content: "Scholar AI — AI that connects teachers with every student" },
      {
        property: "og:description",
        content:
          "See how every student is doing, know what to do next, and spend more time with the students who need it most.",
      },
    ],
  }),
  component: Index,
});

type RoleType = "Teachers" | "Leaders" | "Students" | "Higher Ed";

const roleHeadlineMap: Record<RoleType, { headline: string; highlight: string; subtitle: string }> = {
  Teachers: {
    headline: "AI that connects teachers with",
    highlight: "every student",
    subtitle: "See how every student is doing, know what to do next, and spend more time with the students who need it most.",
  },
  Leaders: {
    headline: "AI that scales personalized learning for",
    highlight: "entire districts",
    subtitle: "Empower your school leadership with real-time student growth insights, district-wide safety, and AI adoption analytics.",
  },
  Students: {
    headline: "AI that turns every student into a",
    highlight: "top achiever",
    subtitle: "Get Socratic 1-on-1 tutoring, 7-day study plans, and instant homework assistance available 24/7.",
  },
  "Higher Ed": {
    headline: "AI that accelerates research and",
    highlight: "campus learning",
    subtitle: "Query academic papers, synthesize complex literature, and solve multivariable calculus & physics assignments in seconds.",
  },
};

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
  const [activeRole, setActiveRole] = useState<RoleType>("Teachers");
  const [activePromptIdx, setActivePromptIdx] = useState(0);

  const roleInfo = roleHeadlineMap[activeRole];
  const activePrompt = heroPrompts[activePromptIdx];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      <Navbar />

      <main>
        {/* ── HERO SECTION MATCHING SCHOOLAI SCREENSHOT ── */}
        <section className="relative overflow-hidden bg-background px-6 pt-8 pb-16 md:px-12 lg:pt-12 lg:pb-24">
          <div className="mx-auto max-w-7xl">

            {/* Role Capsule Selector Bar (SchoolAI Capsule Bar) */}
            <div className="mb-8 inline-flex items-center gap-1 rounded-full border border-border/80 bg-card p-1.5 shadow-sm">
              <span className="px-3.5 text-xs font-semibold text-muted-foreground hidden sm:inline-block">
                ScholarAI for...
              </span>
              {(["Teachers", "Leaders", "Students", "Higher Ed"] as RoleType[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    activeRole === role
                      ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

              {/* Left Text Column */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl">
                  {roleInfo.headline}{" "}
                  <span className="relative inline-block text-slate-950 dark:text-white">
                    {roleInfo.highlight}
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-amber-400"
                      viewBox="0 0 200 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 9.5C50 3.5 150 2.5 197.5 8.5"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-xl font-normal">
                  {roleInfo.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3.5 h-auto shadow-md"
                  >
                    <Link to="/dashboard/student" className="flex items-center gap-2">
                      Get Started Free <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full bg-card hover:bg-secondary text-foreground font-semibold px-8 py-3.5 h-auto border-border/80"
                  >
                    <Link to="/courses/biol_101" className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-600" /> Explore RAG Studio
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Bento Art Gallery Grid (SchoolAI Asymmetric Artwork Layout) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">

                {/* Artwork Box 1: Science Tools */}
                <div className="h-44 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                    ✏️
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md">
                      Math & Science
                    </span>
                    <h4 className="font-bold text-sm mt-1">Calculus & Geometry</h4>
                  </div>
                </div>

                {/* Artwork Box 2: World Curriculum */}
                <div className="h-44 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 p-4 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                    🌍
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md">
                      Global Knowledge
                    </span>
                    <h4 className="font-bold text-sm mt-1">World History & Economics</h4>
                  </div>
                </div>

                {/* Artwork Box 3: Biology Frog (Large Feature Box) */}
                <div className="col-span-2 h-52 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                      🐸
                    </span>
                    <Badge className="bg-white/20 backdrop-blur text-white text-xs font-bold">
                      RAG Vector Engine
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-200">
                      General Cell Biology • Campbell Biology 12th Ed.
                    </span>
                    <h3 className="font-display font-extrabold text-xl mt-0.5">
                      Photosynthesis & Thylakoid Electron Transport
                    </h3>
                  </div>
                </div>

              </div>

            </div>

            {/* ── INTERACTIVE LIVE PROMPT SANDBOX DEMO ── */}
            <div className="mt-16 max-w-4xl mx-auto rounded-3xl border border-emerald-600/30 bg-card p-6 md:p-8 shadow-2xl text-left space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 text-xs font-bold text-foreground">Interactive AI Tutor Sandbox — Click a Subject to Try:</span>
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
                        ? "bg-blue-600 text-white shadow-xs"
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
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    You
                  </div>
                  <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-xs font-semibold text-foreground">
                    "{activePrompt.prompt}"
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/80 text-xs text-foreground leading-relaxed shadow-xs flex-1 space-y-2">
                    <span className="font-bold text-emerald-700 block">Agent #1 Socratic Tutor:</span>
                    <p>{activePrompt.response}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Try this live in your student workspace:</span>
                <Button size="sm" asChild className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
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
      </main>

      {/* ── FLOATING BOTTOM RIGHT CHAT BUBBLE (SchoolAI Style) ── */}
      <Link
        to="/dashboard/student"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all group"
        title="Open AI Assistant"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </Link>

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
