import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { Navbar } from "@/components/Navbar/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      // If URL has access token or OAuth code, wait for auth listener to complete session storage
      if (
        typeof window !== "undefined" &&
        (window.location.hash.includes("access_token") || window.location.search.includes("code="))
      ) {
        return;
      }
      navigate({ to: "/auth", replace: true });
    } else {
      setChecking(false);
    }
  }, [session, loading, navigate]);

  if (loading || (checking && !session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground font-medium text-sm">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        Opening dashboard...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar withSidebarTrigger />
          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
