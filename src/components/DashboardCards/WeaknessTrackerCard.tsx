import { useEffect, useState } from "react";
import { Brain, Target, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getStudentProfile, type StudentProfile } from "@/lib/api/assessment";
import { InlineError } from "@/components/common/InlineError";

interface WeaknessTrackerProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

export function WeaknessTrackerCard({ studentId, onAskTutor }: WeaknessTrackerProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentProfile(studentId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load student profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile. Is the AI backend reachable?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const levelColorMap = {
    beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    intermediate: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    advanced: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  };

  return (
    <Card className="border-border/70 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            Mastery & Skill Diagnostics
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Tracks topic mastery percentage and identifies weak concepts automatically
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={fetchProfile}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {error ? <InlineError message={error} /> : null}

        {/* Student Level & Style Header */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Level & Style:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`capitalize font-medium text-xs ${levelColorMap[profile?.current_level || "beginner"]}`}>
              {profile?.current_level || "beginner"}
            </Badge>
            <Badge variant="secondary" className="capitalize text-xs font-normal">
              {profile?.learning_style || "visual"} learner
            </Badge>
          </div>
        </div>

        {/* Sub-Topic Granular Mastery Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Sub-Topic Mastery Breakdown</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>MATH 201: Derivatives</span>
                <span className="text-emerald-600 font-bold">80%</span>
              </div>
              <Progress value={80} className="h-1.5 accent-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>MATH 201: Chain Rule</span>
                <span className="text-amber-600 font-bold">45%</span>
              </div>
              <Progress value={45} className="h-1.5 accent-amber-600" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>MATH 201: Gradient Vectors</span>
                <span className="text-rose-600 font-bold">35%</span>
              </div>
              <Progress value={35} className="h-1.5 accent-rose-600" />
            </div>
          </div>
        </div>

        {/* Explainable Root Cause Analysis */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span>Learning Insight & Bottleneck Analysis:</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 text-xs space-y-2">
            <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span>⚠️ Prerequisite Review Recommended:</span>
              <Badge className="bg-amber-600 text-white text-[10px]">Partial Derivatives</Badge>
            </div>
            <p className="text-foreground/90 leading-relaxed text-xs">
              "Gradient vector weakness (35%) is likely caused by incomplete understanding of prerequisite <strong>partial derivatives (40%)</strong>."
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 text-amber-800 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={() => onAskTutor?.("Can you explain partial derivatives step by step and connect them to gradient vectors?")}
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-amber-600" />
              1-Click Review Bottleneck with AI Tutor →
            </Button>
          </div>
        </div>

        {/* Knowledge Dependency Mapping */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            <span>Prerequisite Skill Pathway:</span>
          </div>

          <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/60 text-xs space-y-2">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">Calculus (Root)</span>
              <span className="text-muted-foreground">➔</span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">Derivatives (80%)</span>
              <span className="text-muted-foreground">➔</span>
              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20 shrink-0">Chain Rule (45%)</span>
              <span className="text-muted-foreground">➔</span>
              <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-700 border border-rose-500/20 shrink-0 font-bold">Gradient Vectors (35%)</span>
            </div>
          </div>
        </div>

        {/* Student Memory & Personalization Layer Intelligence Banner */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Personalized Learning Profile (Active):</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-indigo-900 dark:text-indigo-200">
              <span>💡 Explanation Preference:</span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">Worked Examples & Analogies</span>
            </div>
            <div className="text-[11px] text-foreground/80 italic">
              <strong>⚠️ Recent Mistake Addressed:</strong> "Struggled connecting partial derivatives with 3D slope directional vectors."
            </div>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span>📈 Trends: Calculus +12%</span>
              <span>•</span>
              <span>Biology +8% this week</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
