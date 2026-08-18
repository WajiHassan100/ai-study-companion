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
  loginDemo: (role?: AppRole, email?: string, name?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_STORAGE_KEY = "scholar_demo_session";

function createMockSession(role: AppRole = "student", email = "student@scholar.com", name = "Student User"): { session: Session; user: User; profile: Profile; role: AppRole } {
  const userId = `demo_${role}_${Date.now()}`;
  const mockUser: User = {
    id: userId,
    app_metadata: { provider: "email" },
    user_metadata: { full_name: name, role },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email,
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: `mock_jwt_token_${userId}`,
    token_type: "bearer",
    expires_in: 3600 * 24 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
    refresh_token: `mock_refresh_token_${userId}`,
    user: mockUser,
  };

  const mockProfile: Profile = {
    id: userId,
    full_name: name,
    email,
  };

  return { session: mockSession, user: mockUser, profile: mockProfile, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserData(userId: string, userObj?: User | null) {
    const userMeta = userObj?.user_metadata;
    const defaultProfile: Profile = {
      id: userId,
      full_name: userMeta?.full_name || userMeta?.name || userObj?.email?.split("@")[0] || "Student",
      email: userObj?.email || null,
    };

    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle(),
      ]);

      const fetchedProfile = profileRes?.data as Profile | null;
      setProfile(fetchedProfile ?? defaultProfile);
      setRole((roleRes?.data?.role as AppRole | undefined) ?? (userMeta?.role as AppRole) ?? "student");
    } catch {
      setProfile(defaultProfile);
      setRole((userMeta?.role as AppRole) ?? "student");
    }
  }

  const loginDemo = (selectedRole: AppRole = "student", email = "student@scholar.com", name = "Student User") => {
    const mock = createMockSession(selectedRole, email, name);
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mock));
    } catch (e) {
      console.warn("Could not save demo session to storage:", e);
    }
    setSession(mock.session);
    setProfile(mock.profile);
    setRole(mock.role);
    setLoading(false);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  useEffect(() => {
    let active = true;

    // 1. Check local demo session first
    try {
      const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedDemo) {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.session?.user) {
          setSession(parsed.session);
          setProfile(parsed.profile);
          setRole(parsed.role || "student");
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to restore demo session:", e);
    }

    // 2. Try Supabase session listener
    try {
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return;
        if (nextSession) {
          setSession(nextSession);
          if (nextSession?.user) {
            setTimeout(async () => {
              if (active) {
                await loadUserData(nextSession.user.id, nextSession.user);
                setLoading(false);
              }
            }, 0);
          } else {
            setLoading(false);
          }
        }
      });

      supabase.auth
        .getSession()
        .then(async ({ data }) => {
          if (!active) return;
          if (data.session) {
            setSession(data.session);
            if (data.session?.user) {
              await loadUserData(data.session.user.id, data.session.user);
            }
          }
          setLoading(false);
        })
        .catch(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
        try {
          subscription.subscription.unsubscribe();
        } catch {}
      };
    } catch (err) {
      console.warn("Supabase auth init notice:", err);
      if (active) setLoading(false);
    }
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
      loginDemo,
      signOut,
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
