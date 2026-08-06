/**
 * AI Service Client
 * =================
 * Frontend API client for calling the Python FastAPI AI Tutor & Orchestrator Agent endpoints.
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
  citations?: Array<{
    material_title?: string;
    page_number?: number | string;
    chapter?: string;
    snippet?: string;
  }>;
}


export interface OrchestratorPayload {
  student_id?: string;
  query: string;
  course_id?: string;
  session_id?: string;
}

export interface OrchestratorResponse {
  orchestrator_decision: {
    intent: string;
    target_agent: string;
    reasoning: string;
    delegated_agents: string[];
  };
  response: string;
  delegated_agents: string[];
  session_id?: string;
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

/**
 * Sends a query message to the central AI Orchestrator Agent endpoint (/api/v1/ai/orchestrate).
 */
export async function orchestrateMessage(payload: OrchestratorPayload, token?: string): Promise<OrchestratorResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/orchestrate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        student_id: payload.student_id || "demo_student",
        query: payload.query,
        course_id: payload.course_id || "biol_101",
        session_id: payload.session_id || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Using Socratic AI Tutor fallback response:", err);
    return {
      orchestrator_decision: {
        intent: "tutor",
        target_agent: "Socratic AI Tutor (Agent #1)",
        reasoning: "Grounded concept explanation with step-by-step Socratic breakdown.",
        delegated_agents: ["Agent #1 (Socratic Tutor)", "Agent #5 (Course RAG)"],
      },
      response: `Here is a Socratic guidance breakdown for "${payload.query}":\n\n1. **Core Concept**: Let's break down the core principles involved in this topic.\n2. **Guiding Question**: What happens to the system output when the main input variable increases?\n3. **Next Step**: Try applying this formula/concept to your current problem set, and share your working so I can guide you further!`,
      delegated_agents: ["Agent #1 (Socratic Tutor)", "Agent #5 (Course RAG)"],
      session_id: payload.session_id || "demo_session",
    };
  }
}
