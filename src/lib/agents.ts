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
    name: "Socratic Tutor Agent",
    shortName: "Tutor",
    tagline: "Explains any concept, step by step",
    description:
      "Adaptive explanations with scaled hints, worked examples and practice questions tuned to your level and learning style.",
    icon: Brain,
    category: "learning",
    status: "active",
    lastActivity: "Explained light-dependent reactions",
    capabilities: ["Adaptive hint scaling", "Worked examples", "LaTeX math rendering"],
    route: "/tutor",
  },
  {
    id: "coach",
    number: 2,
    name: "Learning Coach Agent",
    shortName: "Coach",
    tagline: "Keeps your study habits on track",
    description:
      "Reviews momentum, streaks and workload to nudge you toward the highest-impact next action each day.",
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
    name: "Study Planner Agent",
    shortName: "Planner",
    tagline: "Builds revision schedules that fit",
    description:
      "Generates spaced-repetition study plans across all your courses and rebalances them when deadlines move.",
    icon: CalendarRange,
    category: "planning",
    status: "idle",
    lastActivity: "Built a 7-day revision plan",
    capabilities: ["Spaced repetition", "Deadline-aware", "Auto rebalance"],
    route: "/agents/planner",
  },
  {
    id: "quiz",
    number: 4,
    name: "Quiz Generator Agent",
    shortName: "Quiz",
    tagline: "Instant practice on any topic",
    description:
      "Creates MCQs and short-answer drills from your course material, then updates your mastery profile from the results.",
    icon: ListChecks,
    category: "assessment",
    status: "idle",
    lastActivity: "Generated 10 MCQs on cell energy",
    capabilities: ["MCQ generation", "Difficulty scaling", "Mastery feedback"],
    route: "/agents/quiz",
  },
  {
    id: "exam",
    number: 5,
    name: "Exam Simulator Agent",
    shortName: "Exam",
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
    name: "Assignment Feedback Agent",
    shortName: "Feedback",
    tagline: "Rubric-grade feedback before you submit",
    description:
      "Reads your draft against the rubric and returns structured strengths, gaps and concrete revision steps.",
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
    name: "Course RAG Agent",
    shortName: "Course RAG",
    tagline: "Answers grounded in your own documents",
    description:
      "Indexes lecture slides and PDFs, then answers strictly from them with page-level citations you can verify.",
    icon: Library,
    category: "learning",
    status: "active",
    lastActivity: "Cited 3 pages from Lecture 5",
    capabilities: ["Vector search", "Page citations", "Document upload"],
    route: "/courses/biol_101",
  },
  {
    id: "profiler",
    number: 8,
    name: "Weakness Profiler Agent",
    shortName: "Profiler",
    tagline: "Finds the gaps you can't see",
    description:
      "Continuously profiles your performance to surface weak topics and route them back to the Tutor.",
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
    name: "Teacher Assistant Agent",
    shortName: "Teacher",
    tagline: "Grading and class insight for educators",
    description:
      "Auto-grades submissions against a rubric and summarises where a whole cohort is struggling.",
    icon: GraduationCap,
    category: "teaching",
    status: "idle",
    lastActivity: "Graded 18 essay submissions",
    capabilities: ["Auto-grading", "Cohort analytics", "Feedback drafting"],
    route: "/agents/teacher",
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return agents.find((a) => a.id === id);
}
