"""
Agent #0: Central AI Orchestrator Agent (orchestrator_agent.py)
====================================================================
Serves as the central decision-making and routing layer for the multi-agent
educational platform. Analyzes student requests, determines intent, routes
tasks to specialized agents, and coordinates inter-agent communication.
"""

import json
import logging
from typing import Any, Callable, Dict, List, Optional
from sqlalchemy.orm import Session as DBSession

from google import genai
from google.genai import types

from app.ai.agents.planner_agent import PlannerAgent
from app.ai.agents.profiler_agent import ProfilerAgent
from app.ai.agents.quiz_agent import QuizAgent
from app.ai.agents.rag_agent import RAGAgent
from app.ai.agents.teacher_agent import TeacherAgent
from app.ai.agents.tutor_agent import TutorAgent
from app.ai.agents.exam_agent import exam_agent
from app.ai.agents.feedback_agent import feedback_agent
from app.ai.agents.coach_agent import coach_agent
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Specialized agent singletons
planner_agent = PlannerAgent()
profiler_agent = ProfilerAgent()
quiz_agent = QuizAgent()
rag_agent = RAGAgent()
teacher_agent = TeacherAgent()
tutor_agent = TutorAgent()


class AgentRegistry:
    """Modular Registry for registering and discovering specialized AI agents."""

    def __init__(self):
        self._agents: Dict[str, Dict[str, Any]] = {}

    def register(self, key: str, name: str, description: str, handler: Callable):
        """Registers a new specialized agent with metadata and handler function."""
        self._agents[key] = {
            "name": name,
            "description": description,
            "handler": handler,
        }

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        return self._agents.get(key)

    def list_agents(self) -> List[Dict[str, str]]:
        return [
            {"key": k, "name": v["name"], "description": v["description"]}
            for k, v in self._agents.items()
        ]


