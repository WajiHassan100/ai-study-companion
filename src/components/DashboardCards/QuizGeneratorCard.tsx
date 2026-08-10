import { useState } from "react";
import { HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, RefreshCw, Trophy, BookOpen, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateQuiz, submitQuiz, type QuizData, type QuizSubmitResult } from "@/lib/api/quiz";

interface QuizGeneratorProps {
  studentId: string;
  onProfileUpdated?: () => void;
}

export function QuizGeneratorCard({ studentId, onProfileUpdated }: QuizGeneratorProps) {
  const [mode, setMode] = useState<"quiz" | "flashcard">("quiz");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(null);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setSubmitResult(null);
    setUserAnswers({});
    setCurrentIndex(0);
    setShowFlashcardAnswer(false);

    try {
      const data = await generateQuiz(studentId, undefined, 5, mode);
      setQuizData(data);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
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
    try {
      const result = await submitQuiz(quizData.quiz_id, studentId, userAnswers);
      setSubmitResult(result);
      // Trigger profile refresh in Agent #2 & Agent #3
      onProfileUpdated?.();
    } catch (err) {
      console.error("Quiz submission failed:", err);
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
        {!quizData && !loading ? (
          <div className="py-8 text-center border border-dashed border-border rounded-xl space-y-2 bg-background/50">
            <Trophy className="h-8 w-8 mx-auto text-purple-500/60" />
            <p className="text-xs font-medium text-foreground">Ready to test your knowledge?</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Generates a personalized practice quiz focusing on your target concepts to build topic mastery!
            </p>
            <Button size="sm" onClick={handleGenerate} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Practice Quiz
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
            <span>Building adaptive practice questions based on your learning profile...</span>
          </div>
        ) : null}

        {/* ── QUIZ MODE CONTENT ── */}
        {quizData && mode === "quiz" && !submitResult ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
              <div className="flex items-center gap-2 font-medium">
                <Badge variant="outline" className="capitalize text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {quizData.topic}
                </Badge>
                <span className="text-muted-foreground">Question {currentIndex + 1} of {quizData.questions.length}</span>
              </div>
              <Badge variant="secondary" className="capitalize text-[10px]">
                {quizData.difficulty}
              </Badge>
            </div>

            {/* Active Question */}
            {currentQ ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-xs sm:text-sm leading-relaxed text-foreground">
                  {currentIndex + 1}. {currentQ.question}
                </h4>

                {/* Options List */}
                <div className="grid gap-2">
                  {Object.entries(currentQ.options).map(([key, text]) => {
                    const isSelected = userAnswers[currentQ.id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectOption(currentQ.id, key)}
                        className={`p-2.5 rounded-lg border text-xs text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 font-semibold text-purple-900 dark:text-purple-100"
                            : "border-border/60 bg-card hover:bg-secondary/50 text-foreground"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? "border-purple-500 bg-purple-500 text-white" : "border-border text-muted-foreground"
                        }`}>
                          {key}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Question Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous
              </Button>

              {currentIndex < quizData.questions.length - 1 ? (
                <Button
                  size="sm"
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Next Question <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  disabled={submitting || Object.keys(userAnswers).length === 0}
                  onClick={handleSubmit}
                >
                  {submitting ? "Grading..." : "Submit Quiz & Update Profile"}
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* ── FLASHCARD MODE CONTENT ── */}
        {quizData && mode === "flashcard" && !submitResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
              <span className="font-semibold text-muted-foreground">Flashcard {currentIndex + 1} of {quizData.questions.length}</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 text-[10px]">
                {quizData.topic}
              </Badge>
            </div>

            {currentQ ? (
              <div
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                className="min-h-[160px] p-6 rounded-xl border border-purple-500/30 bg-accent/5 hover:bg-accent/10 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-500 mb-2">
                  {showFlashcardAnswer ? "Answer & Explanation" : "Question Concept"}
                </span>
                <p className="font-medium text-xs sm:text-sm text-foreground leading-relaxed">
                  {showFlashcardAnswer
                    ? `${currentQ.options[currentQ.correct_option]} — ${currentQ.explanation}`
                    : currentQ.question}
                </p>
                <span className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Click card to flip
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((prev) => prev - 1);
                  setShowFlashcardAnswer(false);
                }}
              >
                Previous Card
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={currentIndex === quizData.questions.length - 1}
                onClick={() => {
                  setCurrentIndex((prev) => prev + 1);
                  setShowFlashcardAnswer(false);
                }}
              >
                Next Card <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* ── SUBMITTED RESULTS VIEW ── */}
        {submitResult ? (
          <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Quiz Completed!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Score: {submitResult.correct_count} / {submitResult.total_count} ({submitResult.score_percentage}%)
                </p>
              </div>
              <Badge className={submitResult.score_percentage >= 80 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}>
                Mastery Updated: {submitResult.updated_mastery}%
              </Badge>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Steps:</p>
              <ul className="space-y-1 text-xs text-foreground/90">
                {submitResult.recommended_next_steps.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button size="sm" variant="outline" onClick={handleGenerate} className="w-full text-xs gap-1.5 mt-2">
              <RotateCcw className="h-3.5 w-3.5" /> Take Another Practice Quiz
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
