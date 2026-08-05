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

      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground">
          <span className="text-emerald-700 dark:text-emerald-400">scholar</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            ai
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            Products <span className="text-xs">▾</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            Solutions <span className="text-xs">▾</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            Resources <span className="text-xs">▾</span>
          </button>
          <Link to="/courses/biol_101" className="hover:text-foreground transition-colors">
            RAG Knowledge Studio
          </Link>
          <Link to="/assignments" className="hover:text-foreground transition-colors">
            Assignments & Auto-Grader
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
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 font-semibold">
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
            <Button asChild variant="outline" size="sm" className="rounded-full px-5 text-xs font-bold border-border/80 hidden sm:inline-flex">
              <Link to="/dashboard/student">Join a Space</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full px-5 text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 hover:bg-blue-200">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <Link to="/auth">Demo</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

