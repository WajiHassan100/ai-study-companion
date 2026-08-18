/**
 * Study Planner API Client
 * ========================
 * Calls backend Study Planner Agent endpoints to generate and fetch personalized study schedules.
 */

export interface StudyBlock {
  day: string;
  topic: string;
  duration_minutes: number;
  priority: "high" | "normal" | "low";
  description: string;
  video_url?: string;
  video_query?: string;
}

export interface StudyPlan {
  id: string;
  student_id: string;
  title: string;
  summary: string;
  schedule: StudyBlock[];
  action_items: string[];
  created_at: string;
}

import { apiFetch, API_BASE_URL } from "./client";

/**
 * Fetches existing study schedules for a given student.
 */
export async function getStudentStudyPlans(studentId: string, token?: string): Promise<StudyPlan[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/ai/planner/${encodeURIComponent(studentId)}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}

/**
 * Invokes the AI Planner Agent to generate a new custom study plan.
 */
export async function generateStudyPlan(
  studentId: string,
  targetDays = 5,
  customGoals?: string,
  availableHours = 2.0,
  learningSpeed = "moderate",
  token?: string
): Promise<StudyPlan> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/ai/planner/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      student_id: studentId || "demo_student",
      target_days: targetDays,
      custom_goals: customGoals || null,
      available_hours: availableHours,
      learning_speed: learningSpeed,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Generation error" }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.plan_id,
    student_id: studentId,
    title: data.title,
    summary: data.summary,
    schedule: data.schedule,
    action_items: data.action_items,
    created_at: data.created_at,
  };
}
