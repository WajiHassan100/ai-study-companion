import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scholar — Personal AI School Assistant" },
      {
        name: "description",
        content:
          "One workspace for students, teachers and administrators: accounts, roles and an AI study assistant.",
      },
      { property: "og:title", content: "Scholar — Personal AI School Assistant" },
      {
        property: "og:description",
        content:
          "One workspace for students, teachers and administrators: accounts, roles and an AI study assistant.",
      },
    ],
  }),
  component: Index,
});

const roleCards = [
  {
    icon: BookOpen,
    title: "Students",
    body: "Courses, assignments and grades in one view — with an AI study companion that plans your revision.",
    bullets: ["Personalised study plans", "Deadline tracking", "Instant concept explanations"],
  },
  {
    icon: Users,
    title: "Teachers",
    body: "Class overviews, rosters and grading queues, plus AI help drafting lessons and quizzes.",
    bullets: ["Roster management", "Grading queue", "Lesson & quiz drafting"],
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    body: "Manage every account, role and course from one console with live, permission-checked data.",
    bullets: ["Role assignment", "Course catalogue", "System-wide insight"],
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-emerald-50/20 to-background dark:from-emerald-950/20 dark:to-background border-b border-border/40 pb-16 pt-12 md:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-100/60 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 uppercase shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              AI AGENTS ARRIVING SOON
            </span>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl">
              The school workspace that{" "}
              <span className="text-emerald-700 dark:text-emerald-400">thinks</span>{" "}
              <span className="text-amber-700 dark:text-amber-500">alongside you</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg leading-relaxed">
              Scholar brings students, teachers and administrators into one role-aware workspace — with a personal AI assistant built into every screen.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 text-white font-semibold text-base py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all h-auto">
                <Link to="/auth" className="flex items-center gap-2">
                  Get started free <span>→</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white hover:bg-slate-50 text-slate-900 font-semibold border-slate-200 text-base py-3 px-8 rounded-xl shadow-xs h-auto">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 text-left pt-10 border-t border-emerald-900/10">
              <div>
                <div className="font-display text-4xl font-extrabold text-emerald-800 dark:text-emerald-400">3</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Role-aware workspaces</div>
              </div>
              <div>
                <div className="font-display text-4xl font-extrabold text-emerald-800 dark:text-emerald-400">100%</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Permission-checked data</div>
              </div>
              <div>
                <div className="font-display text-4xl font-extrabold text-emerald-800 dark:text-emerald-400">24/7</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Assistant availability</div>
              </div>
              <div>
                <div className="font-display text-4xl font-extrabold text-emerald-800 dark:text-emerald-400">1</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Unified school platform</div>
              </div>
            </div>

            {/* Dashboard Mockup Preview Component */}
            <div className="mt-14 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-6 shadow-xl dark:bg-slate-900 text-left">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 text-xs font-semibold text-slate-500">Student workspace</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">COURSES</div>
                  <div className="font-display text-2xl font-bold text-slate-900 mt-1">6</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OPEN WORK</div>
                  <div className="font-display text-2xl font-bold text-slate-900 mt-1">4</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AVERAGE</div>
                  <div className="font-display text-2xl font-bold text-slate-900 mt-1">88%</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NEXT DUE</div>
                  <div className="font-display text-2xl font-bold text-slate-900 mt-1">Fri</div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-display font-bold text-sm text-slate-900">AI Study Assistant</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-2.5 bg-slate-200/70 rounded-full w-full" />
                  <div className="h-2.5 bg-slate-200/70 rounded-full w-3/4" />
                </div>
                <Button size="sm" className="bg-emerald-800 text-white text-xs font-semibold rounded-lg px-4 h-8">
                  Generate AI plan
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl">
            Built for every role in the school
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {roleCards.map((card) => (
              <Card key={card.title} className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-800 text-white mb-4 shadow-xs">
                    <card.icon className="h-6 w-6" />
                  </span>
                  <CardTitle className="font-display text-2xl font-bold text-slate-900">{card.title}</CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-2 leading-relaxed">{card.body}</CardDescription>

                  <ul className="mt-6 space-y-2 pt-4 border-t border-slate-100 text-xs font-medium text-slate-700">
                    {card.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Card Section */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-16 text-center text-white shadow-xl md:px-12 md:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700/80 border border-emerald-500/40 text-white mb-6">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Create your account in seconds
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base text-emerald-100/90 leading-relaxed">
              Sign up as a student or teacher with email or Google. Administrator access is granted by an existing admin.
            </p>

            <div className="mt-8">
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base py-3 px-8 rounded-xl shadow-md h-auto border border-amber-500/50">
                <Link to="/auth" className="flex items-center gap-2">
                  Create an account <span>→</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs font-medium text-slate-500">
          Scholar — Personal AI School Assistant
        </div>
      </footer>
    </div>
  );
}

