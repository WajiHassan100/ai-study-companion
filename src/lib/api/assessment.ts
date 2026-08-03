/**
 * Assessment & Profiler API Client
 * ================================
 * Calls the Assessment & Profiler Agent endpoints to evaluate student responses
 * and fetch dynamic student learning profile metrics.
 */

export interface StudentProfile {
  student_id: string;
  current_level: "beginner" | "intermediate" | "advanced";
  learning_style: "visual" | "auditory" | "reading" | "kinesthetic";
  weaknesses: string[];
  topic_mastery: Record<string, number>;
  updated_at: string;
}

export interface EvaluationPayload {
  student_id: string;
  topic: string;
  question: string;
  student_answer: string;
}

export interface EvaluationResponse {
  student_id: string;
  topic: string;
  is_correct: boolean;
  score: number;
  feedback: string;
  concept_gaps: string[];
  updated_mastery: number;
  recommended_level: "beginner" | "intermediate" | "advanced";
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Fetches the live student profile and topic mastery scores.
 */
export async function getStudentProfile(studentId: string, token?: string): Promise<StudentProfile> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/student/profile/${encodeURIComponent(studentId)}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Using fallback student profile data:", err);
    // Fallback default profile if server unavailable
    return {
      student_id: studentId,
      current_level: "intermediate",
      learning_style: "visual",
      weaknesses: ["Quadratic Factoring", "Photosynthesis Reactions", "Newton's 3rd Law"],
      topic_mastery: {
        "Mathematics": 65,
        "Biology": 82,
        "Physics": 54,
        "History": 90,
      },
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Submits a student answer to the Assessment & Profiler Agent for grading.
 */
export async function evaluateAnswer(payload: EvaluationPayload, token?: string): Promise<EvaluationResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/ai/assessment/evaluate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Evaluation error" }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  return response.json();
}
