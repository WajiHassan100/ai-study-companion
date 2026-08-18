import { useState, useEffect } from "react";
import { HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, BookOpen, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateQuiz, submitQuiz, type QuizData, type QuizSubmitResult } from "@/lib/api/quiz";
import { InlineError } from "@/components/common/InlineError";

interface QuizGeneratorProps {
  studentId: string;
  onProfileUpdated?: () => void;
}

const LOADING_STAGES = [
  "Analyzing your learning profile & weak concepts...",
  "Adapting question difficulty to your mastery level...",
  "Synthesizing multiple-choice questions & answer keys...",
  "Finalizing interactive quiz session...",
];

export function QuizGeneratorCard({ studentId, onProfileUpdated }: QuizGeneratorProps) {
  const [mode, setMode] = useState<"quiz" | "flashcard">("quiz");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(null);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progressive loading stage timer
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSubmitResult(null);
    setUserAnswers({});
    setCurrentIndex(0);
    setShowFlashcardAnswer(false);

    try {
      const data = await generateQuiz(studentId, undefined, 5, mode);
      setQuizData(data);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Is the AI backend reachable?");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optionKey: string) => {
    if (submitResult) return; // Locked once submitted
    setUserAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const handleSubmit = async () => {
    if (!quizData || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitQuiz(quizData.quiz_id, studentId, userAnswers);
      setSubmitResult(result);
      // Trigger profile refresh in Agent #2 & Agent #3
      onProfileUpdated?.();
    } catch (err) {
      console.error("Quiz submission failed:", err);
      setError(err instanceof Error ? err.message : "Quiz submission failed. Is the AI backend reachable?");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = quizData?.questions[currentIndex];

  return (
    <Card className="border-border/70 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            AI Quiz & Flashcard Generator
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Generates adaptive practice tests targeting your weak concepts
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-secondary p-0.5 rounded-lg border border-border/50 text-[11px]">
            <button
              onClick={() => setMode("quiz")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                mode === "quiz" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Quiz
            </button>
            <button
              onClick={() => setMode("flashcard")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                mode === "flashcard" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Flashcards
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>{loading ? "Generating..." : "New Quiz"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {error ? <InlineError message={error} /> : null}

        {loading && (
          <div className="py-8 text-center border border-dashed border-purple-500/30 rounded-2xl space-y-3 bg-purple-500/5 animate-pulse">
            <Loader2 className="h-7 w-7 mx-auto text-purple-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">{LOADING_STAGES[loadingStage]}</p>
              <p className="text-[11px] text-muted-foreground">Synthesizing questions customized to your mastery profile...</p>
            </div>
          </div>
        )}

        {!quizData && !loading && (
          <div className="py-8 text-center border border-dashed border-border rounded-xl space-y-2 bg-background/50">
            <Trophy className="h-8 w-8 mx-auto text-purple-500/60" />
            <p className="text-xs font-medium text-foreground">Ready to test your knowledge?</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Generates a personalized practice quiz focusing on your target concepts to build topic mastery!
            </p>
            <Button
              size="sm"
              className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleGenerate}
            >
              Start Diagnostic Quiz
            </Button>
          </div>
        )}

        {quizData && !loading && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {quizData.topic}
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">
                  {quizData.difficulty}
                </Badge>
              </div>
              <span className="text-muted-foreground">
                Question {currentIndex + 1} of {quizData.questions.length}
              </span>
            </div>

            {/* Flashcard Mode */}
            {mode === "flashcard" && currentQ && (
              <div className="space-y-3">
                <div
                  onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                  className="min-h-[160px] p-5 rounded-xl border border-border bg-card hover:bg-secondary/40 cursor-pointer flex flex-col justify-between transition-colors shadow-xs"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {showFlashcardAnswer ? "Answer & Explanation" : "Prompt / Concept"}
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {showFlashcardAnswer ? currentQ.explanation : currentQ.question}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center italic">
                    Click card to {showFlashcardAnswer ? "flip back" : "reveal answer"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    disabled={currentIndex === 0}
                    onClick={() => {
                      setCurrentIndex((prev) => prev - 1);
                      setShowFlashcardAnswer(false);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-7 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={currentIndex === quizData.questions.length - 1}
                    onClick={() => {
                      setCurrentIndex((prev) => prev + 1);
                      setShowFlashcardAnswer(false);
                    }}
                  >
                    Next Card
                  </Button>
                </div>
              </div>
            )}

            {/* Standard Quiz Mode */}
            {mode === "quiz" && currentQ && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/50 space-y-1">
                  <p className="font-semibold text-foreground text-xs leading-relaxed">
                    {currentIndex + 1}. {currentQ.question}
                  </p>
                  {currentQ.target_concept && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Target: {currentQ.target_concept}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {Object.entries(currentQ.options).map(([key, optText]) => {
                    const isSelected = userAnswers[currentQ.id] === key;
                    const feedback = submitResult?.question_feedback?.[currentQ.id];
                    const isCorrect = feedback?.correct_option === key;
                    const isWrongSelection = isSelected && !feedback?.is_correct;

                    let btnStyle = "border-border/70 hover:bg-secondary/40 text-foreground";
                    if (submitResult) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold";
                      } else if (isWrongSelection) {
                        btnStyle = "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                      }
                    } else if (isSelected) {
                      btnStyle = "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold";
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectOption(currentQ.id, key)}
                        disabled={!!submitResult}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                            {key}
                          </span>
                          <span>{optText}</span>
                        </div>
                        {submitResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                        {submitResult && isWrongSelection && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Feedback after Submit */}
                {submitResult && (
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-1">
                    <p className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                      Explanation:
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {submitResult.question_feedback?.[currentQ.id]?.explanation || currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Question Navigation & Submit */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      disabled={currentIndex === quizData.questions.length - 1}
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>

                  {!submitResult ? (
                    <Button
                      size="sm"
                      className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      disabled={Object.keys(userAnswers).length === 0 || submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? "Grading..." : "Submit Answers"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1 border-purple-500/30 text-purple-700"
                      onClick={handleGenerate}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Try Another Quiz
                    </Button>
                  )}
                </div>

                {/* Submit Results Overview */}
                {submitResult && (
                  <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">Score:</span>
                      <Badge className="bg-purple-600 text-white text-xs">
                        {submitResult.score_percentage}% ({submitResult.correct_count}/{submitResult.total_count} Correct)
                      </Badge>
                    </div>
                    {submitResult.recommended_next_steps?.length > 0 && (
                      <div className="text-[11px] text-muted-foreground space-y-1 pt-1 border-t border-border/50">
                        <span className="font-semibold text-foreground">Recommendations:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {submitResult.recommended_next_steps.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
