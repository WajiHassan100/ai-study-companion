import { useState } from "react";
import { Brain, Activity, TrendingUp, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Compass, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiReasoningModal, type MetricExplanation } from "@/components/modals/AiReasoningModal";

interface AiLearningIntelligenceProps {
  studentId: string;
  onAskTutor?: (prompt: string) => void;
}

export function AiLearningIntelligence({ studentId, onAskTutor }: AiLearningIntelligenceProps) {
  const [activeReasoning, setActiveReasoning] = useState<MetricExplanation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openExplanation = (exp: MetricExplanation) => {
    setActiveReasoning(exp);
    setModalOpen(true);
  };

  // Explanation 1: Learning Consistency Score
  const consistencyExplanation: MetricExplanation = {
    metricName: "Consistency Score",
    metricValue: "88/100 (High Retention)",
    badgeVariant: "emerald",
    whyItExists: "Calculated by evaluating your login frequency, completed daily revision tasks, and spacing interval adherence.",
    dataEvidence: [
      "5 out of 7 days logged with active study time > 15 minutes",
      "0 missed assignment milestones in the past 14 days",
      "Retention Spacing Score: 90% optimal (revising concepts before decay)",
    ],
    suggestedSolution: "Maintain 15 minutes of study today to reach a 90+ Consistency Rating.",
    actionPrompt: "Schedule my study blocks for the remainder of the week",
  };

  // Explanation 2: Performance Trend
  const trendExplanation: MetricExplanation = {
    metricName: "Performance Trend",
    metricValue: "+12% Mastery Growth",
    badgeVariant: "blue",
    whyItExists: "Aggregated across all quiz scores, practice exam scores, and homework submissions over the last 14 days.",
    dataEvidence: [
      "Math 201 Practice Exam score improved from 72% -> 85%",
      "Physics 102 Lab Report graded at 94/100 (Top 10% of class)",
      "Biology 101 quiz accuracy increased by +15% after tutor sessions",
    ],
    suggestedSolution: "Focus on your remaining weak area (Partial Derivatives) to sustain this +12% trajectory.",
    actionPrompt: "Show me a detailed breakdown of my mastery growth by course",
  };

  // Explanation 3: AI Predictive Outlook
  const predictionExplanation: MetricExplanation = {
    metricName: "AI Prediction",
    metricValue: "94% Math 201 Exam Readiness",
    badgeVariant: "purple",
    whyItExists: "Machine learning predictive model analyzed your problem-solving speed, calculation accuracy, and derivative formula retention.",
    dataEvidence: [
      "92% accuracy on multivariable calculus problem sets",
      "Average problem solving speed: 2.4 minutes per numerical question (Optimal)",
      "Prerequisite mastery: 88% overall confidence level",
    ],
    suggestedSolution: "Simulate a timed 30-minute practice exam to lock in your A-grade outcome.",
    actionPrompt: "Generate a 30-minute MATH 201 timed practice exam",
  };

  return (
    <>
      <Card className="border border-sky-500/30 bg-card shadow-sm relative overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Brain className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                AI Learning Intelligence
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Continuous behavior analysis, risk forecasting & AI personalized predictions
            </CardDescription>
          </div>

          <Badge className="bg-sky-600 text-white text-[11px] font-bold gap-1 px-2.5">
            <Activity className="h-3 w-3 animate-pulse" /> Live Analysis Active
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 text-xs">
          {/* 3 Metric Intelligence Tiles with [Why?] triggers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tile 1: Consistency Score */}
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Consistency Score
                </span>
                <button
                  onClick={() => openExplanation(consistencyExplanation)}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="h-3 w-3" /> [Why?]
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                  88/100
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  High Retention
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                5 consecutive active study days logged.
              </p>
            </div>

            {/* Tile 2: Performance Trend */}
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Performance Trend
                </span>
                <button
                  onClick={() => openExplanation(trendExplanation)}
                  className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="h-3 w-3" /> [Why?]
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">
                  +12%
                </span>
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  Upward Mastery
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Calculus & Physics accuracy increased this week.
              </p>
            </div>

            {/* Tile 3: AI Predictive Outlook */}
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  AI Prediction
                </span>
                <button
                  onClick={() => openExplanation(predictionExplanation)}
                  className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="h-3 w-3" /> [Why?]
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-purple-600 dark:text-purple-400">
                  94%
                </span>
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                  Math 201 Exam Ready
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                Projected grade: A based on derivative accuracy.
              </p>
            </div>
          </div>

          {/* AI Personalized Recommendations Section */}
          <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <Compass className="h-4 w-4 text-sky-600" />
                <span>AI Personalized Mentor Recommendations:</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Updated 10m ago
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      1. Focus 20 minutes on Chain Rule derivations today to reach 90% topic mastery.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      AI detected 2 minor derivative algebra errors on your last calculus practice quiz.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-50 shrink-0 font-semibold gap-1"
                  onClick={() => onAskTutor?.("Practice Chain Rule derivations with me")}
                >
                  <span>Practice</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      2. Schedule BIOL 101 flashcard review session before tomorrow's deadline.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Photosynthesis assignment due in 24 hours. Pre-check available on your dashboard.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 shrink-0 font-semibold gap-1"
                  onClick={() => onAskTutor?.("Generate BIOL 101 flashcards on Photosynthesis Light Reactions")}
                >
                  <span>Flashcards</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      3. Your peak focus window is 7:00 PM – 9:00 PM; study blocks scheduled accordingly.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Activity log shows 35% higher quiz accuracy during evening study sessions.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 shrink-0 font-semibold gap-1"
                  onClick={() => onAskTutor?.("Optimize my 7-day study planner for evening focus hours")}
                >
                  <span>Optimize</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Reasoning Modal for Intelligence Metrics */}
      <AiReasoningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        explanation={activeReasoning}
        onActionClick={(prompt) => onAskTutor?.(prompt || "")}
      />
    </>
  );
}
