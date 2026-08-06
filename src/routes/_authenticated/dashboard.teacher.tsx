import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, GraduationCap, Users, CalendarClock, Award, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { TeacherAssistantCard } from "@/components/DashboardCards/TeacherAssistantCard";
import { ProgressChart } from "@/components/Charts/ProgressChart";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — Scholar AI" },
      {
        name: "description",
        content: "Manage your classes, rosters, lesson plans and assignments from a single workspace.",
      },
    ],
  }),
  component: TeacherDashboard,
});

interface ClassRow {
  id: string;
  name: string;
  students: string;
  nextSession: string;
  status: string;
}

interface SubmissionRow {
  id: string;
  student: string;
  assignment: string;
  submittedAt: string;
  status: string;
}

const classes: ClassRow[] = [
  { id: "1", name: "BIOL 101: Advanced Biology", students: "34 Students", nextSession: "Tomorrow 10:00 AM", status: "Active" },
  { id: "2", name: "MATH 201: Calculus", students: "28 Students", nextSession: "Wednesday 2:00 PM", status: "Active" },
  { id: "3", name: "PHYS 101: General Physics", students: "30 Students", nextSession: "Thursday 11:30 AM", status: "Active" },
];

const pendingSubmissions: SubmissionRow[] = [
  { id: "sub_1", student: "Waji ul Hassan", assignment: "Photosynthesis Lab Report", submittedAt: "Today 11:45 AM", status: "Needs Grading" },
  { id: "sub_2", student: "Sarah Jenkins", assignment: "Directional Derivatives Essay", submittedAt: "Yesterday 4:20 PM", status: "Needs Grading" },
  { id: "sub_3", student: "Alex Rivera", assignment: "Newton's Laws Calculation", submittedAt: "Yesterday 9:10 AM", status: "Needs Grading" },
];

const classWeaknesses = [
  { topic: "Thylakoid Light & ATP Synthase", course: "BIOL 101", struggle: "42% Students", severity: "High" },
  { topic: "Directional Derivatives & Gradient Vector", course: "MATH 201", struggle: "38% Students", severity: "Medium" },
  { topic: "Rotational Torque & Angular Momentum", course: "PHYS 101", struggle: "29% Students", severity: "Low" },
];

function TeacherDashboard() {
  const { profile, user, role } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Professor";
  const [gradingId, setGradingId] = useState<string | null>(null);

  if (role === "student") {
    return (
      <div className="mx-auto max-w-2xl py-16 px-6 text-center space-y-5 rounded-3xl border border-red-500/30 bg-card shadow-lg my-12">
        <div className="h-16 w-16 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">Access Denied — Educator Authorization Required</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You are currently signed in with a <strong>Student Account</strong>. The Teacher Portal & Agent #6 Auto-Grader require an educator login.
          </p>
        </div>
        <Button asChild className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-8 py-2.5">
          <Link to="/dashboard/student">Return to Student Workspace →</Link>
        </Button>
      </div>
    );
  }

  const handleQuickAutoGrade = async (sub: SubmissionRow) => {
    setGradingId(sub.id);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/teacher/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_title: sub.assignment,
          submission_text: `${sub.student}'s submission for ${sub.assignment}. Demonstrates strong core understanding with minor errors in equations.`,
        }),
      });
      const data = await res.json();
      toast.success(`Graded ${sub.student}'s ${sub.assignment}: ${data.letter_grade} (${data.score}%)`);
    } catch (err) {
      toast.error("Auto-grading failed.");
    } finally {
      setGradingId(null);
    }
  };

  const classColumns: Column<ClassRow>[] = [
    { key: "name", header: "Class", render: (r) => <span className="font-bold text-emerald-800 dark:text-emerald-400">{r.name}</span> },
    { key: "students", header: "Enrolled Roster", render: (r) => r.students },
    { key: "next", header: "Next session", render: (r) => r.nextSession },
    { key: "status", header: "Status", render: (r) => <Badge className="bg-emerald-700 text-white text-xs">{r.status}</Badge> },
  ];

  const submissionColumns: Column<SubmissionRow>[] = [
    { key: "student", header: "Student", render: (r) => <span className="font-bold text-foreground">{r.student}</span> },
    { key: "assignment", header: "Assignment", render: (r) => r.assignment },
    { key: "submittedAt", header: "Submitted", render: (r) => <span className="text-xs text-muted-foreground">{r.submittedAt}</span> },
    {
      key: "action",
      header: "Action",
      render: (r) => (
        <Button
          size="sm"
          onClick={() => handleQuickAutoGrade(r)}
          disabled={gradingId === r.id}
          className="h-8 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg gap-1.5"
        >
          {gradingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span>Auto-Grade Agent #6</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Good to see you, {name} 👋</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Teaching workspace & Agent #6 Teacher Assistant active. Draft lesson plans & auto-grade submissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active classes" value="3" hint="BIOL 101, MATH 201, PHYS 101" icon={GraduationCap} />
        <StatCard title="Total Students" value="92" hint="Across all rosters" icon={Users} />
        <StatCard title="Awaiting grading" value="3" hint="Pending reviews" icon={ClipboardCheck} />
        <StatCard title="Next session" value="Tomorrow" hint="10:00 AM BIOL 101" icon={CalendarClock} />
      </div>

      {/* Agent #6: Teacher Assistant Card Component */}
      <TeacherAssistantCard />

      {/* Pending Submissions Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-500" /> Pending Student Submissions
          </h2>
          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-700 bg-amber-50">
            3 Ready to Grade
          </Badge>
        </div>
        <DataTable columns={submissionColumns} rows={pendingSubmissions} getRowId={(r) => r.id} />
      </div>

      {/* Class Concept Weakness Radar */}
      <Card className="border-border/80 shadow-xs rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" /> Class Concept Weakness Matrix (Agent #2 Data)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Top concept areas where your enrolled students are struggling based on Socratic Q&A interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {classWeaknesses.map((w, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{w.course}</span>
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold">{w.severity} Impact</Badge>
                </div>
                <h4 className="font-bold text-xs text-foreground">{w.topic}</h4>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">
                  {w.struggle} struggling
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <ProgressChart
            title="Class Assignment Submissions This Week"
            description="Tracking student submissions across active courses."
            data={[
              { label: "Mon", value: 12 },
              { label: "Tue", value: 18 },
              { label: "Wed", value: 24 },
              { label: "Thu", value: 15 },
              { label: "Fri", value: 30 },
              { label: "Sat", value: 22 },
              { label: "Sun", value: 19 },
            ]}
            seriesLabel="Submissions"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">Your Active Classes</h2>
        <DataTable columns={classColumns} rows={classes} getRowId={(r) => r.id} />
      </div>
    </div>
  );
}
