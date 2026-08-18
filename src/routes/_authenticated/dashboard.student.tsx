import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  Target,
  Sparkles,
  ArrowRight,
  Bot,
  FileCheck,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentErrorBoundary } from "@/components/common/ComponentErrorBoundary";

import { AiDailyBriefing } from "@/components/DashboardCards/AiDailyBriefing";
import { AiAgentHub } from "@/components/DashboardCards/AiAgentHub";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student Study Workspace — Scholar AI" },
      {
        name: "description",
        content: "Student workspace with interactive Course Spaces, real-time Socratic tutoring, and adaptive mastery analytics.",
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
  { id: "1", title: "Problem Set: Cellular Energy & ATP", course: "BIOL 101", due: "Tomorrow at 11:59 PM", status: "Pending Submission" },
  { id: "2", title: "Assignment #3: Gradient Vectors & Planes", course: "MATH 201", due: "In 3 Days", status: "In Progress" },
  { id: "3", title: "Physics Lab: Newton's Laws & Friction", course: "PHYS 102", due: "Completed", status: "Graded (94/100)" },
  { id: "4", title: "Coding Exercise: Big-O Time Complexity", course: "CS 101", due: "In 5 Days", status: "Pending" },
];

const columns: Column<UpcomingRow>[] = [
  { key: "title", header: "Task / Assignment", render: (r) => <span className="font-semibold text-xs text-foreground">{r.title}</span> },
  { key: "course", header: "Course", render: (r) => <Badge variant="outline" className="text-[10px] font-bold uppercase">{r.course}</Badge> },
  { key: "due", header: "Due Date", render: (r) => <span className="text-xs text-muted-foreground">{r.due}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge className={r.status.includes("Graded") ? "bg-emerald-700 text-white font-bold text-[10px]" : "bg-secondary text-secondary-foreground font-semibold text-[10px]"}>
        {r.status}
      </Badge>
    ),
  },
];

const courseSpaces = [
  {
    id: "biol_101",
    code: "BIOL 101",
    title: "Cell & Molecular Biology",
    instructor: "Dr. Elizabeth Vance",
    materials: 5,
    progress: 78,
    badgeColor: "bg-emerald-600 text-white",
    bannerGradient: "from-emerald-600/15 via-emerald-500/5 to-transparent",
    currentTopic: "Photosynthesis & Light Reactions",
  },
  {
    id: "math_201",
    code: "MATH 201",
    title: "Multivariable Calculus",
    instructor: "Prof. Alan Turing",
    materials: 6,
    progress: 85,
    badgeColor: "bg-sky-600 text-white",
    bannerGradient: "from-sky-600/15 via-sky-500/5 to-transparent",
    currentTopic: "Partial Derivatives & Chain Rule",
  },
  {
    id: "phys_102",
    code: "PHYS 102",
    title: "University Physics II",
    instructor: "Dr. Richard Feynman",
    materials: 4,
    progress: 62,
    badgeColor: "bg-purple-600 text-white",
    bannerGradient: "from-purple-600/15 via-purple-500/5 to-transparent",
    currentTopic: "Newtonian Mechanics & Friction",
  },
  {
    id: "cs_101",
    code: "CS 101",
    title: "Data Structures & Algorithms",
    instructor: "Prof. Donald Knuth",
    materials: 8,
    progress: 92,
    badgeColor: "bg-amber-600 text-white",
    bannerGradient: "from-amber-600/15 via-amber-500/5 to-transparent",
    currentTopic: "Asymptotic Complexity & Trees",
  },
];

