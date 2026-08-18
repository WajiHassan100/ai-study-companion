import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  TrendingUp,
  Sparkles,
  Target,
  Brain,
  Zap,
  GraduationCap,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentErrorBoundary } from "@/components/common/ComponentErrorBoundary";

import { AiDailyBriefing } from "@/components/DashboardCards/AiDailyBriefing";
import { AiLearningIntelligence } from "@/components/DashboardCards/AiLearningIntelligence";
import { AiAgentHub } from "@/components/DashboardCards/AiAgentHub";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student Command Workspace — Scholar AI" },
      {
        name: "description",
        content: "Intelligent student dashboard with real-time AI mentoring, mastery diagnostics, and active study planning.",
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
  { key: "title", header: "Assignment", render: (r) => <span className="font-semibold text-xs text-foreground">{r.title}</span> },
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

const enrolledCourses = [
  {
    id: "biol_101",
    code: "BIOL 101",
    title: "Cell & Molecular Biology",
    instructor: "Dr. Elizabeth Vance",
    materials: 5,
    progress: 78,
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
  },
  {
    id: "math_201",
    code: "MATH 201",
    title: "Multivariable Calculus",
    instructor: "Prof. Alan Turing",
    materials: 6,
    progress: 85,
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
  },
  {
    id: "phys_102",
    code: "PHYS 102",
    title: "University Physics II",
    instructor: "Dr. Richard Feynman",
    materials: 4,
    progress: 62,
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
  },
  {
    id: "cs_101",
    code: "CS 101",
    title: "Data Structures & Algorithms",
    instructor: "Prof. Donald Knuth",
    materials: 8,
    progress: 92,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
  },
];

function StudentDashboard() {
  const { profile, user } = useAuth();
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const name = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // Fetch real analytics data from the backend
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics(user?.id);

  const handleProfileUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ── 1. UNIFIED TOP AI BRIEFING & INTELLIGENCE STRIP ── */}
      <ComponentErrorBoundary fallbackTitle="AI Mentor Daily Briefing">
        <AiDailyBriefing
          userName={name}
          analytics={analytics}
          isLoading={analyticsLoading}
          onAskTutor={(query) => setSelectedQuery(query)}
          onOpenPlanner={handleProfileUpdated}
        />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary fallbackTitle="AI Learning Intelligence">
        <AiLearningIntelligence
          studentId={user?.id || "demo_student"}
          analytics={analytics}
          isLoading={analyticsLoading}
          onAskTutor={(query) => setSelectedQuery(query)}
        />
      </ComponentErrorBoundary>

      {/* ── 2. MAIN WORKSPACE GRID WITH DOCKED AI ASSISTANT ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Interactive Workspace (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Workspace Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
            <TabsList className="w-full grid grid-cols-4 p-1.5 rounded-2xl bg-secondary/80 border border-border/80 h-auto">
              <TabsTrigger value="overview" className="rounded-xl py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Brain className="h-3.5 w-3.5 text-emerald-600" />
                <span>AI Agents</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="rounded-xl py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Target className="h-3.5 w-3.5 text-purple-600" />
                <span>Practice & Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="rounded-xl py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <CalendarClock className="h-3.5 w-3.5 text-sky-600" />
                <span>7-Day Plan</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-xl py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ClipboardList className="h-3.5 w-3.5 text-amber-600" />
                <span>Assignments</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI AGENT HUB & COURSES */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="AI Agent Command Team">
                <AiAgentHub
                  agentStatuses={analytics?.agent_statuses}
                  onAskTutor={(query) => setSelectedQuery(query)}
                  onOpenPlanner={handleProfileUpdated}
                  onOpenAssessment={handleProfileUpdated}
                />
              </ComponentErrorBoundary>

              {/* Enrolled Courses Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span>Course Knowledge Bases</span>
                  </h3>
                  <Link to="/courses" className="text-xs font-semibold text-emerald-700 hover:underline">
                    View All 6 Courses →
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {enrolledCourses.map((c) => (
                    <Link
                      key={c.id}
                      to="/courses/$courseId"
                      params={{ courseId: c.id }}
                      className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-600/50 hover:shadow-md transition-all space-y-2.5 block cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-700 text-white font-bold text-[10px]">{c.code}</Badge>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                          Open Notes →
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">{c.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.instructor}</p>
                      </div>
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{c.materials} Docs Indexed</span>
                        <span className="font-bold text-foreground">{c.progress}% Mastery</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Weekly Study Progress Chart */}
              <ComponentErrorBoundary fallbackTitle="Weekly AI Study Progress">
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
              </ComponentErrorBoundary>
            </TabsContent>

            {/* TAB 2: ADAPTIVE PRACTICE & EXAM SIMULATOR */}
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

            {/* TAB 4: ASSIGNMENTS & HOMEWORK COACH */}
            <TabsContent value="assignments" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="Assignment Homework Coach">
                <AssignmentFeedbackCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>

              <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold tracking-tight">Upcoming Deadlines</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">4 Active</Badge>
                </div>
                <DataTable columns={columns} rows={upcoming} getRowId={(r) => r.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sticky Column: Dedicated AI Study Assistant (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <ComponentErrorBoundary fallbackTitle="AI Study Assistant">
            <AiAssistantPanel
              title="AI Socratic Assistant"
              description="Ask questions, request study plans, or upload lecture notes for instant citations."
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
