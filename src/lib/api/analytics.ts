/**
 * Dashboard Analytics API client
 * ================================
 * Fetches aggregated student analytics from the backend
 * for the AI Daily Briefing, Learning Intelligence,
 * Agent Hub, and Assistant Panel components.
 */

import { API_BASE_URL, apiFetch } from "./client";

// ── Types ────────────────────────────────────────────────────────────────

export interface WeakTopic {
  topic: string;
  mastery_pct: number;
  course: string;
}

export interface RecommendedAction {
  title: string;
  detail: string;
  priority: number;
  prompt: string;
}

export interface Recommendation {
  text: string;
  detail: string;
  action: string;
  prompt: string;
}

export interface AgentStatus {
  status: string;
  last_activity: string;
}

export interface RecentConversation {
  id: string;
  title: string;
  time: string;
  prompt: string;
}

export interface IndexedDocument {
  id: string;
  title: string;
  pages: number;
  course: string;
}

export interface DashboardAnalytics {
  // AiDailyBriefing
  streak_days: number;
  streak_summary: string;
  weak_topics: WeakTopic[];
  recommended_actions: RecommendedAction[];

  // AiLearningIntelligence
  consistency_score: number;
  consistency_label: string;
  performance_trend_pct: number;
  performance_trend_label: string;
  prediction_pct: number;
  prediction_label: string;
  recommendations: Recommendation[];

  // AiAgentHub
  agent_statuses: Record<string, AgentStatus>;

  // AiAssistantPanel
  recent_conversations: RecentConversation[];
  indexed_documents: IndexedDocument[];
}

// ── API Function ─────────────────────────────────────────────────────────

export async function getDashboardAnalytics(
  studentId: string
): Promise<DashboardAnalytics> {
  const res = await apiFetch(
    `${API_BASE_URL}/student/${encodeURIComponent(studentId)}/dashboard-analytics`
  );

  if (!res.ok) {
    throw new Error(`Dashboard analytics fetch failed (${res.status})`);
  }

  return res.json();
}