function StudentDashboard() {
  const { profile, user } = useAuth();
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("spaces");

  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // Fetch real analytics data from the backend
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics(user?.id);

  const handleProfileUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* ── 1. DAILY FOCUS & PRIORITY NEXT STEP ── */}
      <ComponentErrorBoundary fallbackTitle="Daily Focus Overview">
        <AiDailyBriefing
          userName={name}
          analytics={analytics}
          isLoading={analyticsLoading}
          onAskTutor={(query) => setSelectedQuery(query)}
          onOpenPlanner={handleProfileUpdated}
        />
      </ComponentErrorBoundary>

      {/* ── 2. MAIN WORKSPACE WITH TABS & STICKY SOCRATIC TUTOR ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Course Spaces & Study Tabs (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
            <TabsList className="w-full grid grid-cols-4 p-1.5 rounded-full bg-secondary/80 border border-border/70 h-auto shadow-xs">
              <TabsTrigger value="spaces" className="rounded-full py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BookOpen className="h-3.5 w-3.5 text-sky-600" />
                <span>Course Spaces</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="rounded-full py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Target className="h-3.5 w-3.5 text-purple-600" />
                <span>Practice & Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="rounded-full py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <CalendarClock className="h-3.5 w-3.5 text-emerald-600" />
                <span>7-Day Plan</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-full py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                <span>Assignments</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: COURSE SPACES & STUDY TEAM */}
            <TabsContent value="spaces" className="space-y-6 mt-0">
              {/* Spaces Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                      Study Spaces
                    </h3>
                    <p className="text-xs text-muted-foreground">Each space contains course notes, lecture slides, and targeted practice.</p>
                  </div>
                  <Link to="/courses" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                    <span>All Spaces</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {courseSpaces.map((space) => (
                    <Link
                      key={space.id}
                      to="/courses/$courseId"
                      params={{ courseId: space.id }}
                      className={`group p-4 rounded-3xl border border-border/80 bg-card hover:border-sky-500/50 hover:shadow-md transition-all space-y-3 block cursor-pointer bg-gradient-to-br ${space.bannerGradient}`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge className={`${space.badgeColor} font-bold text-[10px] px-2.5 py-0.5 rounded-full`}>
                          {space.code}
                        </Badge>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Open Space</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">{space.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{space.instructor}</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-card/80 border border-border/60 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span className="text-foreground font-bold">Focus: {space.currentTopic}</span>
                          <span className="text-sky-600 dark:text-sky-400 font-bold">{space.progress}%</span>
                        </div>
                        {/* Clean Progress Bar */}
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-sky-600 rounded-full" style={{ width: `${space.progress}%` }} />
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                        <span>{space.materials} Documents Indexed</span>
                        <span className="text-xs font-semibold text-foreground">Active</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Study Assistants Team */}
              <ComponentErrorBoundary fallbackTitle="Study Assistants Team">
                <AiAgentHub
                  agentStatuses={analytics?.agent_statuses}
                  onAskTutor={(query) => setSelectedQuery(query)}
                  onOpenPlanner={handleProfileUpdated}
                  onOpenAssessment={handleProfileUpdated}
                />
              </ComponentErrorBoundary>

              {/* Weekly Study Progress Chart */}
              <ComponentErrorBoundary fallbackTitle="Weekly Study Progress">
                <ProgressChart
                  title="Weekly Study Engagement"
                  description="Completed study sessions, tutor dialogues, and quiz submissions across your courses."
                  data={[
                    { label: "Mon", value: 4 },
                    { label: "Tue", value: 6 },
                    { label: "Wed", value: 5 },
                    { label: "Thu", value: 8 },
                    { label: "Fri", value: 7 },
                    { label: "Sat", value: 9 },
                    { label: "Sun", value: 6 },
                  ]}
                  seriesLabel="Study Blocks Completed"
                />
              </ComponentErrorBoundary>
            </TabsContent>

            {/* TAB 2: ADAPTIVE PRACTICE & QUIZZES */}
            <TabsContent value="practice" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="Adaptive Practice Quizzes & Flashcards">
                <QuizGeneratorCard
                  studentId={user?.id || "demo_student"}
                  onProfileUpdated={handleProfileUpdated}
                />
              </ComponentErrorBoundary>

              <ComponentErrorBoundary fallbackTitle="Practice Exam Simulator">
                <ExamGeneratorCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>

              <ComponentErrorBoundary fallbackTitle="Mastery & Skill Diagnostics">
                <WeaknessTrackerCard
                  key={`weakness_${refreshKey}`}
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>
            </TabsContent>

            {/* TAB 3: 7-DAY STUDY PLANNER */}
            <TabsContent value="planner" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="7-Day Revision Planner">
                <StudyPlannerCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>

              <ComponentErrorBoundary fallbackTitle="Academic Mentor & Consistency Coach">
                <LearningCoachCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                  onRebalancePlan={handleProfileUpdated}
                />
              </ComponentErrorBoundary>
            </TabsContent>

            {/* TAB 4: ASSIGNMENTS & HOMEWORK */}
            <TabsContent value="assignments" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="Assignment Homework Coach">
                <AssignmentFeedbackCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>

              <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold tracking-tight">Active Assignments</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">4 Active</Badge>
                </div>
                <DataTable columns={columns} rows={upcoming} getRowId={(r) => r.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sticky Column: Socratic Tutor (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <ComponentErrorBoundary fallbackTitle="Socratic Tutor">
            <AiAssistantPanel
              title="Socratic Tutor"
              description="Interactive concept guidance, step-by-step math derivations, and course note citations."
              studentId={user?.id || "demo_student"}
              externalPrompt={selectedQuery}
              recentChatsData={analytics?.recent_conversations}
              indexedDocsData={analytics?.indexed_documents}
            />
          </ComponentErrorBoundary>
        </div>
      </div>
    </div>
  );
}
