/**
 * AI Assignment Feedback API Client (Agent #8 Integrator)
 * =======================================================
 * Calls backend AI Assignment Feedback Agent endpoints to analyze code & written submissions.
 */

export interface AssignmentFeedbackResponse {
  assignment_title: string;
  subject: string;
  overall_score: number;
  letter_grade: string;
  error_identification: string[];
  explanation_of_mistakes: string;
  suggestions_for_improvement: string[];
  learning_resources: string[];
  refactored_solution_snippet: string;
  planner_recommendation: string;
}

import { apiFetch, API_BASE_URL } from "./client";

export async function generateAssignmentFeedback(
  studentId: string,
  assignmentTitle: string,
  submissionText: string,
  submissionType = "code",
  subject = "Computer Science / Mathematics"
): Promise<AssignmentFeedbackResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/assignment/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId || "demo_student",
      assignment_title: assignmentTitle,
      submission_text: submissionText,
      submission_type: submissionType,
      subject: subject,
    }),
  });

  if (!response.ok) {
    throw new Error(`Assignment Feedback failed with status ${response.status}`);
  }

  return await response.json();
}
