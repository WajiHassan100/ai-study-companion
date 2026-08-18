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
  MessageSquare,
  CalendarClock,
  FileCheck,
  TrendingUp,
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
    name: "Socratic Tutor",
    shortName: "Socratic Tutor",
    tagline: "Guides your thinking step-by-step with hints",
    description:
      "Adaptive explanations with scaled hints, worked examples, and step-by-step derivations without giving away answers.",
    icon: MessageSquare,
    category: "learning",
    status: "active",
    lastActivity: "Explained light-dependent reactions",
    capabilities: ["Guided hint scaling", "Worked derivations", "Socratic questioning"],
    route: "/tutor",
  },
  {
    id: "planner",
    number: 2,
    name: "Study Planner",
    shortName: "Study Planner",
    tagline: "Builds adaptive 7-day revision timetables",
    description:
      "Generates intelligent 7-day revision schedules across your courses and rebalances study blocks as deadlines shift.",
    icon: CalendarClock,
    category: "planning",
    status: "active",
    lastActivity: "Built a 7-day revision timetable",
    capabilities: ["Smart scheduling", "Deadline-aware", "Auto rebalance"],
    route: "/agents/planner",
  },
  {
    id: "quiz",
    number: 3,
    name: "Quiz & Exam Coach",
    shortName: "Quiz Studio",
    tagline: "Instant adaptive practice on any topic",
    description:
      "Creates MCQs, active recall flashcards, and mock exams from course notes, updating your mastery profile from the results.",
    icon: FileCheck,
    category: "assessment",
    status: "active",
    lastActivity: "Generated 10 MCQs on cell energy",
    capabilities: ["MCQ generation", "Adaptive difficulty", "Mastery feedback"],
    route: "/agents/quiz",
  },
  {
    id: "profiler",
    number: 4,
    name: "Mastery Analytics",
    shortName: "Mastery Analytics",
    tagline: "Finds knowledge gaps and builds retention",
    description:
      "Continuously assesses your performance, monitors spaced repetition curves, and surfaces revision priorities.",
    icon: TrendingUp,
    category: "learning",
    status: "active",
    lastActivity: "Flagged 2 weak topics in MATH 201",
    capabilities: ["Gap detection", "Mastery scoring", "Tutor handoff"],
    route: "/mastery",
  },
  {
    id: "coach",
    number: 5,
    name: "Academic Consistency Coach",
    shortName: "Consistency Coach",
    tagline: "Keeps your study habits and streaks on track",
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
    id: "exam",
    number: 6,
    name: "Practice Exam Simulator",
    shortName: "Exam Simulator",
    tagline: "Full mock papers under timed conditions",
    description:
      "Assembles exam-style papers with mark schemes so you can rehearse the real thing before it counts.",
    icon: FileCheck2,
    category: "assessment",
    status: "active",
    lastActivity: "Simulated a BIOL 101 midterm",
    capabilities: ["Timed papers", "Mark schemes", "Section weighting"],
    route: "/agents/exam",
  },
  {
    id: "feedback",
    number: 7,
    name: "Assignment Homework Coach",
    shortName: "Homework Coach",
    tagline: "Rubric-grade feedback before you submit",
    description:
      "Reads your draft against the assignment rubric and returns structured strengths, gaps, and concrete revision steps.",
    icon: MessageSquareQuote,
    category: "assessment",
    status: "needs-input",
    lastActivity: "Awaiting a draft to review",
    capabilities: ["Rubric alignment", "Structured critique", "Revision steps"],
    route: "/assignments",
  },
  {
    id: "rag",
    number: 8,
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
    id: "teacher",
    number: 9,
    name: "Teacher Assistant & Educator Co-Pilot",
    shortName: "Teacher Assistant",
    tagline: "Grading and class insight for educators",
    description:
      "Auto-grades student submissions against rubrics and summarizes topic trends across the entire class.",
    icon: GraduationCap,
    category: "teaching",
    status: "active",
    lastActivity: "Graded 18 essay submissions",
    capabilities: ["Auto-grading", "Class analytics", "Feedback drafting"],
    route: "/agents/teacher",
  },
];

const agentAliases: Record<string, string> = {
  assessment: "quiz",
  analytics: "profiler",
  tutor: "tutor",
  coach: "coach",
  planner: "planner",
  quiz: "quiz",
  exam: "exam",
  feedback: "feedback",
  assignment: "feedback",
  assignments: "feedback",
  weakness: "profiler",
  profiler: "profiler",
  teacher: "teacher",
  rag: "rag",
};

export function getAgent(id: string): AgentDefinition | undefined {
  const canonicalId = agentAliases[id.toLowerCase()] || id;
  return agents.find((a) => a.id === canonicalId);
}
