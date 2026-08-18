/**
 * Quiz & Flashcard API Client
 * ===========================
 * Frontend API client for calling Agent #4 (Quiz & Assessment Agent) endpoints.
 */

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  explanation: string;
  target_concept?: string;
}

export interface QuizData {
  quiz_id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestionItem[];
  created_at: string;
}

export interface QuizSubmitResult {
  attempt_id: string;
  quiz_id: string;
  score_percentage: number;
  correct_count: number;
  total_count: number;
  question_feedback: Record<
    string,
    {
      question: string;
      selected_option: string;
      correct_option: string;
      is_correct: boolean;
      explanation: string;
      target_concept: string;
    }
  >;
  updated_mastery: number;
  recommended_next_steps: string[];
}

import { apiFetch, API_BASE_URL } from "./client";

/**
 * Invokes Agent #4 to generate an adaptive quiz or flashcard set.
 */
export async function generateQuiz(
  studentId: string,
  topic?: string,
  numQuestions = 5,
  mode = "quiz",
  token?: string
): Promise<QuizData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/ai/quiz/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      student_id: studentId || "demo_student",
      topic: topic || null,
      num_questions: numQuestions,
      mode: mode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}

/**
 * Submits a completed quiz attempt to Agent #4 to calculate score and update Agent #2 topic mastery.
 */
export async function submitQuiz(
  quizId: string,
  studentId: string,
  userAnswers: Record<string, string>,
  token?: string
): Promise<QuizSubmitResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/ai/quiz/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      quiz_id: quizId,
      student_id: studentId || "demo_student",
      user_answers: userAnswers,
    }),
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}
