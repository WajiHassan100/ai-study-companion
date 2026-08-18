import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Lock,
  Award,
  FileCheck,
  TrendingUp,
  Brain,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scholar AI — Personal AI Study Companion & Socratic Tutor" },
      {
        name: "description",
        content:
          "The personal AI study companion built for students. Socratic step-by-step tutoring, 7-day adaptive revision planning, and instant lecture note citations.",
      },
      { property: "og:title", content: "Scholar AI — Personal AI Study Companion" },
      {
        property: "og:description",
        content: "Personalized Socratic AI Tutoring, 7-Day Study Plans, and Interactive Course Spaces.",
      },
    ],
  }),
  component: Index,
});

// Illustrated cards for the vertical moving columns
const leftColCards = [
  {
    title: "Space & Astrophysics",
    category: "Astronomy",
    imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    gradient: "from-sky-900/60 to-indigo-950/80",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Ancient Architecture & Rome",
    category: "History",
    imgUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    gradient: "from-amber-900/60 to-orange-950/80",
    aspect: "aspect-[16/11]",
  },
  {
    title: "Creative Arts & Design",
    category: "Art & Studio",
    imgUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    gradient: "from-rose-900/60 to-pink-950/80",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Molecular Genetics & DNA",
    category: "Biology",
    imgUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop",
    gradient: "from-emerald-900/60 to-teal-950/80",
    aspect: "aspect-[16/11]",
  },
];

const rightColCards = [
  {
    title: "Roman Colosseum Heritage",
    category: "World History",
    imgUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    gradient: "from-amber-900/60 to-yellow-950/80",
    aspect: "aspect-[16/11]",
  },
  {
    title: "Earth Ecosystems & Geology",
    category: "Earth Science",
    imgUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=800&auto=format&fit=crop",
    gradient: "from-cyan-900/60 to-blue-950/80",
    aspect: "aspect-[4/5]",
  },
  {
    title: "Calculus & Quantum Mechanics",
    category: "Mathematics",
    imgUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    gradient: "from-purple-900/60 to-indigo-950/80",
    aspect: "aspect-[16/11]",
  },
  {
    title: "Data Structures & Algorithms",
    category: "Computer Science",
    imgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    gradient: "from-emerald-900/60 to-sky-950/80",
    aspect: "aspect-[4/5]",
  },
];

