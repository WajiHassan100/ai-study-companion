import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardCheck,
  GraduationCap,
  Users,
  CalendarClock,
  Award,
  AlertCircle,
  Sparkles,
  Loader2,
  BookOpen,
  FileCheck,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TeacherAssistantCard } from "@/components/DashboardCards/TeacherAssistantCard";
import { ProgressChart } from "@/components/Charts/ProgressChart";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL, apiFetch } from "@/lib/api/client";

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
      <div className="mx-auto max-w-2xl py-16 px-6 text-center space-y-5 rounded-3xl border border-amber-500/30 bg-card shadow-lg my-12">
        <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">Educator Workspace</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You are currently signed in as a <strong>Student</strong>. Switch to a Teacher account or use the quick role switcher on the login page.
          </p>
        </div>
        <Button asChild className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-8 py-2.5">
          <Link to="/dashboard/student">Go to Student Dashboard →</Link>
        </Button>
      </div>
    );
  }

  const handleQuickAutoGrade = async (sub: SubmissionRow) => {
    setGradingId(sub.id);
    try {
      const res = await apiFetch(`${API_BASE_URL}/ai/teacher/grade`, {
        method: "POST",
        body: JSON.stringify({
          assignment_title: sub.assignment,
          submission_text: `${sub.student}'s submission for ${sub.assignment}. Demonstrates strong core understanding with minor errors in equations.`,
        }),
      });

      if (!res.ok) throw new Error("Grading endpoint returned error status");
      const data = await res.json();
      toast.success(`Graded ${sub.student}'s ${sub.assignment}: ${data.letter_grade} (${data.score}%)`);
    } catch (err: any) {
      toast.error(err.message || "Auto-grading failed. Check backend connection.");
    } finally {
      setGradingId(null);
    }
  };

  const classColumns: Column<ClassRow>[] = [
    { key: "name", header: "Class / Course", render: (r) => <span className="font-bold text-xs">{r.name}</span> },
    { key: "students", header: "Enrolled", render: (r) => <Badge variant="outline" className="text-[10px] font-semibold">{r.students}</Badge> },
    { key: "nextSession", header: "Next Scheduled Session", render: (r) => <span className="text-xs text-muted-foreground">{r.nextSession}</span> },
    { key: "status", header: "Status", render: (r) => <Badge className="bg-emerald-700 text-white text-[10px]">{r.status}</Badge> },
  ];

  const submissionColumns: Column<SubmissionRow>[] = [
    { key: "student", header: "Student", render: (r) => <span className="font-semibold text-xs text-foreground">{r.student}</span> },
    { key: "assignment", header: "Assignment", render: (r) => <span className="text-xs text-muted-foreground">{r.assignment}</span> },
    { key: "submittedAt", header: "Submitted", render: (r) => <span className="text-xs text-muted-foreground">{r.submittedAt}</span> },
    {
      key: "status",
      header: "Action",
      render: (r) => (
        <Button
          size="sm"
          disabled={gradingId === r.id}
          onClick={() => handleQuickAutoGrade(r)}
          className="h-7 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-semibold gap-1"
        >
          {gradingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span>Auto-Grade with AI</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── HEADER BANNER ── */}
      <Card className="border border-blue-600/30 bg-linear-to-r from-blue-950/10 via-background to-emerald-950/10 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-700 text-white font-bold text-[11px] gap-1 px-2.5">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Educator Command Suite</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-blue-700 border-blue-500/30">
                Active Term
              </Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome, {name} 👋
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Monitor active classes, review auto-graded submissions, and draft structured lesson timelines.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/courses">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-border">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                <span>Manage Course Materials</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── METRICS TILES ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Enrolled</span>
          <div className="text-2xl font-bold font-display text-foreground">92 Students</div>
          <p className="text-[10px] text-muted-foreground">Across 3 active courses</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Submissions</span>
          <div className="text-2xl font-bold font-display text-amber-600">3 Ungraded</div>
          <p className="text-[10px] text-muted-foreground">Auto-grader ready</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Average Class Mastery</span>
          <div className="text-2xl font-bold font-display text-emerald-600">84.2%</div>
          <p className="text-[10px] text-emerald-600 font-semibold">+4.1% this week</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Lesson Plans</span>
          <div className="text-2xl font-bold font-display text-purple-600">12 Generated</div>
          <p className="text-[10px] text-muted-foreground">Structured timelines</p>
        </div>
      </div>

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* AI Teacher Assistant Card */}
          <TeacherAssistantCard />

          {/* Pending Submissions Table */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Recent Student Submissions</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">1-click AI grading with rubric evaluation</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">3 Pending</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <DataTable columns={submissionColumns} rows={pendingSubmissions} getRowId={(r) => r.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Active Classes & Class Weakness Diagnostics */}
        <div className="space-y-6">
          {/* Class Weakness Diagnostic Engine */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>Class Concept Bottlenecks</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Topics where students struggle most on quizzes</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {classWeaknesses.map((w, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="truncate">{w.topic}</span>
                    <Badge className={w.severity === "High" ? "bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]" : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"}>
                      {w.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{w.course}</span>
                    <span className="font-bold text-foreground">{w.struggle} struggling</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Classes */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>Assigned Classes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <DataTable columns={classColumns} rows={classes} getRowId={(r) => r.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
