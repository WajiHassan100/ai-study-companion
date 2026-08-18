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
  CalendarClock,
  FileCheck,
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

const studyToolsItems: Item[] = [
  { title: "Socratic Tutor", url: "/tutor", icon: Brain },
  { title: "Study Planner", url: "/profile", icon: CalendarClock },
  { title: "Mastery Diagnostics", url: "/mastery", icon: FileCheck },
  { title: "Architecture Map", url: "/system", icon: Network },
];

const youItems: Item[] = [
  { title: "Learning Profile", url: "/profile", icon: UserCircle2 },
  { title: "Activity Log", url: "/activity", icon: History },
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
  const currentPath = useRouterState({ select: (r) => r?.location?.pathname || "" });

  const groups: Group[] =
    role === "admin"
      ? [{ label: "Administration", items: adminItems }, { label: "Study Tools", items: studyToolsItems }]
      : role === "teacher"
        ? [
            { label: "Teach", items: teacherItems },
            { label: "Study Tools", items: studyToolsItems },
            { label: "Account", items: youItems },
          ]
        : [
            { label: "Learn", items: learnStudent },
            { label: "Study Tools", items: studyToolsItems },
            { label: "Account", items: youItems },
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
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
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
