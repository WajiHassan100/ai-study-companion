import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AiAgentHubProps {
  onAskTutor?: (prompt: string) => void;
  onOpenPlanner?: () => void;
  onOpenAssessment?: () => void;
}

export function AiAgentHub({ onAskTutor, onOpenPlanner, onOpenAssessment }: AiAgentHubProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const agents = [
    {
      id: "tutor",
      name: "AI Socratic Tutor",
      role: "Concept Explanation & Q&A",
      status: "Online",
      statusVariant: "emerald",
      icon: MessageSquare,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Explains complex concepts, breaks down step-by-step math problems, and provides socratic guidance on demand.",
      recentActivity: "Answered 4 Calculus questions & generated worked examples 20m ago",
      buttonText: "Chat with Tutor",
      buttonAction: () => onAskTutor?.("Can you explain a concept step-by-step with an example?"),
      secondaryLink: "/tutor",
    },
    {
      id: "planner",
      name: "Learning Planner",
      role: "Schedule & Workload Rebalancer",
      status: "Active",
      statusVariant: "sky",
      icon: Calendar,
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      description: "Creates personalized 7-day study schedules, balances daily revision blocks, and adjusts to your focus hours.",
      recentActivity: "Rebalanced 7-day revision schedule for MATH 201 & BIOL 101 1h ago",
      buttonText: "Generate Study Plan",
      buttonAction: () => onOpenPlanner?.(),
      secondaryLink: "/profile",
    },
    {
      id: "assessment",
      name: "Assessment & Diagnostics",
      role: "Adaptive Quizzes & Exam Simulator",
      status: "Online",
      statusVariant: "purple",
      icon: FileCheck,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      description: "Generates multi-format practice tests (MCQs, Numerical, Conceptual), grades homework, and pinpoints skill bottlenecks.",
      recentActivity: "Graded Quiz #2 & updated mastery score for Partial Derivatives 3h ago",
      buttonText: "Create Practice Test",
      buttonAction: () => onOpenAssessment?.(),
      secondaryLink: "/mastery",
    },
    {
      id: "analytics",
      name: "Progress Analytics",
      role: "Behavior & Risk Forecasting",
      status: "Active",
      statusVariant: "blue",
      icon: TrendingUp,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "Tracks consistency scores, monitors mastery growth trends, and forecasts exam readiness with AI risk models.",
      recentActivity: "Forecasted 94% Math 201 exam readiness based on 14-day quiz accuracy",
      buttonText: "View Learning Insights",
      buttonAction: () => {},
      secondaryLink: "/mastery",
    },
  ];

  return (
    <Card className="border border-emerald-600/30 bg-card shadow-sm relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Bot className="w-48 h-48 text-primary" />
      </div>

      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-800 text-white font-bold text-[11px] gap-1 px-2.5 py-0.5">
                <Bot className="h-3.5 w-3.5" />
                <span>AI Agent Command Team</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                4 Agents Active
              </Badge>
            </div>
            <CardTitle className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2 pt-0.5">
              Your Personal AI Assistant Team
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              A dedicated team of specialized AI agents continuously analyzing, planning, tutoring, and assessing your education.
            </CardDescription>
          </div>

          <Link to="/system">
            <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-border hover:bg-accent shrink-0">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>View System Architecture →</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {/* Banner Tagline */}
        <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>"You have an autonomous team of AI assistants working for your academic success."</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-semibold shrink-0 hidden md:inline">
            🟢 All 4 Systems Operational
          </span>
        </div>

        {/* 4 Agent Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map((agent) => {
            const IconComp = agent.icon;

            return (
              <div
                key={agent.id}
                className="p-4 rounded-2xl border border-border/70 bg-card hover:border-emerald-600/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                {/* Header: Icon, Name, Role & Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${agent.iconBg}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {agent.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {agent.role}
                        </span>
                      </div>
                    </div>

                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold gap-1 px-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {agent.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {agent.description}
                  </p>
                </div>

                {/* Footer: Recent Activity & Action Button */}
                <div className="space-y-2.5 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Activity className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{agent.recentActivity}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <Button
                      size="sm"
                      onClick={agent.buttonAction}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs h-8 gap-1.5 shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{agent.buttonText}</span>
                    </Button>

                    <Link to={agent.secondaryLink}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border"
                        title={`Open ${agent.name} Workspace`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
