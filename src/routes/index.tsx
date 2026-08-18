import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Play,
  Brain,
  Zap,
  CheckCircle2,
  ArrowRight,
  Bot,
  Layers,
  Star,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Compass,
  Cpu,
} from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scholar AI — Autonomous AI Education & Mentorship Platform" },
      {
        name: "description",
        content:
          "Your personal AI education command team: Socratic Tutor, 7-Day Revision Planner, RAG Document Studio, and Adaptive Diagnostic Engine.",
      },
      { property: "og:title", content: "Scholar AI — Autonomous AI Education Platform" },
      {
        property: "og:description",
        content:
          "Socratic AI Tutor, 7-Day Revision Planner with Video Lessons, RAG PDF Document Studio, and Teacher Essay Auto-Grader.",
      },
    ],
  }),
  component: Index,
});

type RoleType = "Students" | "Teachers" | "Administrators";

const roleContentMap: Record<
  RoleType,
  { headline: string; highlight: string; subtitle: string; primaryLink: string; primaryText: string; tag: string }
> = {
  Students: {
    tag: "Autonomous Student Copilot",
    headline: "An autonomous AI team guiding every step of your",
    highlight: "learning & exam revision",
    subtitle:
      "Get 1-on-1 Socratic concept guidance, continuous cognitive behavior tracking, 7-day revision timetables, and exact page citations from your course PDFs.",
    primaryLink: "/dashboard/student",
    primaryText: "Open Student Command Workspace",
  },
  Teachers: {
    tag: "Educator AI Co-Pilot",
    headline: "AI that drafts minute-by-minute lesson plans and",
    highlight: "auto-evaluates submissions",
    subtitle:
      "Automate class timelines, construct diagnostic quizzes in seconds, and grade student submissions with rubric-backed constructive feedback.",
    primaryLink: "/dashboard/teacher",
    primaryText: "Open Educator Assistant",
  },
  Administrators: {
    tag: "Institutional Intelligence",
    headline: "Centralized multi-agent management for every",
    highlight: "department & curriculum",
    subtitle:
      "Monitor student engagement health, system load, API throughput, role permissions, and course vector indices from a single enterprise console.",
    primaryLink: "/dashboard/admin",
    primaryText: "Open Admin Console",
  },
};

const agentFeatures = [
  {
    id: "tutor",
    badge: "Socratic Dialogues",
    title: "AI Socratic Tutor",
    icon: MessageSquare,
    description:
      "Step-by-step concept breakdown with interactive scaffolding hints, visual analogies, and worked mathematical derivations.",
    highlights: ["Interactive socratic hints", "Mathematical LaTeX formulas", "Custom analogies"],
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "planner",
    badge: "Adaptive Scheduling",
    title: "Academic Learning Planner",
    icon: Zap,
    description:
      "Constructs personalized 7-day study timetables tailored to upcoming assignment deadlines, peak focus hours, and decay curves.",
    highlights: ["Smart workload rebalancing", "Curated video lesson links", "Daily progress checklist"],
    accent: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
  },
  {
    id: "assessment",
    badge: "Diagnostic Mastery",
    title: "Mastery & Assessment Diagnostics",
    icon: FileCheck,
    description:
      "Generates multi-format adaptive quizzes (MCQs, Numerical, Conceptual) and practice exams with instant rubric-based evaluation.",
    highlights: ["Adaptive difficulty tuning", "Sub-topic mastery bars", "Automated rubric grading"],
    accent: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
  },
  {
    id: "analytics",
    badge: "Cognitive Intelligence",
    title: "Progress & Predictive Analytics",
    icon: TrendingUp,
    description:
      "Evaluates retention spacing consistency scores (0-100), monitors mastery growth trajectories, and forecasts exam readiness.",
    highlights: ["Explainable [Why?] AI reasoning", "Exam outcome predictions", "Streak retention tracking"],
    accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  },
  {
    id: "rag",
    badge: "Vector Knowledge Search",
    title: "Course Document RAG Studio",
    icon: Layers,
    description:
      "Index lecture slides, textbook PDFs, and lab notes into vector embeddings for instant questions with verified page citations.",
    highlights: ["PDF & slide document upload", "Verified page citations", "Instant lecture summaries"],
    accent: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400",
  },
  {
    id: "coach",
    badge: "Continuous Coaching",
    title: "Consistency & Study Habits Coach",
    icon: Compass,
    description:
      "Detects study bottlenecks, burnout patterns, and optimal focus windows, actively nudging you before knowledge decays.",
    highlights: ["Peak focus hour discovery", "Spaced interval alerts", "Milestone celebrations"],
    accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
  },
];

