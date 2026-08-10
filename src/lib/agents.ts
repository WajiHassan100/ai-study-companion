import {
  Brain,
  Compass,
  CalendarRange,
  ListChecks,
  FileCheck2,
  MessageSquareQuote,
  Library,
  Radar,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type AgentCategory = "learning" | "assessment" | "planning" | "teaching";
export type AgentStatus = "active" | "idle" | "needs-input";

export interface AgentDefinition {
  id: string;
  number: number;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  category: AgentCategory;
  status: AgentStatus;
  lastActivity: string;
  capabilities: string[];
  /** Route the "Launch" button points to. */
  route: string;
}

export const AGENT_CATEGORY_LABEL: Record<AgentCategory, string> = {
  learning: "Learning",
  assessment: "Assessment",
  planning: "Planning",
  teaching: "Teaching",
};

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  active: "Active",
  idle: "Idle",
  "needs-input": "Needs input",
};

export const agents: AgentDefinition[] = [
  {
    id: "tutor",
    number: 1,
    name: "Personal Socratic AI Tutor",
    shortName: "AI Tutor",
    tagline: "Explains any concept, step by step",
    description:
      "Adaptive explanations with scaled hints, worked examples, and practice questions tuned to your level and learning style.",
    icon: Brain,
    category: "learning",
    status: "active",
    lastActivity: "Explained light-dependent reactions",
    capabilities: ["Guided hint scaling", "Worked examples", "Mathematical formulas"],
    route: "/tutor",
  },
  {
    id: "coach",
    number: 2,
    name: "Academic Mentor & Consistency Coach",
    shortName: "Academic Coach",
    tagline: "Keeps your study habits on track",
    description:
      "Reviews study momentum, streaks, and workload to nudge you toward the highest-impact learning action each day.",
    icon: Compass,
    category: "planning",
    status: "active",
    lastActivity: "Recommended a 25-minute focus block",
    capabilities: ["Daily nudges", "Momentum tracking", "Workload balancing"],
    route: "/agents/coach",
  },
  {
    id: "planner",
    number: 3,
    name: "Personalized Study Planner",
    shortName: "Study Planner",
    tagline: "Builds revision schedules that fit",
    description:
      "Generates intelligent revision study plans across all your courses and rebalances them when deadlines move.",
    icon: CalendarRange,
    category: "planning",
    status: "idle",
    lastActivity: "Built a 7-day revision plan",
    capabilities: ["Smart scheduling", "Deadline-aware", "Auto rebalance"],
    route: "/agents/planner",
  },
  {
    id: "quiz",
    number: 4,
    name: "Adaptive Quiz & Flashcards",
    shortName: "Quiz Studio",
    tagline: "Instant practice on any topic",
    description:
      "Creates MCQs and active recall flashcards from your course material, then updates your mastery profile from the results.",
    icon: ListChecks,
    category: "assessment",
    status: "idle",
    lastActivity: "Generated 10 MCQs on cell energy",
    capabilities: ["MCQ generation", "Adaptive difficulty", "Mastery feedback"],
    route: "/agents/quiz",
  },
  {
    id: "exam",
    number: 5,
    name: "Practice Exam Simulator",
    shortName: "Exam Simulator",
    tagline: "Full mock papers under timed conditions",
    description:
      "Assembles exam-style papers with mark schemes so you can rehearse the real thing before it counts.",
    icon: FileCheck2,
    category: "assessment",
    status: "idle",
    lastActivity: "Simulated a BIOL 101 midterm",
    capabilities: ["Timed papers", "Mark schemes", "Section weighting"],
    route: "/agents/exam",
  },
  {
    id: "feedback",
    number: 6,
    name: "Assignment Homework Coach",
    shortName: "Homework Coach",
    tagline: "Rubric-grade feedback before you submit",
    description:
      "Reads your draft against the rubric and returns structured strengths, gaps, and concrete revision steps.",
    icon: MessageSquareQuote,
    category: "assessment",
    status: "needs-input",
    lastActivity: "Awaiting a draft to review",
    capabilities: ["Rubric alignment", "Structured critique", "Revision steps"],
    route: "/agents/feedback",
  },
  {
    id: "rag",
    number: 7,
    name: "Course Document Assistant",
    shortName: "Document Studio",
    tagline: "Answers grounded in your own course documents",
    description:
      "Indexes lecture slides and PDFs, then answers strictly from them with page-level citations you can verify.",
    icon: Library,
    category: "learning",
    status: "active",
    lastActivity: "Cited 3 pages from Lecture 5",
    capabilities: ["Document search", "Page citations", "File upload"],
    route: "/courses/biol_101",
  },
  {
    id: "profiler",
    number: 8,
    name: "Mastery & Skill Diagnostics",
    shortName: "Progress Diagnostics",
    tagline: "Finds knowledge gaps and builds mastery",
    description:
      "Continuously assesses your performance to surface weak topics and guide your tutoring sessions.",
    icon: Radar,
    category: "learning",
    status: "active",
    lastActivity: "Flagged 2 weak topics in MATH 201",
    capabilities: ["Gap detection", "Mastery scoring", "Tutor handoff"],
    route: "/agents/profiler",
  },
  {
    id: "teacher",
    number: 9,
    name: "Teacher Assistant & Educator Co-Pilot",
    shortName: "Teacher Assistant",
    tagline: "Grading and class insight for educators",
    description:
      "Auto-grades student submissions against rubrics and summarizes topic trends across the entire class.",
    icon: GraduationCap,
    category: "teaching",
    status: "idle",
    lastActivity: "Graded 18 essay submissions",
    capabilities: ["Auto-grading", "Class analytics", "Feedback drafting"],
    route: "/agents/teacher",
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return agents.find((a) => a.id === id);
}
