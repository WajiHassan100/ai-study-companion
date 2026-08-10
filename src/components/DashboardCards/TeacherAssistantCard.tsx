import { useState } from "react";
import { Sparkles, BookOpen, CheckCircle2, Award, Download, HelpCircle, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

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
  const [manualGradeOverride, setManualGradeOverride] = useState<number | null>(null);

  // Quiz Publisher State
  const [quizTopic, setQuizTopic] = useState("Multivariable Calculus Derivatives");
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any | null>(null);

  const handleGenerateLessonPlan = async () => {
    if (!topic.trim()) return;
    setLoadingPlan(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/teacher/lesson-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: "biol_101", topic, duration_minutes: duration }),
      });
      const data = await res.json();
      setLessonPlan(data);
      toast.success("Lesson plan generated successfully!");
    } catch (err) {
      console.error("Failed to generate lesson plan:", err);
      toast.error("Could not generate lesson plan. Ensure backend is running.");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!submissionText.trim()) return;
    setLoadingGrade(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/teacher/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_title: assignmentTitle, submission_text: submissionText }),
      });
      const data = await res.json();
      setGradeResult(data);
      setManualGradeOverride(data.score);
      toast.success("Submission auto-graded successfully!");
    } catch (err) {
      console.error("Failed to grade submission:", err);
      toast.error("Could not grade submission.");
    } finally {
      setLoadingGrade(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!quizTopic.trim()) return;
    setLoadingQuiz(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: quizTopic, num_questions: quizNumQuestions, difficulty: "intermediate" }),
      });
      const data = await res.json();
      setGeneratedQuiz(data);
      toast.success(`Published ${quizTopic} Quiz with ${data.questions?.length || quizNumQuestions} MCQs!`);
    } catch (err) {
      console.error("Failed to publish quiz:", err);
      toast.error("Could not publish quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleDownloadLessonPlan = () => {
    if (!lessonPlan) return;
    const content = `# ${lessonPlan.lesson_title || topic}
Duration: ${duration} Mins

## Learning Objectives:
${lessonPlan.learning_objectives?.map((o: string) => `- ${o}`).join("\n")}

## Timeline:
${lessonPlan.timeline?.map((t: any) => `- **${t.section}** (${t.minutes}m): ${t.activities}`).join("\n")}
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `Lesson_Plan_${topic.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Lesson plan downloaded as Markdown!");
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
              Educator Assistant & Auto-Grader
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Lesson plan drafting, automated submission auto-grading, and quiz publishing
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="lesson">
          <TabsList className="bg-secondary/60 p-1 rounded-xl mb-6 border border-border/50 flex-wrap h-auto gap-1">
            <TabsTrigger value="lesson" className="font-semibold text-xs rounded-lg px-4 py-1.5">
              <BookOpen className="h-4 w-4 mr-1.5 text-emerald-600" /> Lesson Plan Drafter
            </TabsTrigger>
            <TabsTrigger value="grader" className="font-semibold text-xs rounded-lg px-4 py-1.5">
              <Award className="h-4 w-4 mr-1.5 text-amber-500" /> Assignment Auto-Grader
            </TabsTrigger>
            <TabsTrigger value="quiz" className="font-semibold text-xs rounded-lg px-4 py-1.5">
              <HelpCircle className="h-4 w-4 mr-1.5 text-purple-600" /> Class Quiz Publisher
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
              <span>{loadingPlan ? "Drafting Lesson Plan..." : "Draft Lesson Plan"}</span>
            </Button>

            {lessonPlan && (
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-white dark:bg-slate-900 space-y-4 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h4 className="font-display font-extrabold text-base text-foreground">{lessonPlan.lesson_title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-700 text-white text-xs">{duration} Mins</Badge>
                    <Button size="sm" variant="outline" onClick={handleDownloadLessonPlan} className="h-7 text-xs gap-1 border-emerald-600/30 text-emerald-800">
                      <Download className="h-3.5 w-3.5" /> Download Markdown
                    </Button>
                  </div>
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
              <span>{loadingGrade ? "Evaluating..." : "Auto-Grade Submission"}</span>
            </Button>

            {gradeResult && (
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-white dark:bg-slate-900 space-y-4 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-base text-foreground">Grade Evaluation Result</h4>
                    <p className="text-xs text-muted-foreground">{assignmentTitle}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-display text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">
                        {manualGradeOverride ?? gradeResult.score}%
                      </div>
                      <Badge className="bg-emerald-700 text-white font-bold text-xs">{gradeResult.letter_grade}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teacher Score Override:</h5>
                    <span className="text-xs font-semibold text-emerald-700">{manualGradeOverride}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={manualGradeOverride ?? gradeResult.score}
                    onChange={(e) => setManualGradeOverride(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
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

          {/* ── TAB 3: CLASS QUIZ PUBLISHER (AGENT #4) ── */}
          <TabsContent value="quiz" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Quiz Topic</label>
                <Input
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. Multivariable Calculus, Photosynthesis..."
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Number of MCQs</label>
                <Input
                  type="number"
                  value={quizNumQuestions}
                  onChange={(e) => setQuizNumQuestions(Number(e.target.value))}
                  className="bg-background rounded-xl border-border/80 text-xs sm:text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handlePublishQuiz}
              disabled={loadingQuiz || !quizTopic.trim()}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl px-5 gap-2"
            >
              {loadingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{loadingQuiz ? "Generating Quiz..." : "Publish Quiz to Class"}</span>
            </Button>

            {generatedQuiz && (
              <div className="p-5 rounded-2xl border border-purple-200 bg-white dark:bg-slate-900 space-y-4 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-base text-foreground">Class Quiz Published Live!</h4>
                    <p className="text-xs text-muted-foreground">Topic: {quizTopic}</p>
                  </div>
                  <Badge className="bg-purple-700 text-white text-xs">{generatedQuiz.questions?.length || quizNumQuestions} Questions</Badge>
                </div>

                <div className="space-y-3">
                  {generatedQuiz.questions?.slice(0, 3).map((q: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 text-xs space-y-1">
                      <span className="font-bold text-purple-800 dark:text-purple-300">Q{i + 1}: {q.question}</span>
                      <div className="text-[11px] text-muted-foreground">Options: {q.options?.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
