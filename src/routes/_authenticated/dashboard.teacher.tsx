import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, GraduationCap, Users, CalendarClock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { ProgressChart } from "@/components/Charts/ProgressChart";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — Scholar" },
      {
        name: "description",
        content: "Manage your classes, rosters and assignments from a single teaching workspace.",
      },
      { property: "og:title", content: "Teacher Dashboard — Scholar" },
      {
        property: "og:description",
        content: "Manage your classes, rosters and assignments from a single teaching workspace.",
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

const classes: ClassRow[] = [
  { id: "1", name: "Mathematics 10A", students: "—", nextSession: "Coming soon", status: "Placeholder" },
  { id: "2", name: "Physics 11B", students: "—", nextSession: "Coming soon", status: "Placeholder" },
];

const columns: Column<ClassRow>[] = [
  { key: "name", header: "Class", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "students", header: "Students", render: (r) => r.students },
  { key: "next", header: "Next session", render: (r) => r.nextSession },
  { key: "status", header: "Status", render: (r) => <Badge variant="outline">{r.status}</Badge> },
];

function TeacherDashboard() {
  const { profile, user } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Good to see you, {name}</h1>
        <p className="mt-1 text-muted-foreground">
          Teaching workspace. Class and grading data is placeholder content for now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active classes" value="—" hint="Placeholder" icon={GraduationCap} />
        <StatCard title="Students" value="—" hint="Placeholder" icon={Users} />
        <StatCard title="Awaiting grading" value="—" hint="Placeholder" icon={ClipboardCheck} />
        <StatCard title="Next session" value="—" hint="Placeholder" icon={CalendarClock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProgressChart
            title="Submissions this week"
            description="Sample data — replace once assignments are live."
            data={[
              { label: "Mon", value: 0 },
              { label: "Tue", value: 0 },
              { label: "Wed", value: 0 },
              { label: "Thu", value: 0 },
              { label: "Fri", value: 0 },
            ]}
            seriesLabel="Submissions"
          />
        </div>
        <AiAssistantPanel
          title="AI Teaching Assistant"
          description="Will draft lesson plans, generate quizzes and summarise class performance."
          suggestions={["Draft a lesson plan", "Generate a quiz", "Summarise class results"]}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Your classes</h2>
        <DataTable columns={columns} rows={classes} getRowId={(r) => r.id} />
      </div>
    </div>
  );
}
