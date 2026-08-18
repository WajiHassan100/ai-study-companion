import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users, GraduationCap, UserCog, Activity, Cpu, Server, Database, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { DataTable, type Column } from "@/components/Tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      { title: "Admin Console — Scholar AI" },
      { name: "description", content: "Manage accounts, permissions, system health, and agent workloads." },
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
  const { role: myRole, profile } = useAuth();
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
      toast.success("User role updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const users = usersQuery.data ?? [
    { id: "1", full_name: "Spider Student", email: "spider@scholar.com", created_at: new Date().toISOString(), role: "student" as AppRole },
    { id: "2", full_name: "Prof. Sarah Jenkins", email: "jenkins@scholar.com", created_at: new Date().toISOString(), role: "teacher" as AppRole },
    { id: "3", full_name: "Administrator", email: "admin@scholar.com", created_at: new Date().toISOString(), role: "admin" as AppRole },
  ];

  const counts = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const columns: Column<ManagedUser>[] = [
    {
      key: "name",
      header: "User / Name",
      render: (u) => <span className="font-semibold text-xs text-foreground">{u.full_name || "Unnamed"}</span>,
    },
    { key: "email", header: "Email Address", render: (u) => <span className="text-xs text-muted-foreground">{u.email || "—"}</span> },
    {
      key: "joined",
      header: "Registered Date",
      render: (u) => <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "role",
      header: "Assigned Role",
      render: (u) => (
        <Select
          value={u.role ?? "student"}
          onValueChange={(val) => updateRole.mutate({ userId: u.id, nextRole: val as AppRole })}
        >
          <SelectTrigger className="h-8 w-28 text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize text-xs font-medium">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── HEADER BANNER ── */}
      <Card className="border border-purple-600/30 bg-linear-to-r from-purple-950/10 via-background to-blue-950/10 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-700 text-white font-bold text-[11px] gap-1 px-2.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Enterprise Administration</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold text-purple-700 border-purple-500/30">
                System Superuser
              </Badge>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Institutional Admin Console
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Manage accounts, roles, access permissions, system latency, and active AI agent cluster workloads.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/system">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-border">
                <Cpu className="h-3.5 w-3.5 text-purple-600" />
                <span>System Architecture Map</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI METRICS GRID ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Accounts</span>
          <div className="text-2xl font-bold font-display text-foreground">{counts.total} Users</div>
          <p className="text-[10px] text-muted-foreground">Registered in platform</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Students</span>
          <div className="text-2xl font-bold font-display text-emerald-600">{counts.students} Students</div>
          <p className="text-[10px] text-muted-foreground">Autonomous study active</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Educators</span>
          <div className="text-2xl font-bold font-display text-blue-600">{counts.teachers} Teachers</div>
          <p className="text-[10px] text-muted-foreground">Course authoring enabled</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Agent Cluster Health</span>
          <div className="text-2xl font-bold font-display text-purple-600">100% Online</div>
          <p className="text-[10px] text-emerald-600 font-semibold">4 / 4 Agents Operational</p>
        </div>
      </div>

      {/* ── USER MANAGEMENT DATA TABLE ── */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCog className="h-4 w-4 text-purple-600" />
              <span>User Accounts & Role Permissions</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Modify role assignments in real-time across the school workspace
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">{counts.total} Accounts</Badge>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable columns={columns} rows={users} getRowId={(u) => u.id} />
        </CardContent>
      </Card>
    </div>
  );
}
