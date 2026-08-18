import { Link } from "@tanstack/react-router";
import {
  Bot,
  Sparkles,
  Calendar,
  FileCheck,
  TrendingUp,
  MessageSquare,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgentStatus } from "@/lib/api/analytics";

interface AiAgentHubProps {
  agentStatuses?: Record<string, AgentStatus>;
  onAskTutor?: (prompt: string) => void;
  onOpenPlanner?: () => void;
  onOpenAssessment?: () => void;
}

export function AiAgentHub({
  agentStatuses,
  onAskTutor,
  onOpenPlanner,
  onOpenAssessment,
}: AiAgentHubProps) {
  const agents = [
    {
      id: "tutor",
      name: "AI Socratic Tutor",
      role: "Concept Guidance & Math Q&A",
      status: agentStatuses?.tutor?.status || "Online",
      icon: MessageSquare,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Explains complex concepts, breaks down math derivations, and provides socratic guidance.",
      buttonText: "Chat with Tutor",
      buttonAction: () => onAskTutor?.("Can you explain a concept step-by-step with an example?"),
      secondaryLink: "/tutor",
    },
    {
      id: "planner",
      name: "Learning Planner",
      role: "7-Day Revision Schedules",
      status: agentStatuses?.planner?.status || "Active",
      icon: Calendar,
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      description: "Creates personalized study timetables and balances daily revision blocks.",
      buttonText: "Generate Plan",
      buttonAction: () => onOpenPlanner?.(),
      secondaryLink: "/profile",
    },
    {
      id: "assessment",
      name: "Assessment Agent",
      role: "Adaptive Quizzes & Diagnostics",
      status: agentStatuses?.assessment?.status || "Online",
      icon: FileCheck,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      description: "Generates multi-format practice tests and pinpoints foundational skill gaps.",
      buttonText: "Practice Test",
      buttonAction: () => onOpenAssessment?.(),
      secondaryLink: "/mastery",
    },
    {
      id: "analytics",
      name: "Progress Analytics",
      role: "Behavior & Risk Forecasting",
      status: agentStatuses?.analytics?.status || "Active",
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "Tracks consistency scores, mastery growth trends, and forecasts exam readiness.",
      buttonText: "View Insights",
      buttonAction: () => onAskTutor?.("Show me a detailed breakdown of my learning progress and risk forecast"),
      secondaryLink: "/mastery",
    },
  ];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-800 text-white font-bold text-[10px] gap-1 px-2.5">
              <Bot className="h-3 w-3" />
              <span>AI Command Team</span>
            </Badge>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">4 Agents Operational</span>
          </div>
          <h3 className="font-display text-base font-bold text-foreground">Your Personal AI Assistants</h3>
        </div>

        <Link to="/system">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1 border-border">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Architecture Map →</span>
          </Button>
        </Link>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => {
          const IconComp = agent.icon;
          const isOnline = agent.status === "Online" || agent.status === "Active";

          return (
            <div
              key={agent.id}
              className="p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-600/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${agent.iconBg}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {agent.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-muted-foreground">{agent.role}</span>
                    </div>
                  </div>

                  <Badge
                    className={`text-[9px] font-bold gap-1 px-1.5 py-0 border ${
                      isOnline
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {agent.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  onClick={agent.buttonAction}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-7 gap-1 shadow-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{agent.buttonText}</span>
                </Button>

                <Link to={agent.secondaryLink}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs border-border"
                    title={`Open ${agent.name}`}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
