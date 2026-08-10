import { useState } from "react";
import { Sparkles, Flame, BookOpen, Target, AlertTriangle, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiReasoningModal, type MetricExplanation } from "@/components/modals/AiReasoningModal";

interface AiDailyBriefingProps {
  userName: string;
  onAskTutor?: (prompt: string) => void;
  onOpenPlanner?: () => void;
}

export function AiDailyBriefing({ userName, onAskTutor, onOpenPlanner }: AiDailyBriefingProps) {
  const [activeReasoning, setActiveReasoning] = useState<MetricExplanation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const openExplanation = (exp: MetricExplanation) => {
    setActiveReasoning(exp);
    setModalOpen(true);
  };

  const streakExplanation: MetricExplanation = {
    metricName: "Learning Streak",
    metricValue: "5 Days Active",
    badgeVariant: "amber",
    whyItExists: "You completed at least one 15-minute study block or practice quiz every day for the past 5 consecutive days.",
    dataEvidence: [
      "Monday: 4 study tasks completed in Multivariable Calculus",
      "Tuesday: 6 AI Tutor practice questions solved in Biology 101",
      "Wednesday: 5 practice quiz questions completed in Physics 102",
      "Thursday: 8 flashcard revisions & 1 practice exam generated",
      "Friday (Today): Active session logged at 10:15 AM",
    ],
    suggestedSolution: "Keep your daily study rhythm going today to reach your 7-day consistency badge!",
    actionPrompt: "Generate a quick 5-minute quiz to maintain my streak",
  };

  const revisionExplanation: MetricExplanation = {
    metricName: "Concepts Need Revision",
    metricValue: "2 Key Topics Below 60%",
    badgeVariant: "rose",
    whyItExists: "Recent quiz submissions indicate mastery dropped below 60% on Partial Derivatives (45%) and Photosynthesis Light Reactions (55%).",
    dataEvidence: [
      "Math 201 Quiz #2: 2 incorrect answers on Gradient Vectors & Chain Rule",
      "Biol 101 Quiz #1: Missed 2 questions on ATP Synthesis in Thylakoid Membranes",
      "Last reviewed: 4 days ago (Retain decay detected)",
    ],
    suggestedSolution: "Run a targeted 10-minute diagnostic session on Partial Derivatives with your AI Tutor.",
    actionPrompt: "Explain Partial Derivatives and Gradient Vectors step by step",
  };

  const actionsExplanation: MetricExplanation = {
    metricName: "AI Recommended Actions",
    metricValue: "3 High-Priority Tasks",
    badgeVariant: "emerald",
    whyItExists: "Your AI Mentor prioritized 3 actions based on upcoming assignment due dates, prerequisite skill gaps, and retention decay curves.",
    dataEvidence: [
      "1. Class Assignment #1: Photosynthesis due tomorrow at 11:59 PM (High priority)",
      "2. Multivariable Calculus midterm in 5 days (Needs prerequisite review)",
      "3. Organic Chemistry progress is at 54% (Behind target schedule by 12%)",
    ],
    suggestedSolution: "Complete the Photosynthesis homework pre-check first, then execute the 7-day calculus study plan.",
    actionPrompt: "Help me solve Class Assignment #1 Photosynthesis",
  };

  return (
    <>
      <Card className="border border-emerald-600/30 bg-linear-to-r from-emerald-950/10 via-background to-sky-950/10 dark:from-emerald-950/30 dark:via-card dark:to-sky-950/30 shadow-md relative overflow-hidden">
        {/* Subtle Ambient Accent Glow */}
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
                Your AI Mentor analyzed your learning activity across all 6 courses:
              </p>
            </div>

            {/* Quick Action Button */}
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

          {/* 3 Metric Cards Row with [Why?] explanation triggers */}
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
                <span className="font-display text-2xl font-bold text-foreground">🔥 5 Days</span>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-bold">
                  Active Pace
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Completed daily study block 5 days in a row.
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
                <span className="font-display text-2xl font-bold text-foreground">📚 2 Concepts</span>
                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-bold">
                  Attention Required
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Partial Derivatives (45%) & Photosynthesis (55%)
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
                <span className="font-display text-2xl font-bold text-foreground">🎯 3 Tasks</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold">
                  Ready to Execute
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Homework pre-check, 7-day calculus plan & quiz review
              </p>
            </div>
          </div>

          {/* AI Guidance Action Items List */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Today's AI Guided Learning Pathway:</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-semibold">Priority Order</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <button
                onClick={() => onAskTutor?.("Review Class Assignment #1 Photosynthesis with me before submission")}
                className="p-3 rounded-xl bg-secondary/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-border/60 text-left transition-colors space-y-1 group"
              >
                <div className="font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
                  <span>1. Assignment Pre-Check</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Photosynthesis Assignment due tomorrow. Run Auto-Grader pre-check.
                </p>
              </button>

              <button
                onClick={() => onAskTutor?.("Quiz me on Partial Derivatives to improve my mastery score")}
                className="p-3 rounded-xl bg-secondary/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-border/60 text-left transition-colors space-y-1 group"
              >
                <div className="font-semibold text-foreground group-hover:text-rose-700 dark:group-hover:text-rose-400 flex items-center justify-between">
                  <span>2. Weakness Diagnostic</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Partial Derivatives dropped to 45%. Solve 3 adaptive questions.
                </p>
              </button>

              <button
                onClick={() => onOpenPlanner?.()}
                className="p-3 rounded-xl bg-secondary/40 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-border/60 text-left transition-colors space-y-1 group"
              >
                <div className="font-semibold text-foreground group-hover:text-sky-700 dark:group-hover:text-sky-400 flex items-center justify-between">
                  <span>3. Rebalance 7-Day Plan</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Organic Chemistry is behind target. AI updated your revision blocks.
                </p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Reasoning Explanation Dialog */}
      <AiReasoningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        explanation={activeReasoning}
        onActionClick={(prompt) => onAskTutor?.(prompt || "")}
      />
    </>
  );
}
