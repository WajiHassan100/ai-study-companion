/**
 * AI Learning Coach API Client (Agent #9 Integrator)
 * =================================================
 * Calls backend AI Learning Coach Agent endpoints for long-term student mentorship,
 * progress tracking, problem detection, and schedule rebalancing.
 */

export interface LearningCoachResponse {
  coach_title: string;
  consistency_score: number;
  missed_sessions_count: number;
  performance_recommendations: string[];
  problem_detection: string[];
  strategic_improvements: string[];
  planner_rebalance_action: {
    suggested_hours_per_day: number;
    priority_focus_subject: string;
    reduced_subject: string;
    reasoning: string;
  };
  socratic_tutor_prompts: string[];
}

import { apiFetch, API_BASE_URL } from "./client";

export async function getLearningCoachInsights(
  studentId: string,
  timeframe = "weekly"
): Promise<LearningCoachResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/coach/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId || "demo_student",
      timeframe: timeframe,
    }),
  });

  if (!response.ok) {
    throw new Error(`Learning Coach failed with status ${response.status}`);
  }

  return await response.json();
}
