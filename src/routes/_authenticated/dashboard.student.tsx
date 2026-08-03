import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ClipboardList, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { WeaknessTrackerCard } from "@/components/DashboardCards/WeaknessTrackerCard";
import { StudyPlannerCard } from "@/components/DashboardCards/StudyPlannerCard";
import { QuizGeneratorCard } from "@/components/DashboardCards/QuizGeneratorCard";
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
  { id: "1", title: "Essay: Industrial Revolution", course: "History", due: "Coming soon", status: "Placeholder" },
  { id: "2", title: "Problem set 4", course: "Mathematics", due: "Coming soon", status: "Placeholder" },
  { id: "3", title: "Lab report", course: "Chemistry", due: "Coming soon", status: "Placeholder" },
];

const columns: Column<UpcomingRow>[] = [
  { key: "title", header: "Assignment", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "course", header: "Course", render: (r) => r.course },
  { key: "due", header: "Due", render: (r) => r.due },
  { key: "status", header: "Status", render: (r) => <Badge variant="outline">{r.status}</Badge> },
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
        <Link to="/courses/biol_101" className="block hover:opacity-90 transition-opacity cursor-pointer">
          <StatCard title="Enrolled courses" value="3" hint="Click to open course pages" icon={BookOpen} />
        </Link>
        <StatCard title="Open assignments" value="4" hint="Active coursework" icon={ClipboardList} />
        <StatCard title="Average grade" value="88%" hint="Current term" icon={TrendingUp} />
        <StatCard title="Next deadline" value="Fri" hint="Lab Report Due" icon={CalendarClock} />
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
              title: "Advanced Molecular Biology",
              instructor: "Dr. Sarah Jenkins",
              materials: 3,
              progress: 68,
            },
            {
              id: "math_201",
              code: "MATH 201",
              title: "Calculus & Linear Algebra",
              instructor: "Prof. Robert Vance",
              materials: 4,
              progress: 82,
            },
            {
              id: "phys_102",
              code: "PHYS 102",
              title: "Physics of Motion & Dynamics",
              instructor: "Dr. Elena Rostova",
              materials: 2,
              progress: 54,
            },
          ].map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
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
          <WeaknessTrackerCard
            key={`weakness_${refreshKey}`}
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <QuizGeneratorCard
            studentId={user?.id || "demo_student"}
            onProfileUpdated={handleProfileUpdated}
          />
          <StudyPlannerCard
            key={`planner_${refreshKey}`}
            studentId={user?.id || "demo_student"}
            onAskTutor={(query) => setSelectedQuery(query)}
          />
          <ProgressChart
            title="Weekly study progress"
            description="Sample data — replace once assignment tracking is live."
            data={[
              { label: "Mon", value: 0 },
              { label: "Tue", value: 0 },
              { label: "Wed", value: 0 },
              { label: "Thu", value: 0 },
              { label: "Fri", value: 0 },
            ]}
            seriesLabel="Tasks done"
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

