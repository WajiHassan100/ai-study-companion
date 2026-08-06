import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, TrendingUp, CalendarClock, Radar, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  icon: LucideIcon;
  agent: string;
  title: string;
  body: string;
  time: string;
}

const notifications: Notification[] = [
  {
    id: "n1",
    icon: TrendingUp,
    agent: "Profiler",
    title: "Mastery up in Cell Biology",
    body: "Photosynthesis moved from 61% to 78% after your last quiz.",
    time: "12m ago",
  },
  {
    id: "n2",
    icon: Radar,
    agent: "Profiler",
    title: "New weak topic detected",
    body: "Gradient vectors in MATH 201 need attention before Friday.",
    time: "1h ago",
  },
  {
    id: "n3",
    icon: CalendarClock,
    agent: "Planner",
    title: "Plan rebalanced",
    body: "Two revision blocks moved to make room for the BIOL lab.",
    time: "3h ago",
  },
  {
    id: "n4",
    icon: Sparkles,
    agent: "Coach",
    title: "Nudge: keep the streak",
    body: "A 25-minute focus block now keeps your 6-day streak alive.",
    time: "Yesterday",
  },
];

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unread = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`AI insights, ${unread} unread`}
          className="relative h-9 w-9 shrink-0 rounded-full border-border/70"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-88 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="font-display text-sm font-bold">AI insights</p>
          <Badge variant="secondary" className="text-[10px] font-bold">{unread} new</Badge>
        </div>
        <ul className="max-h-88 divide-y divide-border/50 overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <n.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-bold text-foreground">{n.title}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{n.agent} agent</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-border/60 p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs font-semibold" onClick={() => setOpen(false)}>
            <Link to="/activity">View full AI activity</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
