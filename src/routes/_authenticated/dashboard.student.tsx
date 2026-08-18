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
  ArrowRight,
  Flame,
  Bot,
  Compass,
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
      { title: "Student Spaces & Mission Control — Scholar AI" },
      {
        name: "description",
        content: "SchoolAI-inspired student workspace with interactive Course Spaces, real-time Socratic AI tutoring, and adaptive mastery analytics.",
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
  { id: "1", title: "Class Space Mission: Cellular Energy & ATP", course: "BIOL 101", due: "Tomorrow at 11:59 PM", status: "Pending Submission" },
  { id: "2", title: "Problem Set #3: Gradient Vectors & Tangent Planes", course: "MATH 201", due: "In 3 Days", status: "In Progress" },
  { id: "3", title: "Lab Space: Newton's Laws & Friction", course: "PHYS 102", due: "Completed", status: "Graded (94/100)" },
  { id: "4", title: "Coding Mission: Big-O Time Complexity", course: "CS 101", due: "In 5 Days", status: "Pending" },
];

const columns: Column<UpcomingRow>[] = [
  { key: "title", header: "Mission / Task", render: (r) => <span className="font-semibold text-xs text-foreground">{r.title}</span> },
  { key: "course", header: "Space", render: (r) => <Badge variant="outline" className="text-[10px] font-bold uppercase">{r.course}</Badge> },
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

const schoolAiSpaces = [
  {
    id: "biol_101",
    code: "BIOL 101",
    title: "Cell & Molecular Biology Space",
    instructor: "Dr. Elizabeth Vance",
    materials: 5,
    progress: 78,
    badgeColor: "bg-emerald-600 text-white",
    bannerGradient: "from-emerald-600/15 via-emerald-500/5 to-transparent",
    dotTopic: "Photosynthesis & Light Reactions",
  },
  {
    id: "math_201",
    code: "MATH 201",
    title: "Multivariable Calculus Space",
    instructor: "Prof. Alan Turing",
    materials: 6,
    progress: 85,
    badgeColor: "bg-sky-600 text-white",
    bannerGradient: "from-sky-600/15 via-sky-500/5 to-transparent",
    dotTopic: "Partial Derivatives & Chain Rule",
  },
  {
    id: "phys_102",
    code: "PHYS 102",
    title: "University Physics II Space",
    instructor: "Dr. Richard Feynman",
    materials: 4,
    progress: 62,
    badgeColor: "bg-purple-600 text-white",
    bannerGradient: "from-purple-600/15 via-purple-500/5 to-transparent",
    dotTopic: "Newtonian Mechanics & Vectors",
  },
  {
    id: "cs_101",
    code: "CS 101",
    title: "Data Structures & Algorithms Space",
    instructor: "Prof. Donald Knuth",
    materials: 8,
    progress: 92,
    badgeColor: "bg-amber-600 text-white",
    bannerGradient: "from-amber-600/15 via-amber-500/5 to-transparent",
    dotTopic: "Asymptotic Complexity & Trees",
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
      {/* ── 1. SCHOOLAI-STYLE MISSION CONTROL HERO BRIEFING ── */}
      <ComponentErrorBoundary fallbackTitle="Mission Control Briefing">
        <AiDailyBriefing
          userName={name}
          analytics={analytics}
          isLoading={analyticsLoading}
          onAskTutor={(query) => setSelectedQuery(query)}
          onOpenPlanner={handleProfileUpdated}
        />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary fallbackTitle="Learning Intelligence">
        <AiLearningIntelligence
          studentId={user?.id || "demo_student"}
          analytics={analytics}
          isLoading={analyticsLoading}
          onAskTutor={(query) => setSelectedQuery(query)}
        />
      </ComponentErrorBoundary>

      {/* ── 2. MAIN WORKSPACE WITH TABS & STICKY DOT AI ASSISTANT ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: SchoolAI Spaces & Tooling Tabs (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
            <TabsList className="w-full grid grid-cols-4 p-1.5 rounded-full bg-secondary/80 border border-border/70 h-auto shadow-xs">
              <TabsTrigger value="spaces" className="rounded-full py-2 font-bold text-xs gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BookOpen className="h-3.5 w-3.5 text-sky-600" />
                <span>My Spaces</span>
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
                <span>Missions</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SCHOOLAI SPACES & AI AGENTS */}
            <TabsContent value="spaces" className="space-y-6 mt-0">
              {/* Spaces Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <span>Interactive Learning Spaces</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Each space contains course notes, RAG documents, and a dedicated Socratic Dot AI.</p>
                  </div>
                  <Link to="/courses" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                    <span>All Spaces</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {schoolAiSpaces.map((space) => (
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
                          <span>Enter Space</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">{space.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{space.instructor}</p>
                      </div>

                      <div className="p-2 rounded-2xl bg-card/80 border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1 text-foreground font-bold">
                            <Bot className="h-3 w-3 text-sky-600" /> Dot AI Topic:
                          </span>
                          <span>{space.progress}% Mastery</span>
                        </div>
                        <p className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold line-clamp-1">
                          {space.dotTopic}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                        <span>{space.materials} Documents Indexed</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">🟢 Active Dot AI</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* AI Agent Command Team */}
              <ComponentErrorBoundary fallbackTitle="AI Agent Command Team">
                <AiAgentHub
                  agentStatuses={analytics?.agent_statuses}
                  onAskTutor={(query) => setSelectedQuery(query)}
                  onOpenPlanner={handleProfileUpdated}
                  onOpenAssessment={handleProfileUpdated}
                />
              </ComponentErrorBoundary>

              {/* Weekly Study Progress Chart */}
              <ComponentErrorBoundary fallbackTitle="Weekly AI Study Progress">
                <ProgressChart
                  title="Weekly Learning Space Engagement"
                  description="Completed study blocks, AI dialogues, and quiz submissions across active spaces."
                  data={[
                    { label: "Mon", value: 4 },
                    { label: "Tue", value: 6 },
                    { label: "Wed", value: 5 },
                    { label: "Thu", value: 8 },
                    { label: "Fri", value: 7 },
                    { label: "Sat", value: 9 },
                    { label: "Sun", value: 6 },
                  ]}
                  seriesLabel="Space Missions Completed"
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

            {/* TAB 4: MISSIONS & ASSIGNMENTS */}
            <TabsContent value="assignments" className="space-y-6 mt-0">
              <ComponentErrorBoundary fallbackTitle="Assignment Homework Coach">
                <AssignmentFeedbackCard
                  studentId={user?.id || "demo_student"}
                  onAskTutor={(query) => setSelectedQuery(query)}
                />
              </ComponentErrorBoundary>

              <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold tracking-tight">Active Classroom Missions</h3>
                  <Badge variant="outline" className="text-[10px] font-bold">4 Active</Badge>
                </div>
                <DataTable columns={columns} rows={upcoming} getRowId={(r) => r.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sticky Column: SchoolAI-Style Socratic Dot AI Companion (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <ComponentErrorBoundary fallbackTitle="AI Study Companion">
            <AiAssistantPanel
              title="Dot AI Socratic Companion"
              description="Ask questions, request worked derivations, or search uploaded lecture notes."
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
