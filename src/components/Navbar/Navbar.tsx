import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, User as UserIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar({ withSidebarTrigger = false }: { withSidebarTrigger?: boolean }) {
  const { isAuthenticated, profile, role, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const displayName = profile?.full_name || user?.email || "Account";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur md:px-12">
      {withSidebarTrigger ? <SidebarTrigger /> : null}

      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground">
          <span className="text-emerald-700 dark:text-emerald-400">scholar</span>
          <span className="text-emerald-800 dark:text-emerald-300 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ai
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors focus:outline-none">
                AI Agents <span className="text-[10px]">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 space-y-1">
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/dashboard/student" className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-foreground text-xs">Agent #1: Socratic Tutor</span>
                  <span className="text-[11px] text-muted-foreground">Adaptive hint scaling & LaTeX math</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/courses/biol_101" className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-foreground text-xs">Agent #5: RAG PDF Studio</span>
                  <span className="text-[11px] text-muted-foreground">Vector search & page-cited answers</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/assignments" className="flex flex-col items-start gap-0.5">
                  <span className="font-bold text-foreground text-xs">Agent #6: Teacher Auto-Grader</span>
                  <span className="text-[11px] text-muted-foreground">Rubric essay grading & feedback</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors focus:outline-none">
                Solutions <span className="text-[10px]">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 space-y-1">
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/dashboard/student" className="font-semibold text-xs">For Students</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/dashboard/teacher" className="font-semibold text-xs">For Teachers & Educators</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link to="/dashboard/admin" className="font-semibold text-xs">For University Admins</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/courses/biol_101" className="hover:text-emerald-700 transition-colors">
            Course RAG Studio
          </Link>
          <Link to="/assignments" className="hover:text-emerald-700 transition-colors">
            Assignments Hub
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Button asChild size="sm" className="rounded-full px-5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs">
              <Link to="/dashboard/student">My Dashboard →</Link>
            </Button>
            {role ? (
              <Badge variant="secondary" className="hidden capitalize sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200">
                {role}
              </Badge>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 font-semibold border-emerald-600/30">
                  <UserIcon className="h-4 w-4 text-emerald-700" />
                  <span className="max-w-36 truncate font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/student">Student Workspace</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assignments">Assignments Hub</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/teacher">Teacher Portal</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm" className="rounded-full px-5 text-xs font-bold text-muted-foreground hover:text-foreground hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-6 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

