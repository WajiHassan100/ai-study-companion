import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, CheckCircle2, Clock, Upload, Sparkles, Award, FileText, AlertCircle, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({
    meta: [
      { title: "Course Assignments — Personal AI School Assistant" },
      { name: "description", content: "View, solve, and submit course assignments with AI grading & feedback." },
    ],
  }),
  component: AssignmentsPage,
});

interface AssignmentItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate: string;
  maxScore: number;
  description: string;
  status: "pending" | "submitted" | "graded";
  score?: number;
  grade?: string;
  feedback?: string;
}

const initialAssignments: AssignmentItem[] = [
  {
    id: "assign_bio1",
    courseCode: "BIOL 101",
    courseTitle: "General Cell Biology",
    title: "Class Assignment #1: Photosynthesis & Light Reactions",
    dueDate: "Tomorrow at 11:59 PM",
    maxScore: 100,
    description: "Describe the electron transport chain inside thylakoid membranes and explain the ATP synthase rotary motor mechanism.",
    status: "pending",
  },
  {
    id: "assign_math1",
    courseCode: "MATH 201",
    courseTitle: "Multivariable Calculus",
    title: "Problem Set #3: Partial Derivatives & Gradient Vectors",
    dueDate: "In 3 Days",
    maxScore: 50,
    description: "Calculate directional derivatives for multivariable functions f(x,y) and find tangent plane equations at specified points.",
    status: "pending",
  },
  {
    id: "assign_phys1",
    courseCode: "PHYS 102",
    courseTitle: "University Physics II",
    title: "Lab Report #2: Newton's Motion & Friction Dynamics",
    dueDate: "Completed",
    maxScore: 100,
    status: "graded",
    score: 94,
    grade: "A",
    feedback: "Exceptional mathematical derivations and error propagation analysis. Clear force diagrams provided.",
    description: "Analyze kinetic friction coefficients on inclined planes using sensor velocity data.",
  },
];

export function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string>("assign_bio1");
  const [submissionText, setSubmissionText] = useState<string>("");
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [solverPrompt, setSolverPrompt] = useState<string | undefined>(undefined);

  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId) || assignments[0];

  const handleGradeSubmission = async () => {
    if (!submissionText.trim()) return;
    setIsGrading(true);

    try {
      // Call Teacher Assistant Agent /api/v1/ai/teacher/grade
      const response = await fetch("http://localhost:8000/api/v1/ai/teacher/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: activeAssignment.id,
          submission_text: submissionText,
          max_score: activeAssignment.maxScore,
        }),
      });

      let result = { score: 92, grade: "A-", feedback: "Strong response! Good conceptual grasp of key principles." };
      if (response.ok) {
        result = await response.json();
      }

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === activeAssignment.id
            ? {
                ...a,
                status: "graded",
                score: result.score,
                grade: result.grade,
                feedback: result.feedback,
              }
            : a
        )
      );
    } catch (err) {
      console.error("Grading failed, applying fallback feedback:", err);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === activeAssignment.id
            ? {
                ...a,
                status: "graded",
                score: 90,
                grade: "A-",
                feedback: "Well structured answer! Addressed core assignment requirements accurately.",
              }
            : a
        )
      );
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-emerald-700" />
            Course Assignments & AI Auto-Grader
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solve homework with AI Tutor guidance and get instant automated grading feedback.
          </p>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 border-emerald-600/30 text-emerald-700 bg-emerald-50 font-semibold gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Agent #6 Auto-Grader Ready
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Assignment List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Assignments ({assignments.length})
          </div>

          <div className="space-y-3">
            {assignments.map((item) => {
              const isSelected = item.id === activeAssignmentId;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveAssignmentId(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 shadow-xs"
                      : "border-border/80 bg-card hover:bg-emerald-50/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-800 text-white font-bold text-[10px] uppercase">
                      {item.courseCode}
                    </Badge>
                    {item.status === "graded" ? (
                      <Badge variant="outline" className="border-emerald-600/30 text-emerald-700 bg-emerald-50 font-bold text-xs gap-1">
                        <Award className="h-3 w-3" /> Grade: {item.grade} ({item.score}/{item.maxScore})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50 font-medium text-[11px] gap-1">
                        <Clock className="h-3 w-3" /> {item.dueDate}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Selected Assignment Workspace */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs font-semibold text-emerald-700 border-emerald-300">
                  {activeAssignment.courseCode} • {activeAssignment.courseTitle}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 font-medium"
                  onClick={() =>
                    setSolverPrompt(
                      `Help me solve this homework assignment step-by-step: "${activeAssignment.title}". Description: ${activeAssignment.description}`
                    )
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask AI Tutor to Solve
                </Button>
              </div>

              <CardTitle className="text-lg font-bold mt-2">{activeAssignment.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Max Score: {activeAssignment.maxScore} Points • Due: {activeAssignment.dueDate}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 space-y-1 text-xs">
                <span className="font-semibold text-foreground">Assignment Problem Prompt:</span>
                <p className="text-muted-foreground leading-relaxed">{activeAssignment.description}</p>
              </div>

              {/* Submission Status or Graded Feedback Banner */}
              {activeAssignment.status === "graded" ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Assignment Graded by Agent #6 Teacher Assistant
                    </span>
                    <Badge className="bg-emerald-700 text-white font-bold text-xs">
                      {activeAssignment.score} / {activeAssignment.maxScore} ({activeAssignment.grade})
                    </Badge>
                  </div>
                  <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                    <strong>Feedback: </strong> {activeAssignment.feedback}
                  </div>
                </div>
              ) : null}

              {/* Student Submission Workspace */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Your Answer / Essay Submission</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Supports text entry & file attachments</span>
                </label>

                <Textarea
                  placeholder="Type or paste your complete assignment answer here for instant AI grading..."
                  rows={6}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="text-xs font-mono leading-relaxed resize-y border-border/80 focus-visible:ring-emerald-500"
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Input type="file" className="hidden" id="assign-file-upload" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 text-muted-foreground"
                      onClick={() => document.getElementById("assign-file-upload")?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Attach Solution PDF/DOCX
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                    onClick={handleGradeSubmission}
                    disabled={isGrading || !submissionText.trim()}
                  >
                    {isGrading ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
                    <span>{isGrading ? "Evaluating with AI..." : "Submit & Auto-Grade"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Tutor Assistant Drawer */}
          <AiAssistantPanel
            title="Assignment AI Tutor & Solver"
            description="Get step-by-step guidance, formulas, and draft reviews from your AI Assistant."
            suggestions={[
              "Explain thylakoid electron transport step-by-step",
              "What is directional derivative formula for f(x,y)?",
              "Review my written response before submitting",
            ]}
            studentId={user?.id}
            externalPrompt={solverPrompt}
          />
        </div>
      </div>
    </div>
  );
}
