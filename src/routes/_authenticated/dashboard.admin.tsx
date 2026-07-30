import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users, GraduationCap, UserCog } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { AiAssistantPanel } from "@/components/DashboardCards/AiAssistantPanel";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Scholar" },
      { name: "description", content: "Manage accounts and roles across the school assistant." },
      { property: "og:title", content: "Admin Dashboard — Scholar" },
      {
        property: "og:description",
        content: "Manage accounts and roles across the school assistant.",
      },
    ],
  }),
  component: AdminDashboard,
});

interface ManagedUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  role: AppRole | null;
}

const ROLES: AppRole[] = ["student", "teacher", "admin"];

function AdminDashboard() {
  const { role: myRole, loading } = useAuth();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    enabled: myRole === "admin",
    queryFn: async (): Promise<ManagedUser[]> => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role as AppRole]));
      return (profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.id) ?? null }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, nextRole }: { userId: string; nextRole: AppRole }) => {
      const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delError) throw delError;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: nextRole });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const users = usersQuery.data ?? [];
  const counts = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const columns: Column<ManagedUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => <span className="font-medium">{u.full_name || "—"}</span>,
    },
    { key: "email", header: "Email", render: (u) => u.email || "—" },
    {
      key: "joined",
      header: "Joined",
      render: (u) => new Date(u.created_at).toLocaleDateString(),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Select
          value={u.role ?? undefined}
          onValueChange={(value) => updateRole.mutate({ userId: u.id, nextRole: value as AppRole })}
        >
          <SelectTrigger className="w-36 capitalize">
            <SelectValue placeholder="No role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (myRole !== "admin") {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert variant="destructive">
          <AlertTitle>Admins only</AlertTitle>
          <AlertDescription>
            You need the admin role to open this area. Ask an existing administrator to grant it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Administration</h1>
        <p className="mt-1 text-muted-foreground">
          Accounts and roles are live data. Change a role and it applies immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total accounts" value={counts.total} icon={Users} />
        <StatCard title="Students" value={counts.students} icon={GraduationCap} />
        <StatCard title="Teachers" value={counts.teachers} icon={UserCog} />
        <StatCard title="Admins" value={counts.admins} icon={ShieldCheck} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-semibold">User management</h2>
          {usersQuery.isFetching ? <Badge variant="outline">Refreshing</Badge> : null}
        </div>
        {usersQuery.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <DataTable columns={columns} rows={users} getRowId={(u) => u.id} emptyMessage="No accounts yet." />
        )}
      </div>

      <AiAssistantPanel
        title="AI Operations Assistant"
        description="Will answer questions about enrolment, activity and school-wide trends."
        suggestions={["Who joined this week?", "Summarise activity", "Flag inactive accounts"]}
      />
    </div>
  );
}
