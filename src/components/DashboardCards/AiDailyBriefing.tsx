import { useState } from "react";
import { Sparkles, Flame, BookOpen, Target, ArrowRight, CheckCircle2, Clock, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardAnalytics } from "@/lib/api/analytics";

interface AiDailyBriefingProps {
  userName: string;
  analytics?: DashboardAnalytics;
  isLoading?: boolean;
  onAskTutor?: (prompt: string) => void;
  onOpenPlanner?: () => void;
  onOpenAssessment?: () => void;
  onOpenAssignments?: () => void;
}

export function AiDailyBriefing({
  userName,
  analytics,
  isLoading,
  onAskTutor,
  onOpenPlanner,
  onOpenAssessment,
  onOpenAssignments,
}: AiDailyBriefingProps) {
  // Time-aware greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const streakDays = analytics?.streak_days ?? 0;
  const weakTopics = analytics?.weak_topics ?? [];
  const actions = analytics?.recommended_actions ?? [];

  // Determine the ONE most important next action for the student
  const primaryAction = actions.length > 0
    ? actions[0]
    : streakDays === 0
      ? { title: "Start Today's Study Session", detail: "Complete a 15-minute concept review to build your learning streak.", prompt: "Let's review my key course concepts today" }
      : { title: "Generate 7-Day Study Plan", detail: "Balance your upcoming assignments and optimize retention.", prompt: "Generate my 7-day revision schedule" };

  const handlePrimaryClick = () => {
    const titleLower = primaryAction.title.toLowerCase();
    if (titleLower.includes("plan") || titleLower.includes("schedule")) {
      onOpenPlanner?.();
    } else if (titleLower.includes("quiz") || titleLower.includes("test") || titleLower.includes("practice")) {
      onOpenAssessment?.();
    } else if (titleLower.includes("assignment") || titleLower.includes("homework")) {
      onOpenAssignments?.();
    } else {
      onAskTutor?.(primaryAction.prompt || primaryAction.title);
    }
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6">
      {/* ── TOP: GREETING & PRIMARY NEXT ACTION (CLEAR HIERARCHY) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Today's Overview</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {greetingTime}, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here is your daily study focus based on your current courses and upcoming deadlines.
          </p>
        </div>

        {/* Highlighted Primary Action Card (Prominent Call to Action) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 lg:max-w-md w-full">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Primary Next Step
            </span>
            <h4 className="font-display font-bold text-sm text-foreground">{primaryAction.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{primaryAction.detail}</p>
          </div>
          <Button
            size="sm"
            onClick={handlePrimaryClick}
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 h-9 shadow-xs shrink-0 whitespace-nowrap gap-1.5 cursor-pointer"
          >
            <span>Start Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── METRICS STRIP (RESTRAINED, PURPOSEFUL, NO [WHY?] CLUTTER) ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Metric 1: Learning Streak */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Learning Streak</span>
            </span>
            <div className="font-display text-xl font-extrabold text-foreground">
              {streakDays} <span className="text-xs font-semibold text-muted-foreground">Days</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {streakDays > 0 ? "Daily consistency active" : "Start today to begin streak"}
            </p>
          </div>
          <button
            onClick={() => onAskTutor?.("Let's review key concepts to keep my streak active today")}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80 ${streakDays > 0 ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}
          >
            {streakDays > 0 ? "🔥 Active" : "Start Today →"}
          </button>
        </div>

        {/* Metric 2: Concepts Under Review */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-rose-500" />
              <span>Review Topics</span>
            </span>
            <div className="font-display text-xl font-extrabold text-foreground">
              {weakTopics.length} <span className="text-xs font-semibold text-muted-foreground">Concepts</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {weakTopics.length > 0 ? `${weakTopics[0]?.topic || "1 topic"} needs review` : "All topics above 60% mastery"}
            </p>
          </div>
          <button
            onClick={() => onOpenAssessment ? onOpenAssessment() : onAskTutor?.(weakTopics.length > 0 ? `Explain ${weakTopics[0]?.topic} step-by-step` : "Create a diagnostic practice quiz")}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80 ${weakTopics.length > 0 ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}
          >
            {weakTopics.length > 0 ? "Review Now →" : "On Track ✓"}
          </button>
        </div>

        {/* Metric 3: Scheduled Study Tasks */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-sky-500" />
              <span>Scheduled Tasks</span>
            </span>
            <div className="font-display text-xl font-extrabold text-foreground">
              {actions.length || 2} <span className="text-xs font-semibold text-muted-foreground">Tasks</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {actions.length > 0 ? actions[0]?.title : "Revision & quiz tasks"}
            </p>
          </div>
          <button
            onClick={() => onOpenPlanner?.()}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 cursor-pointer hover:bg-sky-500/20 transition-colors"
          >
            View Plan →
          </button>
        </div>
      </div>

      {/* ── RECOMMENDED PATHWAY CHIPS ── */}
      {actions.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-foreground">Suggested Study Pathway:</span>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {actions.slice(0, 2).map((act, i) => (
              <button
                key={i}
                onClick={() => {
                  const actLower = act.title.toLowerCase();
                  if (actLower.includes("plan")) onOpenPlanner?.();
                  else if (actLower.includes("quiz") || actLower.includes("practice")) onOpenAssessment?.();
                  else onAskTutor?.(act.prompt || act.title);
                }}
                className="p-3 rounded-2xl bg-card border border-border/80 hover:border-sky-500/40 hover:bg-secondary/40 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold text-foreground group-hover:text-sky-600 transition-colors">
                    {i + 1}. {act.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">{act.detail}</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
