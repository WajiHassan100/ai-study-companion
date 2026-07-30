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
    body: "A single place for courses, assignments and grades, with an AI study companion alongside.",
  },
  {
    icon: Users,
    title: "Teachers",
    body: "Class overviews, rosters and grading queues, plus AI help drafting lessons and quizzes.",
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    body: "Manage every account and role from one console with live, permission-checked data.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="mx-auto max-w-5xl px-4 py-24 text-center md:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              AI agents arriving soon
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              The school workspace that
              <span className="text-accent"> thinks alongside you</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Scholar brings students, teachers and administrators into one calm, role-aware
              workspace — with a personal AI assistant built in.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight">
            Built for every role in the school
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roleCards.map((card) => (
              <Card key={card.title} className="border-border/70">
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                    <card.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="mt-3 font-display text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Create your account in seconds
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Sign up as a student or teacher with email or Google. Administrator access is granted
              by an existing admin.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link to="/auth">Create an account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">
          <CardContent className="p-0">Scholar — Personal AI School Assistant</CardContent>
        </div>
      </footer>
    </div>
  );
}
