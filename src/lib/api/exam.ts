/**
 * AI Exam Generator API Client (Agent #7 Integrator)
 * ==================================================
 * Calls backend AI Exam Generator Agent endpoints to generate multi-format practice exams
 * and evaluate student submissions with automatic mastery scoring.
 */

export interface ExamQuestion {
  id: string;
  type: "mcq" | "short" | "long" | "numerical" | "conceptual";
  question: string;
  difficulty?: string;
  options?: Record<string, string>;
  correct_option?: string;
  model_solution?: string;
  max_marks?: number;
}

export interface PracticeExam {
  exam_id: string;
  title: string;
  topic: string;
  difficulty: string;
  total_marks: number;
  questions: ExamQuestion[];
  created_at: string;
}

export interface ExamEvaluationResponse {
  attempt_id: string;
  exam_id: string;
  score_percentage: number;
  earned_marks: number;
  total_marks: number;
  updated_mastery: number;
  question_feedback: Record<
    string,
    {
      question: string;
      type: string;
      user_answer: string;
      score: number;
      max_marks: number;
      is_correct: boolean;
      feedback: string;
    }
  >;
  planner_recommendation: string;
}

import { apiFetch, API_BASE_URL } from "./client";

export async function generatePracticeExam(
  studentId: string,
  topic?: string,
  difficulty = "medium",
  numQuestions = 5,
  courseId = "biol_101"
): Promise<PracticeExam> {
  const response = await apiFetch(`${API_BASE_URL}/ai/exam/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId || "demo_student",
      topic: topic || null,
      difficulty: difficulty,
      num_questions: numQuestions,
      course_id: courseId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Exam generation failed with status ${response.status}`);
  }

  return await response.json();
}

export async function evaluatePracticeExam(
  examId: string,
  studentId: string,
  userAnswers: Record<string, string>
): Promise<ExamEvaluationResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/exam/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exam_id: examId,
      student_id: studentId || "demo_student",
      user_answers: userAnswers,
    }),
  });

  if (!response.ok) {
    throw new Error(`Exam evaluation failed with status ${response.status}`);
  }

  return await response.json();
}
