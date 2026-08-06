# Multi-Agent AI Platform — Frontend Redesign

## Where the frontend stands today

- Working: auth + roles, student/teacher/admin dashboards, assignments page, course detail page, landing + auth pages, Emerald Prestige theme (Sora/Manrope).
- Agent UIs exist as 8 stacked cards inside one long student dashboard column (`Tutor`, `Coach`, `Weakness`, `Quiz`, `Exam`, `Feedback`, `Planner`, `Teacher`). They work, but they are buried in a single scroll and invisible as a "team of agents".
- API layer (`src/lib/api/*`) already wraps every agent endpoint — all of it will be reused unchanged.
- Gaps: no agents hub, no orchestrator visualization, no student profile page, no mastery graph, no activity timeline, no notifications, no dark-mode toggle, no dedicated tutor workspace.

## What gets built

### A. Information architecture (new shell)

Sidebar is regrouped so the platform reads as an AI ecosystem:

```text
Learn        Overview · Courses · Assignments
AI Agents    Agents Hub · Tutor Workspace · System Overview
You          Learning Profile · Mastery Map · Activity
```

New routes (all under `_authenticated`, existing routes untouched):

| Route | Purpose |
| --- | --- |
| `/agents` | AI Agents Hub — every agent as a launchable card |
| `/agents/$agentId` | Agent workspace; renders the existing agent card full-screen |
| `/tutor` | Educational AI tutor workspace |
| `/system` | Orchestrator / multi-agent architecture visualization |
| `/profile` | AI learning identity |
| `/mastery` | Knowledge skill tree + topic map |
| `/activity` | AI activity timeline |

### B. Page-by-page

1. **Student dashboard → AI command center.** Replaces the stacked-card wall with a bento grid: time-aware greeting, "AI Coach recommends…" hero recommendation, today's objectives, next deadlines, weak-topic chips, mini mastery ring, recent AI activity strip, and quick-launch tiles for the 9 agents. Heavy agent cards move to their own workspaces.
2. **AI Agents Hub.** One card per agent: icon, description, live status pill (Active / Idle / Needs input), last activity line, capability bullets, Launch button. Grid, hover lift, filter by category.
3. **AI System Overview.** Animated orchestrator diagram: Student Request → Orchestrator → fan-out to the 8 specialist agents, SVG connectors with flow animation, click a node for its role/inputs/outputs. Built for FYP demo.
4. **Learning Profile.** Learning style, level, strengths/weaknesses, productive-hours heatmap, average session length, improvement trendline — styled as an AI-generated identity card.
5. **Mastery Map.** SVG skill tree (subject → topic → subtopic) with green/amber/red state, plus a topic-map view and drill-down panel that can hand a weak topic straight to the Tutor.
6. **Tutor Workspace.** Three panes: left = course material + current learning goal, center = conversation, right = AI suggestions + practice questions. Mode selector and action buttons: Explain Simply · Give Example · Test Me · Create Summary · Show Visualization.
7. **Course page.** Tabbed: Overview · Materials · Chat with Course (RAG) · Practice Tests · Assignments · Progress · Weak Concepts — so each course owns an assistant.
8. **Activity Timeline.** Day-grouped feed of agent events with agent icon, time, summary, and a jump-back link.
9. **Notifications.** Bell in the navbar with an AI-insight popover (mastery changes, coach nudges, deadlines) plus unread badge.

### C. Cross-cutting

- **Dark mode:** full dark token set in `src/styles.css` + `next-themes`-style toggle in the navbar, persisted; every new surface verified in both themes.
- **Design system:** shared `AgentCard`, `SectionHeader`, `InsightCard`, `StatTile`, `EmptyState` primitives; consistent radii, elevation, hover/lift and fade-in motion.
- **Responsive:** grid → single column with `grid-cols-[minmax(0,1fr)_auto]` header pattern; sidebar collapses to icons on tablet, off-canvas on mobile; tutor panes stack into tabs on mobile.

## Technical notes

- React + TanStack Start only; no backend or API changes. `src/lib/api/*` calls stay exactly as they are.
- Existing agent card components are preserved and re-mounted inside the new workspaces rather than rewritten, so nothing currently working breaks.
- New shared UI lives in `src/components/agents/`, `src/components/insights/`, `src/components/mastery/`.
- Colors stay semantic tokens in `src/styles.css` — no hardcoded color utilities.
- Adding a 10th agent later = one entry in the agent registry (`src/lib/agents.ts`) and it appears in the hub, sidebar, and orchestrator diagram automatically.

## Build order

1. Design tokens + dark mode + shared primitives + agent registry
2. New shell: sidebar groups, navbar with theme toggle and notifications
3. AI command-center dashboard
4. Agents Hub + agent workspaces
5. Tutor workspace
6. System overview visualization
7. Profile, Mastery Map, Activity Timeline
8. Course page tabs
9. Responsive + dark-mode pass across all pages