class OrchestratorAgent:
    """Central AI Orchestrator Agent."""

    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.model_name = model_name
        self.api_key = getattr(settings, "gemini_api_key", None)
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

        self.registry = AgentRegistry()
        self._setup_registry()

    def _setup_registry(self):
        """Register existing 6 specialized agents into modular registry."""
        self.registry.register(
            "tutor",
            "Socratic AI Tutor (Agent #1)",
            "Handles Socratic concept explanations, step-by-step hints, LaTeX math & Mermaid flowcharts.",
            tutor_agent.ask,
        )
        self.registry.register(
            "profiler",
            "Student Profiler & Evaluator (Agent #2)",
            "Evaluates student mastery percentages (0-100%) and tracks topic weaknesses.",
            profiler_agent.evaluate_and_profile,
        )
        self.registry.register(
            "planner",
            "7-Day Revision Planner (Agent #3)",
            "Generates Spaced Repetition study timetables enriched with YouTube video lesson links.",
            planner_agent.generate_plan,
        )
        self.registry.register(
            "quiz",
            "Adaptive Quiz Generator (Agent #4)",
            "Creates dynamic multiple-choice quizzes and active recall flashcards with instant scoring.",
            quiz_agent.generate_quiz,
        )
        self.registry.register(
            "rag",
            "RAG Course Knowledge Studio (Agent #5)",
            "Indexes uploaded PDFs/DOCX notes into 768-dim dense vectors for page-cited QA.",
            rag_agent.query_course_knowledge,
        )
        self.registry.register(
            "teacher",
            "Teacher Assistant & Auto-Grader (Agent #6)",
            "Drafts minute-by-minute lesson plans and auto-grades student essay submissions.",
            teacher_agent.draft_lesson_plan,
        )
        self.registry.register(
            "exam",
            "AI Exam Generator Agent (Agent #7)",
            "Creates multi-format practice assessments (MCQs, Short, Long, Numerical, Conceptual) with automatic evaluation.",
            exam_agent.generate_exam,
        )
        self.registry.register(
            "feedback",
            "AI Assignment Feedback Agent (Agent #8)",
            "Analyzes code, math, and written submissions to generate structured 4-part feedback and log mistake patterns.",
            feedback_agent.analyze_submission,
        )
        self.registry.register(
            "coach",
            "AI Learning Coach Agent (Agent #9)",
            "Monitors study consistency, performance trends, missed sessions, and weak areas for long-term mentorship.",
            coach_agent.generate_coaching_insights,
        )

    def classify_intent(self, query: str) -> Dict[str, Any]:
        """Classifies student request intent to determine target agent and execution pipeline."""
        query_lower = query.lower()

        # Fast rule-based pattern matching fallback
        if any(w in query_lower for w in ["schedule", "plan", "timetable", "revision", "week"]):
            return {
                "intent": "planner",
                "target_agent": "7-Day Revision Planner (Agent #3)",
                "reasoning": "Detected request for study schedule / revision timetable.",
                "delegated_agents": ["Agent #3 (Study Planner)"],
            }
        if any(w in query_lower for w in ["quiz", "test", "flashcard", "mcq", "practice questions"]):
            return {
                "intent": "quiz",
                "target_agent": "Adaptive Quiz Generator (Agent #4)",
                "reasoning": "Detected request for quiz or active recall flashcards.",
                "delegated_agents": ["Agent #4 (Quiz Generator)"],
            }
        if any(w in query_lower for w in ["mastery", "weakness", "progress", "score", "level"]):
            return {
                "intent": "profiler",
                "target_agent": "Student Profiler & Evaluator (Agent #2)",
                "reasoning": "Detected query about concept weaknesses or student mastery.",
                "delegated_agents": ["Agent #2 (Student Profiler)"],
            }

        if not self.client:
            return {
                "intent": "tutor",
                "target_agent": "Socratic AI Tutor (Agent #1)",
                "reasoning": "Delegating concept query to Socratic Tutor & RAG Knowledge Base.",
                "delegated_agents": ["Agent #1 (Tutor)", "Agent #5 (RAG Engine)", "Agent #2 (Profiler)"],
            }

        prompt = f"""
You are the AI Orchestrator Agent for an AI Educational System.
Analyze the following student query and classify which specialized agent should handle it.

Available Intent Keys:
- "tutor": Academic concept questions, calculations, explanations, homework help.
- "planner": Requests for study timetables, 7-day revision plans, schedules.
- "quiz": Requests for quizzes, practice MCQs, flashcards.
- "profiler": Queries about student mastery, weakness concepts, study level.
- "teacher": Requests for lesson planning or assignment essay grading.

Student Query: "{query}"

Return a JSON object with:
{{
  "intent": "<intent_key>",
  "target_agent": "<agent_name>",
  "reasoning": "<short sentence explaining orchestrator decision>",
  "delegated_agents": ["<list of agents participating>"]
}}
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )
            return json.loads(response.text or "{}")
        except Exception as e:
            logger.error(f"Intent classification failed: {e}")
            return {
                "intent": "tutor",
                "target_agent": "Socratic AI Tutor (Agent #1)",
                "reasoning": "Defaulting to Socratic Tutor & RAG Pipeline.",
                "delegated_agents": ["Agent #1 (Tutor)", "Agent #5 (RAG Engine)", "Agent #2 (Profiler)"],
            }

    async def orchestrate(
        self,
        db: Optional[DBSession],
        student_id: str,
        query: str,
        course_id: str = "biol_101",
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Main Orchestrator Entrypoint: Coordinates multi-agent pipeline execution."""
        classification = self.classify_intent(query)
        intent = classification.get("intent", "tutor")

        logger.info(f"Orchestrator decision for '{query[:30]}...': intent={intent}")

        # PIPELINE 1: TUTOR + RAG + PROFILER
        if intent == "tutor":
            # Step A: Query Agent #5 RAG Knowledge Base for course document passages
            rag_results = rag_agent.query_course_knowledge(course_id=course_id, query=query, top_k=2)
            rag_citations = rag_results.get("cited_sources", [])

            # Step B: Pass query to Agent #1 Socratic Tutor
            if db:
                tutor_res = await tutor_agent.ask(
                    db=db,
                    student_id=student_id,
                    message=query,
                    course_id=course_id,
                    session_id=session_id,
                )
                answer_text = tutor_res.get("answer", "")
                sess_id = tutor_res.get("session_id")
            else:
                answer_text = f"Socratic response for '{query}' grounded in course RAG context."
                sess_id = session_id or "demo_session"

            return {
                "orchestrator_decision": classification,
                "response": answer_text,
                "rag_passages_retrieved": len(rag_citations),
                "rag_citations": [c.material_title if hasattr(c, "material_title") else str(c) for c in rag_citations],
                "session_id": sess_id,
                "delegated_agents": [
                    "Agent #5 (RAG Vector Store)",
                    "Agent #1 (Socratic AI Tutor)",
                    "Agent #2 (Student Profiler)",
                ],
            }

        # PIPELINE 2: REVISION PLANNER
        elif intent == "planner":
            if db:
                plan = planner_agent.generate_plan(db=db, student_id=student_id, target_days=7, custom_goals=query)
            else:
                plan = {"title": "7-Day Revision Plan", "schedule": []}
            return {
                "orchestrator_decision": classification,
                "response": f"Generated your personalized 7-Day Spaced Repetition Revision Plan with video lessons!",
                "plan": plan,
                "session_id": session_id,
                "delegated_agents": ["Agent #3 (7-Day Revision Planner)"],
            }

        # PIPELINE 3: QUIZ & FLASHCARDS
        elif intent == "quiz":
            if db:
                quiz = await quiz_agent.generate_quiz(db=db, student_id=student_id, topic=query, num_questions=5)
            else:
                quiz = {"title": query, "questions": []}
            return {
                "orchestrator_decision": classification,
                "response": f"Created an adaptive 5-question quiz for '{query}'.",
                "quiz": quiz,
                "session_id": session_id,
                "delegated_agents": ["Agent #4 (Adaptive Quiz Generator)"],
            }

        # DEFAULT FALLBACK
        else:
            return {
                "orchestrator_decision": classification,
                "response": f"Processed query '{query}' via Orchestrator.",
                "session_id": session_id,
                "delegated_agents": [classification.get("target_agent", "Agent #1 (Tutor)")],
            }


# Singleton instance
orchestrator_agent = OrchestratorAgent()
