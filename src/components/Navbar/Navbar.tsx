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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/90 px-4 backdrop-blur md:px-8">
      {withSidebarTrigger ? <SidebarTrigger /> : null}

      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-white shadow-xs">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Scholar</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {role ? (
              <Badge variant="secondary" className="hidden capitalize sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200">
                {role}
              </Badge>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-4">
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-36 truncate font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
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
          <Button asChild size="sm" className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-full px-6 text-xs sm:text-sm shadow-xs">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

