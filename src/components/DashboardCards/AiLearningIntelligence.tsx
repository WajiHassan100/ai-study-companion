import { useState } from "react";
import { Brain, Activity, TrendingUp, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Compass, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiReasoningModal, type MetricExplanation } from "@/components/modals/AiReasoningModal";
import type { DashboardAnalytics } from "@/lib/api/analytics";

interface AiLearningIntelligenceProps {
  studentId: string;
  analytics?: DashboardAnalytics;
  isLoading?: boolean;
  onAskTutor?: (prompt: string) => void;
}

export function AiLearningIntelligence({
  studentId,
  analytics,
  isLoading,
  onAskTutor,
}: AiLearningIntelligenceProps) {
  const [activeReasoning, setActiveReasoning] = useState<MetricExplanation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openExplanation = (exp: MetricExplanation) => {
    setActiveReasoning(exp);
    setModalOpen(true);
  };

  // Metrics from real analytics or defaults
  const consistencyScore = analytics?.consistency_score ?? 0;
  const consistencyLabel = analytics?.consistency_label ?? (isLoading ? "Analyzing..." : "No Activity");
  const trendPct = analytics?.performance_trend_pct ?? 0;
  const trendLabel = analytics?.performance_trend_label ?? (isLoading ? "Calculating..." : "Steady");
  const predictionPct = analytics?.prediction_pct ?? 0;
  const predictionLabel = analytics?.prediction_label ?? (isLoading ? "Modeling..." : "Exam Readiness");
  const recommendations = analytics?.recommendations ?? [];

  // Explanation 1: Learning Consistency Score
  const consistencyExplanation: MetricExplanation = {
    metricName: "Consistency Score",
    metricValue: `${consistencyScore}/100 (${consistencyLabel})`,
    badgeVariant: consistencyScore >= 75 ? "emerald" : consistencyScore >= 50 ? "amber" : "rose",
    whyItExists: "Calculated by evaluating your login frequency, completed daily revision tasks, and spacing interval adherence.",
    dataEvidence: [
      analytics?.streak_summary || "Tracking recent daily study sessions",
      `Retention Spacing Score: ${consistencyScore}% optimal`,
      consistencyScore >= 70 ? "Consistent study pattern detected" : "More frequent study sessions recommended",
    ],
    suggestedSolution: consistencyScore >= 80
      ? "Maintain your current daily schedule to preserve high retention."
      : "Complete at least 15 minutes of study today to increase consistency.",
    actionPrompt: "Schedule my study blocks for the remainder of the week",
  };

  // Explanation 2: Performance Trend
  const trendExplanation: MetricExplanation = {
    metricName: "Performance Trend",
    metricValue: `${trendPct >= 0 ? "+" : ""}${trendPct}% ${trendLabel}`,
    badgeVariant: trendPct >= 0 ? "blue" : "rose",
    whyItExists: "Aggregated across all quiz scores, practice exam scores, and homework submissions over the last 14 days.",
    dataEvidence: [
      `Score delta: ${trendPct >= 0 ? "+" : ""}${trendPct}% relative to previous evaluation period`,
      `Trend classification: ${trendLabel}`,
      "Calculated continuously by the Performance Analytics engine",
    ],
    suggestedSolution: trendPct >= 0
      ? "Sustain this trajectory by tackling advanced practice problems."
      : "Schedule a review session on low-scoring topics to reverse the trend.",
    actionPrompt: "Show me a detailed breakdown of my mastery growth by course",
  };

  // Explanation 3: AI Predictive Outlook
  const predictionExplanation: MetricExplanation = {
    metricName: "AI Prediction",
    metricValue: `${predictionPct}% ${predictionLabel}`,
    badgeVariant: predictionPct >= 80 ? "purple" : "amber",
    whyItExists: "Machine learning predictive model analyzed your problem-solving accuracy, quiz scores, and concept retention.",
    dataEvidence: [
      `Overall projected readiness: ${predictionPct}%`,
      `Status: ${predictionLabel}`,
      "Based on weighted recent assessment accuracy",
    ],
    suggestedSolution: predictionPct >= 85
      ? "Simulate a timed 30-minute practice exam to lock in your top grade outcome."
      : "Take an adaptive quiz on weak topics to boost exam readiness.",
    actionPrompt: "Generate a 30-minute timed practice exam",
  };

  // Skeleton shimmer placeholder
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-xl ${className}`} />
  );

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
          {/* 3 Metric Intelligence Tiles */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : (
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
                    {consistencyScore}/100
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {consistencyLabel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {analytics?.streak_summary || "Calculated from study logs."}
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
                    {trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    {trendLabel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {trendPct >= 0 ? "Quiz accuracy increased across active courses." : "Review recommended to boost accuracy."}
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
                    {predictionPct > 0 ? `${predictionPct}%` : "N/A"}
                  </span>
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                    {predictionLabel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {predictionPct >= 80 ? "Projected outcome: High Mastery" : "Complete practice quizzes to calibrate."}
                </p>
              </div>
            </div>
          )}

          {/* AI Personalized Recommendations Section */}
          {!isLoading && recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                  <Compass className="h-4 w-4 text-sky-600" />
                  <span>AI Personalized Mentor Recommendations:</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Live Engine
                </span>
              </div>

              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-xs">
                          {idx + 1}. {rec.text}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {rec.detail}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-50 shrink-0 font-semibold gap-1"
                      onClick={() => onAskTutor?.(rec.prompt)}
                    >
                      <span>{rec.action}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && recommendations.length === 0 && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-dashed border-border text-center text-[11px] text-muted-foreground">
              Complete more assessments to unlock personalized AI mentor recommendations.
            </div>
          )}
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
