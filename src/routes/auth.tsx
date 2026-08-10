import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or register — Scholar" },
      {
        name: "description",
        content: "Create a Scholar account or sign in as a student, teacher or administrator.",
      },
      { property: "og:title", content: "Sign in or register — Scholar" },
      {
        property: "og:description",
        content: "Create a Scholar account or sign in as a student, teacher or administrator.",
      },
    ],
  }),
  component: AuthPage,
});

function safePath(value?: string) {
  if (!value) return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const target = safePath(redirect);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: target, replace: true });
    }
  }, [loading, isAuthenticated, navigate, target]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasHash = window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token");
    const hasCode = window.location.search.includes("code=");

    if (hasHash || hasCode) {
      setBusy(true);
      let isMounted = true;

      const processOAuthReturn = async () => {
        if (hasCode) {
          const urlParams = new URLSearchParams(window.location.search);
          const codeParam = urlParams.get("code");
          if (codeParam) {
            try {
              await supabase.auth.exchangeCodeForSession(codeParam);
            } catch (e) {
              console.warn("OAuth code exchange notice:", e);
            }
          }
        }

        for (let i = 0; i < 15; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session && isMounted) {
            toast.success("Successfully signed in with Google!");
            navigate({ to: target || "/dashboard/student", replace: true });
            return;
          }
          await new Promise((r) => setTimeout(r, 200));
        }

        if (isMounted) setBusy(false);
      };

      void processOAuthReturn();

      return () => {
        isMounted = false;
      };
    }
  }, [navigate, target]);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
        toast.info("Account not found. Creating your demo workspace account...");
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: email.split("@")[0], role: role || "student" },
          },
        });
        setBusy(false);
        if (signUpRes.error) {
          toast.error(signUpRes.error.message);
          return;
        }
        if (signUpRes.data.session) {
          toast.success("Account created and signed in!");
          navigate({ to: target, replace: true });
          return;
        } else {
          toast.success("Account created! Please check your email to confirm if required.");
          setAwaitingConfirm(true);
          return;
        }
      }
      setBusy(false);
      toast.error(error.message);
      return;
    }

    setBusy(false);
    navigate({ to: target, replace: true });
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, role },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setAwaitingConfirm(true);
      toast.success("Check your email to confirm your account.");
      return;
    }
    navigate({ to: target, replace: true });
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        setBusy(false);
        toast.error(`Google Sign-In Error: ${error.message}. Please enable Google provider in your Supabase Dashboard under Authentication -> Providers.`);
        return;
      }
    } catch (err: any) {
      setBusy(false);
      toast.error(err.message || "Google sign-in is not enabled for this project.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Scholar</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Your school workspace</CardTitle>
            <CardDescription>Sign in, or create an account to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            {awaitingConfirm ? (
              <div className="space-y-4 text-sm">
                <p>
                  We sent a confirmation link to <strong>{email}</strong>. Open it to activate your
                  account, then come back and sign in.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setAwaitingConfirm(false)}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-4 space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold" disabled={busy}>
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign in
                    </Button>
                  </form>

                  <div className="pt-2 space-y-2 border-t border-border/40">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Quick Fill Demo Credentials:
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-xl font-semibold border-emerald-600/30 text-emerald-800 hover:bg-emerald-50"
                        onClick={() => { setEmail("student@demo.com"); setPassword("demo123"); }}
                      >
                        🎓 Student
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-xl font-semibold border-blue-600/30 text-blue-800 hover:bg-blue-50"
                        onClick={() => { setEmail("teacher@demo.com"); setPassword("demo123"); }}
                      >
                        👩‍🏫 Teacher
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-xl font-semibold border-purple-600/30 text-purple-800 hover:bg-purple-50"
                        onClick={() => { setEmail("admin@demo.com"); setPassword("demo123"); }}
                      >
                        🛡️ Admin
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="mt-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full name</Label>
                      <Input
                        id="reg-name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-role">I am a</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="reg-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Administrator access is granted by an existing admin.
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {!awaitingConfirm ? (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 border-border hover:bg-secondary/60 py-5 font-semibold text-sm shadow-xs"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
