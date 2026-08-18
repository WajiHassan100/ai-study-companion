/**
 * Shared API fetch helpers
 * =========================
 * Attaches the current Supabase session token to every backend call, so the
 * FastAPI backend (which now verifies Supabase-issued JWTs) can authenticate
 * the request as the real user instead of an anonymous "demo_student".
 */

import { supabase } from "@/integrations/supabase/client";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Returns auth headers for the current Supabase session, if any.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * fetch() wrapper that merges in the Supabase bearer token and a JSON content
 * type when a body is present. Callers can still pass their own headers.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = await getAuthHeaders();
  for (const [key, value] of Object.entries(auth)) {
    headers.set(key, value);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
