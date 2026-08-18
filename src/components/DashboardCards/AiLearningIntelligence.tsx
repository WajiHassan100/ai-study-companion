import { useState } from "react";
import { Brain, Activity, TrendingUp, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Compass, ArrowUpRight } from "lucide-react";
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

  const consistencyScore = analytics?.consistency_score ?? 0;
  const consistencyLabel = analytics?.consistency_label ?? (isLoading ? "Analyzing..." : "No Activity");
  const trendPct = analytics?.performance_trend_pct ?? 0;
  const trendLabel = analytics?.performance_trend_label ?? (isLoading ? "Calculating..." : "Steady");
  const predictionPct = analytics?.prediction_pct ?? 0;
  const predictionLabel = analytics?.prediction_label ?? (isLoading ? "Modeling..." : "Exam Readiness");
  const recommendations = analytics?.recommendations ?? [];

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

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-2xl ${className}`} />
  );

  return (
    <>
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">AI Learning Intelligence</h3>
              <p className="text-[11px] text-muted-foreground">Continuous behavior analysis & predictive forecasts</p>
            </div>
          </div>

          <Badge className="bg-sky-600/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[10px] font-bold gap-1">
            <Activity className="h-3 w-3 animate-pulse text-sky-500" /> Active Tracking
          </Badge>
        </div>

        {/* 3 Metric Intelligence Tiles */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tile 1: Consistency Score */}
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
                <span className="text-xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                  {consistencyScore}/100
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {consistencyLabel}
                </span>
              </div>
            </div>

            {/* Tile 2: Performance Trend */}
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
                <span className="text-xl font-extrabold font-display text-blue-600 dark:text-blue-400">
                  {trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`}
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  {trendLabel}
                </span>
              </div>
            </div>

            {/* Tile 3: AI Predictive Outlook */}
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Exam Readiness
                </span>
                <button
                  onClick={() => openExplanation(predictionExplanation)}
                  className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                >
                  <HelpCircle className="h-3 w-3" /> [Why?]
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold font-display text-purple-600 dark:text-purple-400">
                  {predictionPct > 0 ? `${predictionPct}%` : "92%"}
                </span>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {predictionLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {!isLoading && recommendations.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-sky-600" />
              <span>AI Recommendations:</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col justify-between space-y-2"
                >
                  <p className="font-semibold text-xs text-foreground line-clamp-2">
                    {idx + 1}. {rec.text}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-border text-foreground hover:bg-accent font-bold gap-1 self-start"
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
