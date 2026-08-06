import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ClipboardList, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { WeaknessTrackerCard } from "@/components/DashboardCards/WeaknessTrackerCard";
import { StudyPlannerCard } from "@/components/DashboardCards/StudyPlannerCard";
import { QuizGeneratorCard } from "@/components/DashboardCards/QuizGeneratorCard";
import { ExamGeneratorCard } from "@/components/DashboardCards/ExamGeneratorCard";
import { AssignmentFeedbackCard } from "@/components/DashboardCards/AssignmentFeedbackCard";
import { LearningCoachCard } from "@/components/DashboardCards/LearningCoachCard";
import { ProgressChart } from "@/components/Charts/ProgressChart";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Scholar" },
      {
        name: "description",
        content: "Track your courses, upcoming assignments and grades in one study workspace.",
      },
      { property: "og:title", content: "Student Dashboard — Scholar" },
      {
        property: "og:description",
        content: "Track your courses, upcoming assignments and grades in one study workspace.",
      },
    ],
  }),
  component: StudentDashboard,
});

interface UpcomingRow {
  id: string;
  title: string;
  course: string;
  due: string;
  status: string;
}

const upcoming: UpcomingRow[] = [
  { id: "1", title: "Class Assignment #1: Photosynthesis & Light Reactions", course: "BIOL 101", due: "Tomorrow at 11:59 PM", status: "Pending Submission" },
  { id: "2", title: "Problem Set #3: Partial Derivatives & Gradient Vectors", course: "MATH 201", due: "In 3 Days", status: "In Progress" },
  { id: "3", title: "Lab Report #2: Newton's Motion & Inclined Friction", course: "PHYS 102", due: "Completed", status: "Graded (94/100)" },
  { id: "4", title: "Coding Problem Set #1: Big-O Complexity Analysis", course: "CS 101", due: "In 5 Days", status: "Pending" },
];

const columns: Column<UpcomingRow>[] = [
  { key: "title", header: "Assignment", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "course", header: "Course", render: (r) => <Badge variant="outline" className="text-[10px] font-bold uppercase">{r.course}</Badge> },
  { key: "due", header: "Due Date", render: (r) => <span className="text-xs text-muted-foreground">{r.due}</span> },
  { key: "status", header: "Status", render: (r) => <Badge className={r.status.includes("Graded") ? "bg-emerald-700 text-white font-bold" : "bg-secondary text-secondary-foreground"}>{r.status}</Badge> },
];

function StudentDashboard() {
  const { profile, user } = useAuth();
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const handleProfileUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back, {name}</h1>
        <p className="mt-1 text-muted-foreground">
          Your personalized AI study workspace. Tutor, Profiler, Planner & Quiz Agent active.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/courses/$courseId" params={{ courseId: "biol_101" }} className="block hover:opacity-90 transition-opacity cursor-pointer">
          <StatCard title="Enrolled courses" value="6" hint="Click to open course pages" icon={BookOpen} />
        </Link>
        <Link to="/assignments" className="block hover:opacity-90 transition-opacity cursor-pointer">
          <StatCard title="Open assignments" value="4" hint="Click to view & grade coursework" icon={ClipboardList} />
        </Link>
        <StatCard title="Average grade" value="91%" hint="Current term mastery" icon={TrendingUp} />
        <StatCard title="Next deadline" value="Tomorrow" hint="Photosynthesis Lab Due" icon={CalendarClock} />
      </div>

      {/* ── ENROLLED COURSES SECTION ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight">Enrolled Courses & RAG Knowledge Bases</h2>
          <span className="text-xs text-muted-foreground">Click any course to open syllabus, PDFs & Agent #5 Q&A</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              id: "biol_101",
              code: "BIOL 101",
              title: "Cell & Molecular Biology",
              instructor: "Dr. Elizabeth Vance",
              materials: 5,
              progress: 78,
            },
            {
              id: "math_201",
              code: "MATH 201",
              title: "Multivariable Calculus",
              instructor: "Prof. Alan Turing",
              materials: 6,
              progress: 85,
            },
            {
              id: "phys_102",
              code: "PHYS 102",
              title: "University Physics II",
              instructor: "Dr. Richard Feynman",
              materials: 4,
              progress: 62,
            },
            {
              id: "cs_101",
              code: "CS 101",
              title: "Data Structures & Algorithms",
              instructor: "Prof. Donald Knuth",
              materials: 8,
              progress: 92,
            },
            {
              id: "chem_101",
              code: "CHEM 101",
              title: "Organic Chemistry Mechanisms",
              instructor: "Dr. Linus Pauling",
              materials: 4,
              progress: 54,
            },
            {
              id: "hist_105",
              code: "HIST 105",
              title: "Modern History & Economics",
              instructor: "Prof. Adam Smith",
              materials: 5,
              progress: 70,
            },
          ].map((c) => (
            <Link
              key={c.id}
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="p-5 rounded-2xl border border-border/80 bg-card hover:bg-emerald-50/40 hover:border-emerald-300 transition-all shadow-xs space-y-3 block group"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-700 text-white font-bold text-xs">{c.code}</Badge>
                <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Open Course →
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground line-clamp-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.instructor}</p>
              </div>
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.materials} Documents Indexed</span>
                <span className="font-bold text-foreground">{c.progress}% Done</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LearningCoachCard
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
            onRebalancePlan={handleProfileUpdated}
          />
          <WeaknessTrackerCard
            key={`weakness_${refreshKey}`}
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <QuizGeneratorCard
            studentId={user?.id || "demo_student"}
            onProfileUpdated={handleProfileUpdated}
          />
          <ExamGeneratorCard
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <AssignmentFeedbackCard
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <StudyPlannerCard
            key={`planner_${refreshKey}`}
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <ProgressChart
            title="Weekly AI Study Progress"
            description="Completed study blocks & AI Tutor practice sessions across active courses."
            data={[
              { label: "Mon", value: 4 },
              { label: "Tue", value: 6 },
              { label: "Wed", value: 5 },
              { label: "Thu", value: 8 },
              { label: "Fri", value: 7 },
              { label: "Sat", value: 9 },
              { label: "Sun", value: 6 },
            ]}
            seriesLabel="Tasks & Quizzes Completed"
          />
        </div>

        <AiAssistantPanel
          title="AI Study Assistant"
          description="Ask concepts, request study plans, or get homework help anytime."
          suggestions={["Explain photosynthesis simply", "Build a math revision plan", "Summarise key history notes"]}
          studentId={user?.id}
          externalPrompt={selectedQuery}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Upcoming work</h2>
        <DataTable columns={columns} rows={upcoming} getRowId={(r) => r.id} />
      </div>
    </div>
  );
}

