/**
 * AI Service Client
 * =================
 * Frontend API client for calling the Python FastAPI AI Tutor Agent endpoints.
 */

export interface TutorChatPayload {
  student_id?: string;
  message: string;
  course_id?: string;
  session_id?: string;
  student_level?: "beginner" | "intermediate" | "advanced";
  learning_style?: "visual" | "auditory" | "reading" | "kinesthetic";
}

export interface TutorChatResponse {
  answer: string;
  session_id: string;
  topic?: string;
  explanation?: string;
  examples?: string[];
  practice_questions?: string[];
  encouragement?: string;
  recommendations?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "student" | "tutor";
  text: string;
  timestamp: string;
  data?: TutorChatResponse;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Sends a query message to the AI Tutor Agent backend endpoint.
 */
export async function sendTutorMessage(payload: TutorChatPayload, token?: string): Promise<TutorChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/ai/tutor/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      student_id: payload.student_id || "",
      message: payload.message,
      course_id: payload.course_id || null,
      session_id: payload.session_id || null,
      student_level: payload.student_level || "beginner",
      learning_style: payload.learning_style || "visual",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  return response.json();
}
