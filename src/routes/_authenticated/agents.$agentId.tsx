import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAgent, AGENT_CATEGORY_LABEL, AGENT_STATUS_LABEL } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { LearningCoachCard } from "@/components/DashboardCards/LearningCoachCard";
import { StudyPlannerCard } from "@/components/DashboardCards/StudyPlannerCard";
import { QuizGeneratorCard } from "@/components/DashboardCards/QuizGeneratorCard";
import { ExamGeneratorCard } from "@/components/DashboardCards/ExamGeneratorCard";
import { AssignmentFeedbackCard } from "@/components/DashboardCards/AssignmentFeedbackCard";
import { WeaknessTrackerCard } from "@/components/DashboardCards/WeaknessTrackerCard";
import { TeacherAssistantCard } from "@/components/DashboardCards/TeacherAssistantCard";

export const Route = createFileRoute("/_authenticated/agents/$agentId")({
  loader: ({ params }) => {
    const agent = getAgent(params.agentId);
    if (!agent) throw notFound();
    return { agentId: agent.id };
  },
  head: ({ params }) => {
    const agent = getAgent(params.agentId);
    const title = agent ? `${agent.name} — Scholar` : "Agent workspace — Scholar";
    const description = agent?.description ?? "Run a specialist AI agent in a dedicated workspace.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AgentWorkspace,
});

function AgentWorkspace() {
  const { agentId } = Route.useParams();
  const { user } = useAuth();
  const agent = getAgent(agentId);
  const studentId = user?.id || "demo_student";

  if (!agent) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <EmptyState
          icon={Sparkles}
          title="Unknown agent"
          description="This agent isn't part of your workspace yet."
          action={
            <Button asChild size="sm">
              <Link to="/agents">Back to Agents Hub</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const Icon = agent.icon;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-xs font-semibold">
        <Link to="/agents">
          <ArrowLeft className="h-3.5 w-3.5" />
          Agents Hub
        </Link>
      </Button>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-3xl border border-border/70 bg-card p-5 shadow-xs sm:flex sm:flex-wrap sm:justify-between sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Agent #{agent.number} · {AGENT_CATEGORY_LABEL[agent.category]}
            </p>
            <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">{agent.name}</h1>
            <p className="truncate text-sm text-muted-foreground">{agent.tagline}</p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/10 text-xs font-bold text-primary">
          {AGENT_STATUS_LABEL[agent.status]}
        </Badge>
      </header>

      <AgentSurface agentId={agent.id} studentId={studentId} />
    </div>
  );
}

function AgentSurface({ agentId, studentId }: { agentId: string; studentId: string }) {
  switch (agentId) {
    case "coach":
      return <LearningCoachCard studentId={studentId} onAskTutor={() => {}} onRebalancePlan={() => {}} />;
    case "planner":
      return <StudyPlannerCard studentId={studentId} onAskTutor={() => {}} />;
    case "quiz":
      return <QuizGeneratorCard studentId={studentId} onProfileUpdated={() => {}} />;
    case "exam":
      return <ExamGeneratorCard studentId={studentId} onAskTutor={() => {}} />;
    case "feedback":
      return <AssignmentFeedbackCard studentId={studentId} onAskTutor={() => {}} />;
    case "profiler":
      return <WeaknessTrackerCard studentId={studentId} onAskTutor={() => {}} />;
    case "teacher":
      return <TeacherAssistantCard />;
    default:
      return (
        <EmptyState
          icon={Sparkles}
          title="This agent runs in its own workspace"
          description="Open the Tutor Workspace or a course page to use it."
          action={
            <Button asChild size="sm">
              <Link to="/tutor">Open Tutor Workspace</Link>
            </Button>
          }
        />
      );
  }
}
