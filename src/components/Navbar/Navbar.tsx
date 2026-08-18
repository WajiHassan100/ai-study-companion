import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, User as UserIcon, Sparkles, ArrowRight, BookOpen, ShieldCheck, Compass } from "lucide-react";
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
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationsBell } from "@/components/Navbar/NotificationsBell";

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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/85 backdrop-blur-xl px-4 sm:px-8">
      <div className="flex items-center gap-6">
        {withSidebarTrigger ? <SidebarTrigger /> : null}

        {/* SchoolAI-style Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            🎓
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold text-xl tracking-tight text-foreground">Scholar</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              AI
            </span>
          </div>
        </Link>

        {/* SchoolAI-style Role Switcher Pill (Desktop) */}
        <div className="hidden lg:flex items-center bg-secondary/80 border border-border/80 rounded-full p-1 gap-1 text-xs font-semibold text-muted-foreground shadow-xs">
          <span className="pl-3 pr-1 text-[11px] font-bold text-muted-foreground">Scholar for...</span>
          <Link
            to="/dashboard/student"
            className="px-3.5 py-1 rounded-full bg-card text-foreground font-bold shadow-xs transition-all hover:text-sky-600"
          >
            Students
          </Link>
          <Link
            to="/dashboard/teacher"
            className="px-3.5 py-1 rounded-full hover:bg-card/60 transition-all hover:text-sky-600"
          >
            Teachers
          </Link>
          <Link
            to="/dashboard/admin"
            className="px-3.5 py-1 rounded-full hover:bg-card/60 transition-all hover:text-sky-600"
          >
            Admins
          </Link>
        </div>
      </div>

      {/* Navigation Links & Action Buttons */}
      <div className="flex items-center gap-3">
        <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-muted-foreground mr-2">
          <Link to="/courses" className="hover:text-foreground transition-colors">
            Course Spaces
          </Link>
          <Link to="/tutor" search={{ topic: undefined }} className="hover:text-foreground transition-colors flex items-center gap-1 text-sky-600 dark:text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Socratic Tutor</span>
          </Link>
          <Link to="/mastery" className="hover:text-foreground transition-colors">
            Mastery Analytics
          </Link>
        </nav>

        {/* SchoolAI-style "Join a Space" Button */}
        <Link to="/courses">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-8 px-3.5 text-xs font-bold border-sky-500/30 text-sky-700 dark:text-sky-300 bg-sky-500/5 hover:bg-sky-500/15 gap-1.5 shadow-xs"
          >
            <span>Join a Space</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>

        <ThemeToggle />
        <NotificationsBell />

        {/* User Account Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors focus:outline-none cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/20">
                  {displayName[0].toUpperCase()}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="font-bold text-xs pb-1">
                <div className="text-foreground">{displayName}</div>
                <div className="text-[11px] font-normal text-muted-foreground truncate">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-xs">
                <Link to="/profile" className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-sky-600" />
                  <span>My Learning Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-xs">
                <Link to="/mastery" className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Topic Mastery & Skill Map</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-xl cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2 font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth">
            <Button size="sm" className="rounded-full h-8 px-4 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
