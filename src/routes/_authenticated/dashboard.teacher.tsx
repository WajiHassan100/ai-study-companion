import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, GraduationCap, Users, CalendarClock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { TeacherAssistantCard } from "@/components/DashboardCards/TeacherAssistantCard";
import { ProgressChart } from "@/components/Charts/ProgressChart";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — Scholar" },
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

const classes: ClassRow[] = [
  { id: "1", name: "BIOL 101: Advanced Biology", students: "34 Students", nextSession: "Tomorrow 10:00 AM", status: "Active" },
  { id: "2", name: "MATH 201: Calculus", students: "28 Students", nextSession: "Wednesday 2:00 PM", status: "Active" },
];

const columns: Column<ClassRow>[] = [
  { key: "name", header: "Class", render: (r) => <span className="font-bold text-emerald-800">{r.name}</span> },
  { key: "students", header: "Enrolled Roster", render: (r) => r.students },
  { key: "next", header: "Next session", render: (r) => r.nextSession },
  { key: "status", header: "Status", render: (r) => <Badge className="bg-emerald-700 text-white text-xs">{r.status}</Badge> },
];

function TeacherDashboard() {
  const { profile, user } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Professor";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Good to see you, {name} 👋</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Teaching workspace & Agent #6 Teacher Assistant active. Draft lesson plans & auto-grade submissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active classes" value="2" hint="BIOL 101 & MATH 201" icon={GraduationCap} />
        <StatCard title="Total Students" value="62" hint="Across all rosters" icon={Users} />
        <StatCard title="Awaiting grading" value="3" hint="Pending reviews" icon={ClipboardCheck} />
        <StatCard title="Next session" value="Tomorrow" hint="10:00 AM BIOL 101" icon={CalendarClock} />
      </div>

      {/* Agent #6: Teacher Assistant Card Component */}
      <TeacherAssistantCard />

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
            ]}
            seriesLabel="Submissions"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">Your Active Classes</h2>
        <DataTable columns={columns} rows={classes} getRowId={(r) => r.id} />
      </div>
    </div>
  );
}

