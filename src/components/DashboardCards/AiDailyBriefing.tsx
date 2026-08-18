import { useState } from "react";
import { Sparkles, Flame, BookOpen, Target, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
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

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-2xl ${className}`} />
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-5 relative">
          {/* Header & Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-800 text-white font-bold text-[10px] gap-1 px-2.5 py-0.5">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Daily Briefing</span>
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {greetingTime}, {userName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {isLoading
                  ? "AI Mentor is analyzing your active course progress..."
                  : "Your AI Mentor analyzed your learning patterns across your active courses:"}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => onAskTutor?.("Analyze my current study progress and give me today's top 3 priorities")}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs gap-1.5 h-9 px-4 rounded-xl shadow-xs shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Briefing</span>
            </Button>
          </div>

          {/* 3 Metric Cards Row */}
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Metric 1: Learning Streak */}
              <div className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-colors border border-border/60 space-y-1.5">
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
                  <Badge variant="outline" className="text-[10px] font-bold text-amber-700 dark:text-amber-300 border-amber-500/30">
                    {streakDays > 0 ? "Active" : "Start Today"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {streakSummary}
                </p>
              </div>

              {/* Metric 2: Revision Needed */}
              <div className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-colors border border-border/60 space-y-1.5">
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
                  <Badge variant="outline" className="text-[10px] font-bold text-rose-700 dark:text-rose-300 border-rose-500/30">
                    {weakTopics.length > 0 ? "Needs Review" : "All Good ✓"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {weakTopics.length > 0
                    ? weakTopics.map((t) => `${t.topic} (${t.mastery_pct}%)`).join(" & ")
                    : "All topics above 60% mastery!"}
                </p>
              </div>

              {/* Metric 3: AI Actions */}
              <div className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-colors border border-border/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span>AI Recommended</span>
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
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                    Ready
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {actions.map((a) => a.title).join(", ") || "No urgent tasks."}
                </p>
              </div>
            </div>
          )}

          {/* AI Guided Pathway Action Chips */}
          {!isLoading && actions.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Today's Recommended Pathway:</span>
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {actions.map((action, idx) => (
                  <button
                    key={action.title}
                    onClick={() => (action.prompt ? onAskTutor?.(action.prompt) : onOpenPlanner?.())}
                    className="p-3 rounded-2xl bg-card hover:bg-emerald-500/10 border border-border/80 hover:border-emerald-600/40 text-left transition-all space-y-1 group cursor-pointer"
                  >
                    <div className="font-bold text-xs text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
                      <span>{idx + 1}. {action.title}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {action.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AiReasoningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        explanation={activeReasoning}
        onActionClick={(prompt) => onAskTutor?.(prompt || "")}
      />
    </>
  );
}
