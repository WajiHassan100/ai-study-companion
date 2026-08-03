import { useState } from "react";
import { Sparkles, BookOpen, CheckCircle2, Clock, FileText, Send, Loader2, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TeacherAssistantCard() {
  // Lesson Plan State
  const [topic, setTopic] = useState("Photosynthesis & Light Reactions");
  const [duration, setDuration] = useState(60);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<any | null>(null);

  // Auto-Grader State
  const [assignmentTitle, setAssignmentTitle] = useState("Biology Essay: Cellular Respiration");
  const [submissionText, setSubmissionText] = useState(
    "Mitochondria convert glucose and oxygen into ATP energy through glycolysis, the citric acid cycle, and oxidative phosphorylation. The inner membrane uses an electron transport chain to build a proton gradient..."
  );
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [gradeResult, setGradeResult] = useState<any | null>(null);

  const handleGenerateLessonPlan = async () => {
    if (!topic.trim()) return;
    setLoadingPlan(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/teacher/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: "biol_101", topic, duration_minutes: duration }),
      });
      const data = await res.json();
      setLessonPlan(data);
    } catch (err) {
      console.error("Failed to generate lesson plan:", err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!submissionText.trim()) return;
    setLoadingGrade(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/teacher/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_title: assignmentTitle, submission_text: submissionText }),
      });
      const data = await res.json();
      setGradeResult(data);
    } catch (err) {
      console.error("Failed to grade submission:", err);
    } finally {
      setLoadingGrade(false);
    }
  };

  return (
    <Card className="border-emerald-200/80 shadow-md rounded-2xl overflow-hidden bg-card">
      <CardHeader className="pb-4 bg-gradient-to-r from-emerald-950/5 via-background to-background border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-lg font-bold text-foreground">
              Agent #6: Teacher Assistant Agent
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              AI-powered lesson plan drafting, automated assignment grading, and feedback
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="lesson">
          <TabsList className="bg-secondary/60 p-1 rounded-xl mb-6 border border-border/50">
            <TabsTrigger value="lesson" className="font-semibold text-xs sm:text-sm rounded-lg px-4 py-1.5">
              <BookOpen className="h-4 w-4 mr-2 text-emerald-600" /> Lesson Plan Drafter
            </TabsTrigger>
            <TabsTrigger value="grader" className="font-semibold text-xs sm:text-sm rounded-lg px-4 py-1.5">
              <Award className="h-4 w-4 mr-2 text-amber-500" /> Assignment Auto-Grader
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: LESSON PLAN DRAFTER ── */}
          <TabsContent value="lesson" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Lesson Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Newton's Laws..."
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Duration (Mins)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateLessonPlan}
              disabled={loadingPlan || !topic.trim()}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl px-5 gap-2"
            >
              {loadingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{loadingPlan ? "Drafting Lesson Plan..." : "Draft Lesson Plan (Agent #6)"}</span>
            </Button>

            {lessonPlan && (
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-white dark:bg-slate-900 space-y-4 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h4 className="font-display font-extrabold text-base text-foreground">{lessonPlan.lesson_title}</h4>
                  <Badge className="bg-emerald-700 text-white text-xs">{duration} Mins</Badge>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Learning Objectives:</h5>
                  <ul className="space-y-1 text-xs text-foreground">
                    {lessonPlan.learning_objectives?.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lesson Timeline:</h5>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lessonPlan.timeline?.map((t: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 text-xs">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex justify-between">
                          <span>{t.section}</span>
                          <span>{t.minutes}m</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{t.activities}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── TAB 2: ASSIGNMENT AUTO-GRADER ── */}
          <TabsContent value="grader" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Assignment Title</label>
                <Input
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Student Submission Text</label>
                <Textarea
                  rows={3}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste student response..."
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleGradeSubmission}
              disabled={loadingGrade || !submissionText.trim()}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl px-5 gap-2"
            >
              {loadingGrade ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
              <span>{loadingGrade ? "Evaluating..." : "Auto-Grade Submission (Agent #6)"}</span>
            </Button>

            {gradeResult && (
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-white dark:bg-slate-900 space-y-4 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-base text-foreground">Grade Evaluation Result</h4>
                    <p className="text-xs text-muted-foreground">{assignmentTitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
                      {gradeResult.score}%
                    </div>
                    <Badge className="bg-emerald-700 text-white font-bold text-xs">{gradeResult.letter_grade}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feedback & Strengths:</h5>
                  <p className="text-xs text-foreground bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 italic">
                    "{gradeResult.constructive_feedback}"
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
