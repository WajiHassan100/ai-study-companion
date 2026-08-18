/**
 * Shared API fetch helpers
 * =========================
 * Attaches the current Supabase session token (or workspace demo token)
 * to every backend call, ensuring requests authenticate seamlessly.
 */

import { supabase } from "@/integrations/supabase/client";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Returns auth headers for the current Supabase session or demo session.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  let token: string | undefined;

  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token;
  } catch {}

  if (!token && typeof window !== "undefined") {
    try {
      const demo = localStorage.getItem("scholar_demo_session");
      if (demo) {
        token = JSON.parse(demo)?.session?.access_token;
      }
    } catch {}
  }

  if (!token) {
    token = "mock_jwt_token_demo_student";
  }

  return { Authorization: `Bearer ${token}` };
}

/**
 * fetch() wrapper that merges in the bearer token and a JSON content
 * type when a body is present. Callers can still pass their own headers.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = await getAuthHeaders();
  for (const [key, value] of Object.entries(auth)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
