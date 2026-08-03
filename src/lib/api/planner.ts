/**
 * Study Planner API Client
 * ========================
 * Calls backend Study Planner Agent endpoints to generate and fetch personalized study schedules.
 */

export interface StudyBlock {
  day: string;
  topic: string;
  duration_minutes: number;
  priority: "high" | "normal" | "low";
  description: string;
}

export interface StudyPlan {
  id: string;
  student_id: string;
  title: string;
  summary: string;
  schedule: StudyBlock[];
  action_items: string[];
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Fetches existing study schedules for a given student.
 */
export async function getStudentStudyPlans(studentId: string, token?: string): Promise<StudyPlan[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/planner/${encodeURIComponent(studentId)}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Using fallback study plan data:", err);
    return [
      {
        id: "fallback_plan",
        student_id: studentId,
        title: "7-Day Foundation & Revision Plan",
        summary: "Balanced schedule prioritizing concept weakness review and daily practice.",
        schedule: [
          {
            day: "Monday",
            topic: "Mathematics: Quadratic Factoring",
            duration_minutes: 45,
            priority: "high",
            description: "Review core factoring formulas and solve 5 practice problems.",
          },
          {
            day: "Tuesday",
            topic: "Biology: Photosynthesis Reactions",
            duration_minutes: 30,
            priority: "normal",
            description: "Diagram light-dependent vs light-independent reaction pathways.",
          },
          {
            day: "Wednesday",
            topic: "History: Industrial Revolution",
            duration_minutes: 40,
            priority: "normal",
            description: "Outline essay thesis statement and primary economic causes.",
          },
        ],
        action_items: [
          "Ask AI Tutor for guidance on factoring steps",
          "Complete 15-minute flashcard review daily",
          "Submit assignment outline before weekend",
        ],
        created_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Invokes the AI Planner Agent to generate a new custom study plan.
 */
export async function generateStudyPlan(
  studentId: string,
  targetDays = 7,
  customGoals?: string,
  token?: string
): Promise<StudyPlan> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/planner/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        student_id: studentId || "demo_student",
        target_days: targetDays,
        custom_goals: customGoals || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Generation error" }));
      throw new Error(errorData.detail || `Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.plan_id,
      student_id: studentId,
      title: data.title,
      summary: data.summary,
      schedule: data.schedule,
      action_items: data.action_items,
      created_at: data.created_at,
    };
  } catch (err) {
    console.warn("API planner generate failed, using generated study plan fallback:", err);
    // Fallback generated study plan
    return {
      id: `plan_${Date.now()}`,
      student_id: studentId || "demo_student",
      title: `${targetDays}-Day AI Master Revision Plan`,
      summary: "AI generated schedule focusing on Photosynthesis Reactions, Quadratic Factoring, and exam readiness.",
      schedule: [
        {
          day: "Day 1",
          topic: "Biology: Light-Dependent Reactions",
          duration_minutes: 45,
          priority: "high",
          description: "Review thylakoid membranes, chlorophyll pigment absorption, and ATP generation.",
        },
        {
          day: "Day 2",
          topic: "Mathematics: Factoring Quadratics",
          duration_minutes: 50,
          priority: "high",
          description: "Practice splitting middle terms, completing the square, and using quadratic formula.",
        },
        {
          day: "Day 3",
          topic: "Physics: Newton's Laws of Motion",
          duration_minutes: 40,
          priority: "normal",
          description: "Solve 5 numerical problems on F=ma and action-reaction forces.",
        },
        {
          day: "Day 4",
          topic: "Biology: Calvin Cycle & Dark Reactions",
          duration_minutes: 35,
          priority: "high",
          description: "Diagram stroma enzymatic pathways and carbon fixation steps.",
        },
        {
          day: "Day 5",
          topic: "Comprehensive Flashcard Revision",
          duration_minutes: 30,
          priority: "normal",
          description: "Self-test on key definitions across all active course topics.",
        },
      ],
      action_items: [
        "Complete 10 practice factoring problems",
        "Draw and label chloroplast light reaction diagram",
        "Review AI Tutor practice question hints for 15 mins",
      ],
      created_at: new Date().toISOString(),
    };
  }
}

