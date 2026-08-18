import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  CalendarClock,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
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
  onOpenMastery?: () => void;
}

export function AiAgentHub({
  agentStatuses,
  onAskTutor,
  onOpenPlanner,
  onOpenAssessment,
  onOpenMastery,
}: AiAgentHubProps) {
  const agents = [
    {
      id: "tutor",
      name: "Socratic Tutor",
      role: "Concept Guidance & Hints",
      icon: MessageSquare,
      themeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      accentBorder: "hover:border-emerald-500/40",
      description: "Guides you through challenging formulas, homework questions, and proofs step-by-step.",
      buttonText: "Ask Tutor",
      buttonAction: () => onAskTutor?.("Can you guide me through a concept step-by-step with an example?"),
      buttonClass: "bg-emerald-700 hover:bg-emerald-800 text-white",
      route: "/tutor",
    },
    {
      id: "planner",
      name: "Study Planner",
      role: "7-Day Revision Timetables",
      icon: CalendarClock,
      themeColor: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20",
      accentBorder: "hover:border-sky-500/40",
      description: "Creates customized 7-day study timetables tailored to your assignment deadlines and exam dates.",
      buttonText: "Generate Plan",
      buttonAction: () => onOpenPlanner?.(),
      buttonClass: "bg-sky-600 hover:bg-sky-700 text-white",
      route: "/agents/planner",
    },
    {
      id: "assessment",
      name: "Quiz & Exam Coach",
      role: "Adaptive Practice Tests",
      icon: FileCheck,
      themeColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
      accentBorder: "hover:border-purple-500/40",
      description: "Generates targeted practice quizzes and mock exams to identify exact knowledge gaps.",
      buttonText: "Start Practice",
      buttonAction: () => onOpenAssessment?.(),
      buttonClass: "bg-purple-700 hover:bg-purple-800 text-white",
      route: "/agents/quiz",
    },
    {
      id: "analytics",
      name: "Mastery Analytics",
      role: "Retention & Readiness Tracking",
      icon: TrendingUp,
      themeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      accentBorder: "hover:border-amber-500/40",
      description: "Monitors topic mastery, memory decay curves, and forecasts exam readiness.",
      buttonText: "View Mastery",
      buttonAction: () => onOpenMastery?.(),
      buttonClass: "bg-amber-700 hover:bg-amber-800 text-white",
      route: "/mastery",
    },
  ];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">Study Assistants</h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">4 Active</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Specialized learning assistants tailored to each part of your academic study cycle.
          </p>
        </div>

        <Link to="/system">
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1 border-border">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Architecture Map →</span>
          </Button>
        </Link>
      </div>

      {/* 4 Agent Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {agents.map((agent) => {
          const IconComp = agent.icon;

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl border border-border/80 bg-card ${agent.accentBorder} hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5 group`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${agent.themeColor}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground">{agent.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">● Ready</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={agent.buttonAction}
                  className={`flex-1 h-8 text-xs font-bold rounded-full ${agent.buttonClass} shadow-xs justify-between px-3.5`}
                >
                  <span>{agent.buttonText}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <Link
                  to={agent.route}
                  search={agent.route === "/tutor" ? { topic: undefined } : undefined}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  Open Page ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
