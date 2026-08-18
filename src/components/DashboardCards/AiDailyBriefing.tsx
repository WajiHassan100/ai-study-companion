import { useState } from "react";
import { Sparkles, Flame, BookOpen, Target, ArrowRight, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiReasoningModal, type MetricExplanation } from "@/components/modals/AiReasoningModal";
import type { DashboardAnalytics } from "@/lib/api/analytics";

interface AiDailyBriefingProps {
  userName: string;
  analytics?: DashboardAnalytics;
  isLoading?: boolean;
  onAskTutor?: (prompt: string) => void;
  onOpenPlanner?: () => void;
}

export function AiDailyBriefing({ userName, analytics, isLoading, onAskTutor, onOpenPlanner }: AiDailyBriefingProps) {
  const [activeReasoning, setActiveReasoning] = useState<MetricExplanation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const openExplanation = (exp: MetricExplanation) => {
    setActiveReasoning(exp);
    setModalOpen(true);
  };

  // Derive values from analytics (or fallback to zero/empty)
  const streakDays = analytics?.streak_days ?? 0;
  const streakSummary = analytics?.streak_summary ?? "Loading...";
  const weakTopics = analytics?.weak_topics ?? [];
  const actions = analytics?.recommended_actions ?? [];

  const streakExplanation: MetricExplanation = {
    metricName: "Learning Streak",
    metricValue: `${streakDays} Day${streakDays !== 1 ? "s" : ""} Active`,
    badgeVariant: "amber",
    whyItExists: streakSummary,
    dataEvidence: streakDays > 0
      ? [`You completed study tasks for ${streakDays} consecutive day${streakDays !== 1 ? "s" : ""}.`]
      : ["No consecutive study days detected. Start a session today!"],
    suggestedSolution: streakDays > 0
      ? `Keep your daily study rhythm going to reach a ${streakDays + 2}-day consistency badge!`
      : "Complete a 15-minute study block today to start your streak!",
    actionPrompt: "Generate a quick 5-minute quiz to maintain my streak",
  };

  const revisionExplanation: MetricExplanation = {
    metricName: "Concepts Need Revision",
    metricValue: `${weakTopics.length} Topic${weakTopics.length !== 1 ? "s" : ""} Below 60%`,
    badgeVariant: "rose",
    whyItExists: weakTopics.length > 0
      ? `Recent quiz submissions indicate mastery dropped below 60% on ${weakTopics.map((t) => `${t.topic} (${t.mastery_pct}%)`).join(" and ")}.`
      : "All topics are above 60% mastery — great work!",
    dataEvidence: weakTopics.length > 0
      ? weakTopics.map((t) => `${t.course}: ${t.topic} at ${t.mastery_pct}% mastery`)
      : ["No weak topics detected."],
    suggestedSolution: weakTopics.length > 0
      ? `Run a targeted diagnostic session on ${weakTopics[0]?.topic} with your AI Tutor.`
      : "Consider taking a practice exam to test your overall readiness.",
    actionPrompt: weakTopics.length > 0
      ? `Explain ${weakTopics[0]?.topic} step by step`
      : "Generate a comprehensive practice exam",
  };

  const actionsExplanation: MetricExplanation = {
    metricName: "AI Recommended Actions",
    metricValue: `${actions.length} Task${actions.length !== 1 ? "s" : ""}`,
    badgeVariant: "emerald",
    whyItExists: `Your AI Mentor prioritized ${actions.length} actions based on your data.`,
    dataEvidence: actions.map((a, i) => `${i + 1}. ${a.title}: ${a.detail}`),
    suggestedSolution: actions.length > 0
      ? `Start with: ${actions[0]?.title} — ${actions[0]?.detail}`
      : "No urgent actions. Keep up the great work!",
    actionPrompt: actions[0]?.prompt || "Analyze my current study progress",
  };

  // Skeleton shimmer component
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-xl ${className}`} />
  );

  return (
    <>
      <Card className="border border-emerald-600/30 bg-linear-to-r from-emerald-950/10 via-background to-sky-950/10 dark:from-emerald-950/30 dark:via-card dark:to-sky-950/30 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-6 space-y-5 relative">
          {/* Header & Personalized Greeting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-700 text-white font-bold text-[11px] gap-1 px-2.5 py-0.5">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Mentor Daily Briefing</span>
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {greetingTime}, {userName} 👋
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isLoading
                  ? "Your AI Mentor is analyzing your learning activity..."
                  : "Your AI Mentor analyzed your learning activity across your courses:"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => onAskTutor?.("Analyze my current study progress and give me today's top 3 priorities")}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs gap-1.5 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Mentor Briefing</span>
              </Button>
            </div>
          </div>

          {/* 3 Metric Cards Row */}
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Metric 1: Learning Streak */}
              <div className="p-3.5 rounded-2xl bg-card border border-amber-500/30 hover:border-amber-500/50 transition-all space-y-2 shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Flame className="h-4 w-4" />
                    <span>Learning Streak</span>
                  </span>
                  <button
                    onClick={() => openExplanation(streakExplanation)}
                    className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    <HelpCircle className="h-3 w-3" /> [Why?]
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-foreground">
                    🔥 {streakDays} Day{streakDays !== 1 ? "s" : ""}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-bold">
                    {streakDays > 0 ? "Active Pace" : "Start Today"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {streakSummary}
                </p>
              </div>

              {/* Metric 2: Concepts Need Revision */}
              <div className="p-3.5 rounded-2xl bg-card border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-2 shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>Revision Needed</span>
                  </span>
                  <button
                    onClick={() => openExplanation(revisionExplanation)}
                    className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-0.5"
                  >
                    <HelpCircle className="h-3 w-3" /> [Why?]
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-foreground">
                    📚 {weakTopics.length} Concept{weakTopics.length !== 1 ? "s" : ""}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-bold">
                    {weakTopics.length > 0 ? "Attention Required" : "All Good ✓"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {weakTopics.length > 0
                    ? weakTopics.map((t) => `${t.topic} (${t.mastery_pct}%)`).join(" & ")
                    : "All topics above 60% mastery!"}
                </p>
              </div>

              {/* Metric 3: AI Recommended Actions */}
              <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/30 hover:border-emerald-500/50 transition-all space-y-2 shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span>AI Actions</span>
                  </span>
                  <button
                    onClick={() => openExplanation(actionsExplanation)}
                    className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-0.5"
                  >
                    <HelpCircle className="h-3 w-3" /> [Why?]
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-foreground">
                    🎯 {actions.length} Task{actions.length !== 1 ? "s" : ""}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold">
                    Ready to Execute
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {actions.map((a) => a.title).join(", ") || "No actions needed right now."}
                </p>
              </div>
            </div>
          )}

          {/* AI Guidance Action Items */}
          {!isLoading && actions.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Today's AI Guided Learning Pathway:</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">Priority Order</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                {actions.map((action, idx) => (
                  <button
                    key={action.title}
                    onClick={() => action.prompt ? onAskTutor?.(action.prompt) : onOpenPlanner?.()}
                    className="p-3 rounded-xl bg-secondary/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-border/60 text-left transition-colors space-y-1 group"
                  >
                    <div className="font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
                      <span>{idx + 1}. {action.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {action.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no actions and not loading */}
          {!isLoading && actions.length === 0 && (
            <div className="p-4 rounded-2xl bg-card border border-dashed border-border/60 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">No action items yet</p>
              <p>Complete your first study session or quiz to get personalized AI recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AiReasoningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        explanation={activeReasoning}
        onActionClick={(prompt) => onAskTutor?.(prompt || "")}
      />
    </>
  );
}
