import { useState } from "react";
import { MessageSquareText, Sparkles, RefreshCw, AlertCircle, CheckCircle2, BookOpen, Code, FileText, ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAssignmentFeedback, type AssignmentFeedbackResponse } from "@/lib/api/feedback";

interface AssignmentFeedbackCardProps {
  studentId: string;
  onAskTutor?: (query: string) => void;
}

export function AssignmentFeedbackCard({ studentId, onAskTutor }: AssignmentFeedbackCardProps) {
  const [assignmentTitle, setAssignmentTitle] = useState("Problem Set: Two Sum Algorithm Optimization");
  const [submissionType, setSubmissionType] = useState<"code" | "math" | "essay" | "general">("code");
  const [submissionText, setSubmissionText] = useState(
    "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []"
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<AssignmentFeedbackResponse | null>(null);

  const handleAnalyze = async () => {
    if (!submissionText.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await generateAssignmentFeedback(
        studentId,
        assignmentTitle,
        submissionText,
        submissionType,
        submissionType === "code" ? "CS 101: Data Structures" : "MATH 201: Multivariable Calculus"
      );
      setFeedback(res);
    } catch (err) {
      console.error("Failed to generate feedback:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border border-purple-500/30 bg-purple-500/5 shadow-sm relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Assignment Homework Coach
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Analyzes code & written work for 4-part feedback: Errors, Explanations, Suggestions & Learning Resources
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          onClick={handleAnalyze}
          disabled={analyzing || !submissionText.trim()}
        >
          {analyzing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-purple-600" />}
          <span>{analyzing ? "Analyzing..." : "Review Submission"}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Submission Controls & Format Tabs */}
        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Type:</span>
            <div className="flex gap-1">
              {(["code", "math", "essay", "general"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubmissionType(t)}
                  className={`px-2 py-0.5 rounded capitalize text-[11px] font-semibold transition-all ${
                    submissionType === t
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-background border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
            Synced with Student Memory ✓
          </Badge>
        </div>

        {/* Input Textarea for Code or Written Submission */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Paste your code solution or written derivation:</span>
            <span className="text-[11px]">{submissionType === "code" ? "Python / JS / C++" : "Text / Math"}</span>
          </div>

          <Textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows={4}
            className="font-mono text-xs bg-background/80 resize-none min-h-[90px]"
            placeholder="Paste code snippet or assignment solution here..."
          />
        </div>

        {/* Structured 4-Part AI Feedback Output */}
        {analyzing ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
            <span>Evaluating submission for logical correctness & generating suggestions...</span>
          </div>
        ) : feedback ? (
          <div className="space-y-3 pt-1 border-t border-border/50">
            {/* Header Score & Grade */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-purple-900 dark:text-purple-200">{feedback.assignment_title}</span>
                <p className="text-[11px] text-muted-foreground">{feedback.planner_recommendation}</p>
              </div>
              <Badge className="bg-purple-700 text-white font-bold text-xs shrink-0">
                Grade: {feedback.letter_grade} ({feedback.overall_score}%)
              </Badge>
            </div>

            {/* 1. Error Identification */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>1. Error Identification:</span>
              </div>
              <div className="space-y-1.5">
                {feedback.error_identification.map((err, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 text-xs font-medium text-rose-900 dark:text-rose-200">
                    ⚠️ {err}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Explanation of Mistakes */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4" />
                <span>2. Explanation of Mistakes:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 text-xs leading-relaxed text-foreground">
                "{feedback.explanation_of_mistakes}"
              </div>
            </div>

            {/* 3. Suggestions for Improvement & Refactored Snippet */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>3. Actionable Suggestions for Improvement:</span>
              </div>
              <div className="space-y-1.5">
                {feedback.suggestions_for_improvement.map((sug, i) => (
                  <div key={i} className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-foreground font-medium flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>

              {feedback.refactored_solution_snippet && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground">AI Refactored Solution:</span>
                  <pre className="p-3 rounded-lg bg-secondary/80 border border-border text-[11px] font-mono overflow-x-auto text-foreground">
                    {feedback.refactored_solution_snippet}
                  </pre>
                </div>
              )}
            </div>

            {/* 4. Learning Resources & AI Tutor Prompt Button */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>4. Recommended Learning Resources:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {feedback.learning_resources.map((res, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-indigo-700 dark:text-indigo-300 border-indigo-300 hover:bg-indigo-50 font-medium"
                    onClick={() => onAskTutor?.(`Explain how to resolve this assignment mistake: ${res}`)}
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-indigo-600" />
                    {res} →
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
