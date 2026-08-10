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
          redirectTo: `${window.location.origin}/dashboard`,
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
                <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                  Continue with Google
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
