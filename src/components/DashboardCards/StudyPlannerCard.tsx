import { useEffect, useState } from "react";
import { Calendar, Clock, Sparkles, CheckSquare, Square, RefreshCw, Zap, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateStudyPlan, getStudentStudyPlans, type StudyPlan, type StudyBlock } from "@/lib/api/planner";

interface StudyPlannerProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

export function StudyPlannerCard({ studentId, onAskTutor }: StudyPlannerProps) {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Default expand first day

  const activePlan = plans[0] || null;

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getStudentStudyPlans(studentId);
      setPlans(data);
    } catch (err) {
      console.error("Failed to load study plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newPlan = await generateStudyPlan(studentId, 7);
      setPlans((prev) => [newPlan, ...prev]);
      setExpandedIndex(0);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [studentId]);

  const toggleItem = (idx: number) => {
    setCompletedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const priorityBadgeMap = {
    high: "bg-red-500/10 text-red-600 border-red-500/20",
    normal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    low: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  return (
    <Card className="border-border/70 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            AI Study Planner & Revision Schedule
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Click any day to open full study objectives & AI tutoring session
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium border-accent/30 text-accent hover:bg-accent/10"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span>{generating ? "Planning..." : "Generate AI Plan"}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Active Plan Header */}
        {activePlan ? (
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/50 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                {activePlan.title}
              </h4>
              <span className="text-[10px] text-muted-foreground">
                Updated {new Date(activePlan.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activePlan.summary}</p>
          </div>
        ) : null}

        {/* Daily Timetable Timeline */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Scheduled Study Blocks (Click to Expand)
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading schedule...
            </div>
          ) : activePlan?.schedule && activePlan.schedule.length > 0 ? (
            <div className="space-y-2">
              {activePlan.schedule.map((block: StudyBlock, i: number) => {
                const isExpanded = expandedIndex === i;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border transition-all overflow-hidden ${
                      isExpanded
                        ? "border-accent/50 bg-accent/5 shadow-xs"
                        : "border-border/60 bg-card hover:bg-accent/5 cursor-pointer"
                    }`}
                  >
                    {/* Header bar (always visible) */}
                    <div
                      onClick={() => toggleExpand(i)}
                      className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="font-bold text-xs text-foreground shrink-0">{block.day}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-semibold py-0 px-1.5 shrink-0 ${priorityBadgeMap[block.priority || "normal"]}`}>
                          {block.priority || "normal"}
                        </Badge>
                        <span className="text-xs font-medium text-foreground truncate">{block.topic}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          <span>{block.duration_minutes}m</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-accent" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-accent/20 space-y-2.5 bg-background/60">
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-foreground">Study Objective: </span>
                          {block.description}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-muted-foreground">
                            Target Duration: <strong>{block.duration_minutes} mins</strong>
                          </span>
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                            onClick={() => onAskTutor?.(`Teach me ${block.day}'s topic: ${block.topic} step by step with worked examples.`)}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            Start AI Tutor Session
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No active study schedule available.</p>
          )}
        </div>

        {/* Action Items Checklist */}
        {activePlan?.action_items && activePlan.action_items.length > 0 ? (
          <div className="space-y-2 pt-1 border-t border-border/50">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recommended Tasks for the Week
            </div>
            <div className="space-y-1.5">
              {activePlan.action_items.map((item, idx) => {
                const isChecked = !!completedItems[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleItem(idx)}
                    className="flex items-start gap-2 text-xs text-left w-full hover:bg-secondary/30 p-1.5 rounded transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className={isChecked ? "line-through text-muted-foreground" : "text-foreground font-medium"}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

