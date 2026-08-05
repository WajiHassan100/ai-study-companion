import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  GaugeCircle,
  GraduationCap,
  Users,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon: LucideIcon };

const studentItems: Item[] = [
  { title: "Overview", url: "/dashboard/student", icon: GaugeCircle },
  { title: "Courses", url: "/courses/biol_101", icon: BookOpen },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
];

const teacherItems: Item[] = [
  { title: "Overview", url: "/dashboard/teacher", icon: GaugeCircle },
  { title: "Classes", url: "/dashboard/teacher", icon: GraduationCap },
  { title: "Roster", url: "/dashboard/teacher", icon: Users },
];

const adminItems: Item[] = [
  { title: "Overview", url: "/dashboard/admin", icon: GaugeCircle },
  { title: "User management", url: "/dashboard/admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useAuth();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  const items = role === "admin" ? adminItems : role === "teacher" ? teacherItems : studentItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">{role ?? "Student"} workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Assistant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {!collapsed && <span>AI assistant</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
