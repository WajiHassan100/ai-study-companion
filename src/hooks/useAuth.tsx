import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "teacher" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserData(userId: string) {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle(),
    ]);
    setProfile((profileRes.data as Profile | null) ?? null);
    setRole((roleRes.data?.role as AppRole | undefined) ?? null);
  }

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (nextSession?.user) {
        // Never await Supabase calls inside the callback itself.
        setTimeout(() => {
          if (active) void loadUserData(nextSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) await loadUserData(data.session.user.id);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      isAuthenticated: Boolean(session),
      hasRole: (r: AppRole) => role === r,
      refresh: async () => {
        if (session?.user) await loadUserData(session.user.id);
      },
    }),
    [session, profile, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
