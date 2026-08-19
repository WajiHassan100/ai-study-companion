import { useState, useEffect } from "react";
import { FileCheck, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Award, Brain, Calculator, HelpCircle, Layers, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generatePracticeExam, evaluatePracticeExam, type PracticeExam, type ExamEvaluationResponse } from "@/lib/api/exam";
import { InlineError } from "@/components/common/InlineError";

interface ExamGeneratorCardProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

const EXAM_LOADING_STAGES = [
  "Retrieving course documents and syllabus formulas...",
  "Constructing multi-format questions (MCQ, Short, Long, Numerical)...",
  "Formulating mark schemes and step-by-step model solutions...",
  "Finalizing examination simulator paper...",
];

export function ExamGeneratorCard({ studentId, onAskTutor }: ExamGeneratorCardProps) {
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("medium");
  const [course, setCourse] = useState("MATH 201");
  const [topic, setTopic] = useState("Gradient Vectors & Partial Derivatives");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamEvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Progressive loading timer
  useEffect(() => {
    let interval: any;
    if (generating) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < EXAM_LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async (targetDifficulty = difficulty) => {
    setGenerating(true);
    setError(null);
    setResult(null);
    setUserAnswers({});
    try {
      const data = await generatePracticeExam(studentId, topic, targetDifficulty, 5, "math_201");
      setExam(data);
    } catch (err) {
      console.error("Failed to generate exam:", err);
      setError(err instanceof Error ? err.message : "Failed to generate exam. Is the AI backend reachable?");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (qId: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmitExam = async () => {
    if (!exam || evaluating) return;
    setEvaluating(true);
    setError(null);
    try {
      const res = await evaluatePracticeExam(exam.exam_id, studentId, userAnswers);
      setResult(res);
    } catch (err) {
      console.error("Failed to evaluate exam:", err);
      setError(err instanceof Error ? err.message : "Failed to evaluate exam. Is the AI backend reachable?");
    } finally {
      setEvaluating(false);
    }
  };

  const typeIconMap: Record<string, any> = {
    mcq: HelpCircle,
    short: Layers,
    long: Brain,
    numerical: Calculator,
    conceptual: Sparkles,
  };

  const typeBadgeMap: Record<string, string> = {
    mcq: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    short: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    long: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    numerical: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    conceptual: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  return (
    <Card className="border border-indigo-500/30 bg-indigo-500/5 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Practice Exam Simulator
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Generates 5 multi-format assessment questions (MCQs, Short, Long, Numerical, Conceptual)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {error ? <InlineError message={error} /> : null}

        {/* Course & Topic Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Course Subject:</label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="text-xs font-medium bg-background border-border/70"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Topic Focus:</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-xs font-medium bg-background border-border/70"
            />
          </div>
        </div>

        {generating && (
          <div className="py-8 text-center border border-dashed border-indigo-500/40 rounded-2xl space-y-3 bg-indigo-500/10 animate-pulse">
            <Loader2 className="h-7 w-7 mx-auto text-indigo-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">{EXAM_LOADING_STAGES[loadingStage]}</p>
              <p className="text-[11px] text-muted-foreground">Creating a multi-format exam grounded in course materials...</p>
            </div>
          </div>
        )}

        {!generating && (
          <Button
            size="sm"
            className="w-full text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            onClick={() => handleGenerate(difficulty)}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Generate New Practice Exam</span>
          </Button>
        )}

        {/* Generated Exam Paper */}
        {exam && !generating && (
          <div className="space-y-5 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">{exam.title}</h4>
                <p className="text-xs text-muted-foreground">Total Marks: {exam.total_marks} pts • {exam.questions.length} Questions</p>
              </div>
              <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase">{exam.difficulty}</Badge>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {exam.questions.map((q, idx) => {
                const IconComp = typeIconMap[q.type] || HelpCircle;
                const badgeColor = typeBadgeMap[q.type] || "bg-secondary text-secondary-foreground";
                const qResult = result?.question_feedback?.[q.id];

                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${badgeColor} font-bold text-[10px] uppercase gap-1`}>
                          <IconComp className="h-3 w-3" />
                          {q.type}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-foreground">Q{idx + 1}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{q.max_marks} marks</span>
                    </div>

                    <p className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</p>

                    {/* MCQ Options */}
                    {q.type === "mcq" && q.options && (
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const isSelected = userAnswers[q.id] === optKey;
                          return (
                            <button
                              key={optKey}
                              onClick={() => handleAnswerChange(q.id, optKey)}
                              disabled={!!result}
                              className={`p-2.5 rounded-xl border text-xs text-left transition-colors flex items-center gap-2 ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold"
                                  : "border-border/60 hover:bg-secondary/40 text-foreground"
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center font-bold text-[10px] shrink-0">
                                {optKey}
                              </span>
                              <span>{optText}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Open Ended Answer Textarea */}
                    {q.type !== "mcq" && (
                      <Textarea
                        value={userAnswers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        disabled={!!result}
                        placeholder={`Write your step-by-step ${q.type} response or calculation here...`}
                        rows={3}
                        className="text-xs resize-none bg-secondary/30 border-border/70 rounded-xl"
                      />
                    )}

                    {/* Graded Feedback Item */}
                    {qResult && (
                      <div className="p-3 rounded-xl bg-secondary/60 border border-border/70 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span>Awarded: {qResult.score} / {qResult.max_marks} marks</span>
                          {qResult.is_correct || qResult.score > 0 ? (
                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Graded</span>
                          ) : (
                            <span className="text-rose-600">Review Needed</span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{qResult.feedback}</p>
                        {q.model_solution && (
                          <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200">
                            <span className="font-bold">Model Solution: </span>
                            <span>{q.model_solution}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Exam Submission & Results */}
            {!result ? (
              <Button
                size="sm"
                className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSubmitExam}
                disabled={evaluating || Object.keys(userAnswers).length === 0}
              >
                {evaluating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                <span>{evaluating ? "Grading Exam Paper..." : "Submit Exam for AI Grading"}</span>
              </Button>
            ) : (
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-foreground">Exam Grading Summary</h5>
                    <p className="text-xs text-muted-foreground">Mastery profile updated</p>
                  </div>
                  <Badge className="bg-indigo-600 text-white font-extrabold text-sm px-3 py-1">
                    {result.score_percentage}% ({result.earned_marks} / {result.total_marks} Marks)
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-bold border-indigo-500/30 text-indigo-700"
                  onClick={() => handleGenerate(difficulty)}
                >
                  Generate Another Exam
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
