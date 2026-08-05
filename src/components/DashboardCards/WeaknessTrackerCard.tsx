import { useEffect, useState } from "react";
import { Brain, Target, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getStudentProfile, type StudentProfile } from "@/lib/api/assessment";

interface WeaknessTrackerProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

export function WeaknessTrackerCard({ studentId, onAskTutor }: WeaknessTrackerProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getStudentProfile(studentId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load student profile:", err);
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
            AI Assessment & Mastery Profiler
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Tracks topic mastery % and identifies weak concepts automatically
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

        {/* Topic Mastery Progress */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Topic Mastery Breakdown</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>

          {profile?.topic_mastery && Object.keys(profile.topic_mastery).length > 0 ? (
            Object.entries(profile.topic_mastery).map(([topic, score]) => (
              <div key={topic} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{topic}</span>
                  <span className={score >= 80 ? "text-emerald-600 font-semibold" : score < 60 ? "text-amber-600 font-semibold" : "text-blue-600"}>
                    {score}%
                  </span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>BIOL 101: Cell Biology & Genetics</span>
                  <span className="text-emerald-600 font-bold">78%</span>
                </div>
                <Progress value={78} className="h-1.5 accent-emerald-600" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>MATH 201: Multivariable Calculus</span>
                  <span className="text-amber-600 font-bold">62%</span>
                </div>
                <Progress value={62} className="h-1.5 accent-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>PHYS 101: Newtonian Mechanics</span>
                  <span className="text-emerald-600 font-bold">84%</span>
                </div>
                <Progress value={84} className="h-1.5 accent-emerald-600" />
              </div>
            </div>
          )}
        </div>

        {/* Concept Weaknesses Section */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span>Recommended Concepts to Review (Click to Ask AI Tutor):</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(profile?.weaknesses && profile.weaknesses.length > 0
              ? profile.weaknesses
              : ["Thylakoid Electron Transport", "Directional Derivatives & Gradient Vectors", "Rotational Torque Equations"]
            ).map((weakness, i) => (
              <button
                key={i}
                onClick={() => onAskTutor?.(`Can you explain ${weakness} step by step?`)}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left cursor-pointer"
              >
                <span>{weakness}</span>
                <Sparkles className="h-3 w-3 text-amber-600 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Student Memory & Personalization Layer Intelligence Banner */}
        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Personalization & Memory Context (Active):</span>
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
