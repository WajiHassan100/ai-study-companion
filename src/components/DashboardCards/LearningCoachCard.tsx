import { useState, useEffect } from "react";
import { Compass, Sparkles, RefreshCw, AlertTriangle, TrendingUp, ShieldAlert, ArrowUpRight, Calendar, CheckCircle2, Sliders } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLearningCoachInsights, type LearningCoachResponse } from "@/lib/api/coach";

interface LearningCoachCardProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
  onRebalancePlan?: () => void;
}

export function LearningCoachCard({ studentId, onAskTutor, onRebalancePlan }: LearningCoachCardProps) {
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState<LearningCoachResponse | null>({
    student_id: studentId,
    timeframe: "weekly",
    coach_title: "AI Mentor Insights & Strategic Guidance",
    consistency_score: 82,
    missed_sessions_count: 1,
    performance_recommendations: [
      "You improved by +12% in Mathematics this week, but Physics practice decreased by -5%.",
      "Great job maintaining 4 consecutive days of active Socratic Tutor practice!",
    ],
    problem_detection: [
      "You missed 1 planned study session on Multivariable Calculus partial derivatives.",
      "Biology photosynthesis quiz score dropped slightly below your target threshold.",
    ],
    strategic_improvements: [
      "Reallocate 45 mins from Biology to Calculus before your upcoming problem set deadline.",
      "Review derivative chain rule worked examples with the Socratic AI Tutor.",
    ],
    planner_rebalance_action: {
      suggested_action: "rebalance_5_day_plan",
      reasoning: "Rebalance 5-day study plan to prioritize Calculus derivatives.",
    },
    socratic_tutor_prompts: [
      "Explain how partial derivatives relate to 3D slope directional vectors",
    ],
  });
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");

  const fetchInsights = async (targetTimeframe = timeframe) => {
    setLoading(true);
    try {
      const data = await getLearningCoachInsights(studentId, targetTimeframe);
      setCoachData(data);
    } catch (err) {
      console.error("Failed to fetch coach insights:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-sky-500/30 bg-sky-500/5 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-sky-600 dark:text-sky-400 animate-pulse" />
            AI Learning Coach Agent (Agent #9)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Long-term AI mentor monitoring consistency, trends, missed sessions & strategic study plan rebalancing
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold border-sky-500/30 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40"
          onClick={() => fetchInsights(timeframe)}
          disabled={loading}
        >
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-sky-600" />}
          <span>{loading ? "Analyzing..." : "Refresh Insights"}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Timeframe Controls & Consistency Score Bar */}
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>Study Consistency:</span>
              <Badge className="bg-sky-600 text-white font-bold">{coachData?.consistency_score || 82}% Score</Badge>
            </div>

            {coachData?.missed_sessions_count ? (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                <span>{coachData.missed_sessions_count} Missed Sessions</span>
              </Badge>
            ) : null}
          </div>

          <Progress value={coachData?.consistency_score || 82} className="h-2 bg-secondary" />
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-sky-600" />
            <span>Agent #9 is analyzing performance trends, missed sessions & study balances...</span>
          </div>
        ) : coachData ? (
          <div className="space-y-3">
            {/* 1. Recommendations Panel */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span>1. Weekly Progress Recommendations:</span>
              </div>
              <div className="space-y-1.5">
                {coachData.performance_recommendations.map((rec, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 text-xs font-medium text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Problem Detection Alert */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>2. Detected Problems & Consistency Gaps:</span>
              </div>
              <div className="space-y-1.5">
                {coachData.problem_detection.map((prob, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 text-xs font-medium text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Strategic Improvements & 1-Click Rebalance Button */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                <span>3. Strategic Improvements & Study Rebalancing:</span>
              </div>
              <div className="space-y-1.5">
                {coachData.strategic_improvements.map((imp, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 text-xs font-medium text-foreground flex items-start gap-2">
                    <ArrowUpRight className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Agent Action Banner */}
            <div className="p-3 rounded-xl bg-background border border-sky-500/30 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Planner & Tutor Synchronization:</span>
                <span className="text-[11px] text-muted-foreground">{coachData.planner_rebalance_action?.reasoning}</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={onRebalancePlan}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-8 gap-1.5"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Rebalance 5-Day Plan (Agent #3)</span>
                </Button>

                {coachData.socratic_tutor_prompts?.slice(0, 1).map((prompt, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-50 text-xs h-8 gap-1.5 font-semibold"
                    onClick={() => onAskTutor?.(prompt)}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                    <span>Ask Socratic Tutor →</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
