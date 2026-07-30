import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (role === "admin") navigate({ to: "/dashboard/admin", replace: true });
    else if (role === "teacher") navigate({ to: "/dashboard/teacher", replace: true });
    else navigate({ to: "/dashboard/student", replace: true });
  }, [role, loading, navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Opening your workspace...
    </div>
  );
}
