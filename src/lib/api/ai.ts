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

import { apiFetch, API_BASE_URL } from "./client";

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

  const response = await apiFetch(`${API_BASE_URL}/ai/tutor/chat`, {
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

  const response = await apiFetch(`${API_BASE_URL}/ai/orchestrate`, {
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
    const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  return response.json();
}

interface StreamHandlers {
  onToken: (text: string) => void;
  onComplete: (data: TutorChatResponse) => void;
  onError: (err: Error) => void;
}

/**
 * Streams a tutor response token-by-token via the backend SSE endpoint
 * (POST /ai/tutor/chat/stream). Events: `token`, `complete`, `error`.
 */
export async function streamTutorMessage(
  payload: TutorChatPayload,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/ai/tutor/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: payload.student_id || "",
      message: payload.message,
      course_id: payload.course_id || null,
      session_id: payload.session_id || null,
      student_level: payload.student_level || "beginner",
      learning_style: payload.learning_style || "visual",
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({ detail: `Server returned status ${response.status}` }));
    throw new Error(errorData.detail || `Server returned status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleEvent = (rawEvent: string) => {
    const line = rawEvent.split("\n").find((l) => l.startsWith("data: "));
    if (!line) return;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.type === "token") {
        handlers.onToken(data.content ?? "");
      } else if (data.type === "complete") {
        handlers.onComplete(data.content as TutorChatResponse);
      } else if (data.type === "error") {
        handlers.onError(new Error(data.content ?? "Stream error"));
      }
    } catch {
      // Ignore malformed SSE events.
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const evt of events) {
      handleEvent(evt);
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) {
    handleEvent(buffer);
  }
}
