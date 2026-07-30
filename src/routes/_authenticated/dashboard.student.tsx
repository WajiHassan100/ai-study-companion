import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarClock, ClipboardList, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
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
  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back, {name}</h1>
        <p className="mt-1 text-muted-foreground">
          Your study workspace. Course and assignment data is placeholder content for now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Enrolled courses" value="—" hint="Placeholder" icon={BookOpen} />
        <StatCard title="Open assignments" value="—" hint="Placeholder" icon={ClipboardList} />
        <StatCard title="Average grade" value="—" hint="Placeholder" icon={TrendingUp} />
        <StatCard title="Next deadline" value="—" hint="Placeholder" icon={CalendarClock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
          description="Will explain concepts, plan revision and summarise your notes."
          suggestions={["Explain this topic", "Build a revision plan", "Summarise my notes"]}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Upcoming work</h2>
        <DataTable columns={columns} rows={upcoming} getRowId={(r) => r.id} />
      </div>
    </div>
  );
}
