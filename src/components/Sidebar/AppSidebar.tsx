import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  GaugeCircle,
  GraduationCap,
  Users,
  ShieldCheck,
  Bot,
  Brain,
  Network,
  UserCircle2,
  Waypoints,
  History,
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

type Item = { title: string; url: string; icon: LucideIcon; courseId?: string };
type Group = { label: string; items: Item[] };

const learnStudent: Item[] = [
  { title: "Overview", url: "/dashboard/student", icon: GaugeCircle },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
];

const aiItems: Item[] = [
  { title: "AI Learning Suite", url: "/agents", icon: Bot },
  { title: "AI Tutor", url: "/tutor", icon: Brain },
  { title: "System Architecture", url: "/system", icon: Network },
];

const youItems: Item[] = [
  { title: "Learning Profile", url: "/profile", icon: UserCircle2 },
  { title: "Progress & Mastery", url: "/mastery", icon: Waypoints },
  { title: "Activity", url: "/activity", icon: History },
];

const teacherItems: Item[] = [
  { title: "Overview", url: "/dashboard/teacher", icon: GaugeCircle },
  { title: "Classes", url: "/dashboard/teacher", icon: GraduationCap },
  { title: "Assignments", url: "/assignments", icon: Users },
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

  const groups: Group[] =
    role === "admin"
      ? [{ label: "Administration", items: adminItems }, { label: "AI Agents", items: aiItems }]
      : role === "teacher"
        ? [
            { label: "Teach", items: teacherItems },
            { label: "AI Agents", items: aiItems },
            { label: "You", items: youItems },
          ]
        : [
            { label: "Learn", items: learnStudent },
            { label: "AI Agents", items: aiItems },
            { label: "You", items: youItems },
          ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.16em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={`${group.label}-${item.title}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.courseId
                          ? currentPath.startsWith("/courses/")
                          : currentPath === item.url || currentPath.startsWith(`${item.url}/`)
                      }
                    >
                      {item.courseId ? (
                        <Link
                          to="/courses/$courseId"
                          params={{ courseId: item.courseId }}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      ) : (
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
