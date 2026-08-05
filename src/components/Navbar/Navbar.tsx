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

        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
          <Link to="/dashboard/student" className="hover:text-emerald-700 transition-colors">
            Student Workspace
          </Link>
          <Link to="/courses/biol_101" className="hover:text-emerald-700 transition-colors">
            RAG Document Studio
          </Link>
          <Link to="/assignments" className="hover:text-emerald-700 transition-colors">
            Assignments & Auto-Grader
          </Link>
          <Link to="/dashboard/teacher" className="hover:text-emerald-700 transition-colors">
            Teacher Portal
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
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
                  <Link to="/dashboard/student">Student Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assignments">Assignments Hub</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/teacher">Teacher Assistant</Link>
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
            <Button asChild variant="outline" size="sm" className="rounded-full px-5 text-xs font-bold border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 hidden sm:inline-flex">
              <Link to="/dashboard/student">Open Student Dashboard</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-6 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs">
              <Link to="/auth">Sign In / Register</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