function Index() {
  const { isAuthenticated } = useAuth();
  const [activeRole, setActiveRole] = useState<RoleType>("Students");
  const content = roleContentMap[activeRole];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20">
      <Navbar />

      <main className="flex-1">
        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
          {/* Radial Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-radial from-emerald-500/15 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-6xl px-4 sm:px-6 relative space-y-8 text-center">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
              <span>Multi-Agent AI Education Platform</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-[11px] text-foreground">4 Autonomous Agents Active</span>
            </div>

            {/* Main Headline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                {content.headline}{" "}
                <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  {content.highlight}.
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                {content.subtitle}
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-secondary/60 border border-border/80 text-xs font-semibold shadow-xs">
              {(["Students", "Teachers", "Administrators"] as RoleType[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-4 py-2 rounded-xl transition-all font-bold ${
                    activeRole === role
                      ? "bg-card text-foreground shadow-sm border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  For {role}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to={isAuthenticated ? content.primaryLink : "/auth"}>
                <Button size="lg" className="h-12 px-7 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm gap-2 shadow-md hover:shadow-lg transition-all">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAuthenticated ? content.primaryText : "Get Started Free"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-6 rounded-2xl border-border hover:bg-accent font-semibold text-sm gap-2">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                  <span>Explore Live 1-Click Demo</span>
                </Button>
              </Link>
            </div>

            {/* Interactive Hero Preview Card */}
            <div className="pt-8 max-w-4xl mx-auto">
              <Card className="border border-border/80 bg-card/80 backdrop-blur shadow-2xl rounded-3xl overflow-hidden text-left">
                <div className="bg-secondary/40 border-b border-border/60 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-bold text-muted-foreground ml-2">scholar-ai // command-team</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                    🟢 Socratic Multi-Agent Orchestrator Online
                  </Badge>
                </div>

                <div className="p-6 grid gap-4 sm:grid-cols-3 bg-card">
                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5" /> Socratic AI Tutor
                    </div>
                    <p className="text-xs font-semibold text-foreground">"Step-by-step calculus derivation for chain rule."</p>
                    <span className="text-[10px] text-muted-foreground">Answered with LaTeX math & worked hints.</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                    <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Learning Planner
                    </div>
                    <p className="text-xs font-semibold text-foreground">"7-Day Revision plan calibrated for BIOL 101."</p>
                    <span className="text-[10px] text-muted-foreground">Rebalanced to 7:00 PM peak focus window.</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1.5">
                    <div className="text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Predictive Analytics
                    </div>
                    <p className="text-xs font-semibold text-foreground">"94% Math 201 Exam Readiness Forecast."</p>
                    <span className="text-[10px] text-muted-foreground">Calculated across 14-day quiz accuracy.</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── 6 SPECIALIZED AGENT GRID ── */}
        <section className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-emerald-800 text-white font-bold text-[11px]">Specialized AI Ecosystem</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              A Dedicated Team of AI Assistants Working For You
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Each agent is trained with a dedicated role—from Socratic guidance to automated grading and vector document citations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agentFeatures.map((agent) => {
              const IconComp = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="p-6 rounded-3xl border border-border/80 bg-card hover:border-emerald-600/40 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${agent.accent}`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                        {agent.badge}
                      </Badge>
                    </div>

                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {agent.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/40">
                    {agent.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CALL TO ACTION BANNER ── */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto pb-24">
          <Card className="border border-emerald-600/40 bg-linear-to-r from-emerald-950/20 via-background to-sky-950/20 shadow-xl rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-3 relative">
              <Badge className="bg-emerald-700 text-white font-bold text-xs">Ready to Elevate Your Learning?</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                Experience Your Personal AI Study Companion Today
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Log in instantly via Google or try our 1-click workspace demo to explore the full multi-agent dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm gap-2 shadow-md">
                  <span>Enter Student Workspace →</span>
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-8 px-6 bg-secondary/20 text-xs text-muted-foreground text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Scholar AI</span>
            <span>— Autonomous Multi-Agent Educational Suite</span>
          </div>
          <p>© {new Date().getFullYear()} Scholar AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
