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
        <div className="space-y-2.5">
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
            <p className="text-xs text-muted-foreground italic">No topic evaluation data recorded yet.</p>
          )}
        </div>

        {/* Concept Weaknesses Section */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span>Recommended Concepts to Review</span>
          </div>

          {profile?.weaknesses && profile.weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.weaknesses.map((weakness, i) => (
                <button
                  key={i}
                  onClick={() => onAskTutor?.(`Can you explain ${weakness} step by step?`)}
                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-all text-left"
                >
                  <span>{weakness}</span>
                  <Sparkles className="h-3 w-3 opacity-60 group-hover:opacity-100 text-amber-600" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              No critical weaknesses detected. Keep up the great work! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