function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-sky-500/20">
      <Navbar />

      {/* ── 1. 100% STUDENT-FOCUSED HERO (WITH MOVING PICTURE COLUMNS ON RIGHT) ── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Student Value Proposition + Big Typography + Action Pills (6 Cols) */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8 z-10">
            {/* Student Copilot Pill Tag */}
            <div className="inline-flex items-center bg-card border border-border/80 rounded-full px-4 py-1.5 gap-2 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                ✨ Personal AI Study Companion
              </span>
              <span className="text-xs text-muted-foreground font-semibold">| Built 100% for Students</span>
            </div>

            {/* Main Headline with SchoolAI Yellow Brushstroke Accent */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                The AI tutor built for{" "}
                <span className="relative whitespace-nowrap inline-block text-sky-600 dark:text-sky-400">
                  every student
                  {/* Playful Yellow Brushstroke Underline SVG */}
                  <svg
                    viewBox="0 0 200 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute -bottom-2 left-0 w-full h-3.5 text-amber-400 pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 10C50 3 150 3 198 10"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-xl">
                Master any concept step-by-step with your 24/7 Socratic tutor, 7-day adaptive revision planner, and instant page-cited answers from your course lecture notes.
              </p>
            </div>

            {/* SchoolAI-style Rounded Big Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? "/dashboard/student" : "/auth"}
                className="inline-flex items-center justify-between gap-4 h-14 pl-7 pr-3.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/25 transition-all hover:-translate-y-0.5 group"
              >
                <span>Start Learning Free</span>
                <span className="h-9 w-9 rounded-full bg-sky-800 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
              </Link>

              <Link
                to="/courses"
                className="inline-flex items-center justify-between gap-4 h-14 pl-7 pr-3.5 rounded-full bg-card hover:bg-secondary/60 text-foreground border border-border/80 font-bold text-base shadow-sm transition-all hover:-translate-y-0.5 group"
              >
                <span>Enter Your Course Space</span>
                <span className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                </span>
              </Link>
            </div>

            {/* Student Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300">
                <Brain className="h-3.5 w-3.5 text-sky-600" />
                <span>Socratic Step-by-Step Hints</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <Flame className="h-3.5 w-3.5 text-emerald-600" />
                <span>7-Day Adaptive Study Plans</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                <span>PDF Lecture Notes Grounding</span>
              </div>
            </div>
          </div>

          {/* Right Column: SchoolAI-Style Animated Moving Masonry Picture Showcase (6 Cols) */}
          <div className="lg:col-span-6 relative h-[520px] sm:h-[580px] overflow-hidden rounded-[40px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <div className="grid grid-cols-2 gap-4 h-full">
              
              {/* Column 1: Moves Smoothly Upward */}
              <div className="flex flex-col gap-4 animate-marquee-up">
                {[...leftColCards, ...leftColCards].map((card, idx) => (
                  <div
                    key={`col1_${idx}`}
                    className={`relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-border/60 group shadow-md ${card.aspect}`}
                  >
                    <img
                      src={card.imgUrl}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-70 group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {card.category}
                      </span>
                      <h4 className="font-display font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                        {card.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Moves Smoothly Downward */}
              <div className="flex flex-col gap-4 animate-marquee-down">
                {[...rightColCards, ...rightColCards].map((card, idx) => (
                  <div
                    key={`col2_${idx}`}
                    className={`relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-border/60 group shadow-md ${card.aspect}`}
                  >
                    <img
                      src={card.imgUrl}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-70 group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                        {card.category}
                      </span>
                      <h4 className="font-display font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                        {card.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 2. STUDENT SUPERPOWERS & SPACES ── */}
      <section className="py-16 bg-secondary/40 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-sky-600 text-white font-bold text-xs px-3 py-1 rounded-full">
              Student AI Superpowers
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Everything you need to ace your courses
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              An intelligent learning companion tailored to your personal speed, strengths, and study goals.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Socratic AI Tutor",
                desc: "Never get stuck. Get hints, analogies, and derivations that guide you to the solution without spoiling answers.",
                icon: MessageSquare,
                badge: "Concept Guidance",
                color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
              },
              {
                title: "7-Day Revision Planner",
                desc: "Auto-balances your study load across deadlines, adds curated video links, and prevents last-minute cramming.",
                icon: Zap,
                badge: "Smart Schedules",
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              },
              {
                title: "Diagnostic Practice Quizzes",
                desc: "Adaptive practice tests that identify weak concepts before exams and boost your topic mastery score.",
                icon: FileCheck,
                badge: "Adaptive Quiz",
                color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
              },
              {
                title: "PDF Lecture Grounding",
                desc: "Upload slides and textbooks to chat directly with your course notes and receive exact page citations.",
                icon: BookOpen,
                badge: "Document RAG",
                color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
              },
            ].map((agent, i) => {
              const IconComp = agent.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${agent.color}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold rounded-full">
                        {agent.badge}
                      </Badge>
                    </div>
                    <h3 className="font-display font-bold text-base text-foreground">{agent.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. STUDENT CALL TO ACTION ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8 text-center">
        <div className="p-10 sm:p-16 rounded-[40px] bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to master your courses?
            </h2>
            <p className="text-sm sm:text-base text-sky-100 font-medium">
              Start chatting with your Socratic AI Tutor and generate your 7-day study plan today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 shadow-md transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/dashboard/student"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-sky-900/60 hover:bg-sky-900 text-white border border-white/20 font-bold text-sm transition-all"
            >
              Open Student Command Space
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
