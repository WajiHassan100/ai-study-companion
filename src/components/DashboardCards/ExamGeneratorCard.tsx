import { useState } from "react";
import { FileCheck, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Award, Brain, Calculator, HelpCircle, Layers, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generatePracticeExam, evaluatePracticeExam, type PracticeExam, type ExamEvaluationResponse } from "@/lib/api/exam";

interface ExamGeneratorCardProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

export function ExamGeneratorCard({ studentId, onAskTutor }: ExamGeneratorCardProps) {
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("medium");
  const [topic, setTopic] = useState("Gradient Vectors & Partial Derivatives");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamEvaluationResponse | null>(null);

  const handleGenerate = async (targetDifficulty = difficulty) => {
    setGenerating(true);
    setResult(null);
    setUserAnswers({});
    try {
      const data = await generatePracticeExam(studentId, topic, targetDifficulty, 5, "math_201");
      setExam(data);
    } catch (err) {
      console.error("Failed to generate exam:", err);
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
    try {
      const res = await evaluatePracticeExam(exam.exam_id, studentId, userAnswers);
      setResult(res);
    } catch (err) {
      console.error("Failed to evaluate exam:", err);
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
            AI Exam Generator Agent (Agent #7)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Generates 5 multi-format assessment questions (MCQs, Short, Long, Numerical, Conceptual)
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          onClick={() => handleGenerate(difficulty)}
          disabled={generating}
        >
          {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-indigo-600" />}
          <span>{generating ? "Generating..." : "Generate AI Exam"}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Controls & Difficulty Level Selector */}
        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Difficulty:</span>
            <div className="flex gap-1">
              {(["easy", "medium", "advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setDifficulty(lvl);
                    handleGenerate(lvl);
                  }}
                  className={`px-2.5 py-1 rounded-md capitalize text-xs font-semibold transition-all ${
                    difficulty === lvl
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-background border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
            Grounded in Course RAG ✓
          </Badge>
        </div>

        {/* Evaluation Result Header Banner */}
        {result && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Exam Assessment Complete!</span>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs font-bold">
                Score: {result.score_percentage}% ({result.earned_marks}/{result.total_marks} Marks)
              </Badge>
            </div>
            <p className="text-foreground/90 font-medium">{result.planner_recommendation}</p>
          </div>
        )}

        {/* Generated Questions List */}
        {generating ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Agent #7 is synthesizing MCQs, Numerical calculations & Conceptual questions from RAG...</span>
          </div>
        ) : exam?.questions && exam.questions.length > 0 ? (
          <div className="space-y-3">
            {exam.questions.map((q, idx) => {
              const IconComp = typeIconMap[q.type] || HelpCircle;
              const feedback = result?.question_feedback?.[q.id];

              return (
                <div key={q.id || idx} className="p-3 rounded-xl bg-background border border-border/70 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">Q{idx + 1}.</span>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 px-2 flex items-center gap-1 ${typeBadgeMap[q.type] || "bg-secondary"}`}>
                        <IconComp className="h-3 w-3" />
                        <span>{q.type}</span>
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-semibold">({q.max_marks || 20} Marks)</span>
                    </div>

                    {feedback && (
                      <Badge className={feedback.is_correct ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}>
                        {feedback.score}/{feedback.max_marks} Marks
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</p>

                  {/* MCQ Radio Options */}
                  {q.type === "mcq" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {Object.entries(q.options).map(([optKey, optValue]) => {
                        const isSelected = userAnswers[q.id] === optKey;
                        return (
                          <button
                            key={optKey}
                            onClick={() => handleAnswerChange(q.id, optKey)}
                            className={`p-2 rounded-lg text-xs text-left border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                                : "bg-secondary/30 border-border hover:bg-secondary text-foreground font-medium"
                            }`}
                          >
                            <strong>{optKey}:</strong> {optValue}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input for Written & Numerical Questions */}
                  {q.type !== "mcq" && (
                    <Textarea
                      placeholder={q.type === "numerical" ? "Show step-by-step formula calculation..." : "Type your answer and intuition..."}
                      value={userAnswers[q.id] || ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      rows={2}
                      className="text-xs bg-background resize-none min-h-[45px]"
                    />
                  )}

                  {/* Feedback Model Solution Display */}
                  {feedback && (
                    <div className="p-2 rounded-lg bg-secondary/60 text-[11px] text-muted-foreground space-y-1">
                      <span className="font-semibold text-foreground">AI Model Solution: </span>
                      <span className="italic">{feedback.feedback}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit Exam Button */}
            {!result ? (
              <Button
                onClick={handleSubmitExam}
                disabled={evaluating || Object.keys(userAnswers).length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 gap-2"
              >
                {evaluating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Submit Practice Exam for AI Evaluation →</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleGenerate(difficulty)}
                className="w-full border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 text-xs h-9 gap-2 font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
                <span>Generate Next Practice Exam →</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">Click "Generate AI Exam" to create multi-format practice questions on {topic}.</p>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1.5"
              onClick={() => handleGenerate(difficulty)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate AI Practice Exam</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
