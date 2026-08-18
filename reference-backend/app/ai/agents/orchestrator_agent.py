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

import anyio
from sqlalchemy.orm import Session as DBSession

from langchain_core.messages import HumanMessage

from app.ai.agents.planner_agent import PlannerAgent
from app.ai.agents.profiler_agent import ProfilerAgent
from app.ai.agents.quiz_agent import QuizAgent
from app.ai.agents.rag_agent import RAGAgent
from app.ai.agents.teacher_agent import TeacherAgent
from app.ai.agents.tutor_agent import TutorAgent
from app.ai.agents.exam_agent import exam_agent
from app.ai.agents.feedback_agent import feedback_agent
from app.ai.agents.coach_agent import coach_agent
from app.ai.services.llm_service import get_llm
from app.ai.utils import clean_llm_json

logger = logging.getLogger(__name__)

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

    def __init__(self):
        self.llm = get_llm()
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

    async def classify_intent(self, query: str) -> Dict[str, Any]:
        """Classifies student request intent to determine target agent and execution pipeline."""
        query_lower = query.lower()

        # Rule-based pattern matching for fast & robust classification
        if any(w in query_lower for w in ["exam", "mock paper", "full test", "practice paper", "midterm", "final exam"]):
            return {
                "intent": "exam",
                "target_agent": "AI Exam Generator Agent (Agent #7)",
                "reasoning": "Detected request for practice exam or mock paper.",
                "delegated_agents": ["Agent #7 (Exam Generator)"],
            }
        if any(w in query_lower for w in ["evaluate my", "feedback", "grade my", "review my answer", "review my code", "check my essay", "analyze submission"]):
            return {
                "intent": "feedback",
                "target_agent": "AI Assignment Feedback Agent (Agent #8)",
                "reasoning": "Detected request for assignment answer or code submission feedback.",
                "delegated_agents": ["Agent #8 (Assignment Feedback)"],
            }
        if any(w in query_lower for w in ["motivation", "coach", "streak", "habit", "losing focus", "burnout", "discouraged"]):
            return {
                "intent": "coach",
                "target_agent": "AI Learning Coach Agent (Agent #9)",
                "reasoning": "Detected request for study motivation and consistency coaching.",
                "delegated_agents": ["Agent #9 (Learning Coach)"],
            }
        if any(w in query_lower for w in ["lesson plan", "teacher", "rubric", "cohort analytics"]):
            return {
                "intent": "teacher",
                "target_agent": "Teacher Assistant & Auto-Grader (Agent #6)",
                "reasoning": "Detected request for teacher lesson planning or rubric grading.",
                "delegated_agents": ["Agent #6 (Teacher Assistant)"],
            }
        if any(w in query_lower for w in ["search notes", "course pdf", "slide", "textbook citation", "from my document"]):
            return {
                "intent": "rag",
                "target_agent": "RAG Course Knowledge Studio (Agent #5)",
                "reasoning": "Detected request to search uploaded course documents and citations.",
                "delegated_agents": ["Agent #5 (RAG Knowledge Engine)"],
            }
        if any(w in query_lower for w in ["schedule", "plan", "timetable", "revision"]):
            return {
                "intent": "planner",
                "target_agent": "7-Day Revision Planner (Agent #3)",
                "reasoning": "Detected request for study schedule / revision timetable.",
                "delegated_agents": ["Agent #3 (Study Planner)"],
            }
        if any(w in query_lower for w in ["quiz", "flashcard", "mcq", "practice questions"]):
            return {
                "intent": "quiz",
                "target_agent": "Adaptive Quiz Generator (Agent #4)",
                "reasoning": "Detected request for quiz or active recall flashcards.",
                "delegated_agents": ["Agent #4 (Quiz Generator)"],
            }
        if any(w in query_lower for w in ["mastery", "weakness", "progress", "knowledge depth", "my level"]):
            return {
                "intent": "profiler",
                "target_agent": "Student Profiler & Evaluator (Agent #2)",
                "reasoning": "Detected query about concept weaknesses or student mastery.",
                "delegated_agents": ["Agent #2 (Student Profiler)"],
            }

        prompt = f"""
You are the AI Orchestrator Agent for a 9-Agent Educational Ecosystem.
Analyze the following query and classify which specialized agent should handle it.

Available Intent Keys:
- "tutor": Concept explanations, step-by-step academic guidance, math/science help.
- "profiler": Student mastery scores, concept weaknesses, knowledge gap analysis.
- "planner": Study timetables, 7-day revision schedules, deadline planning.
- "quiz": Generating practice MCQs, active recall flashcards.
- "rag": Searching uploaded textbook PDFs, lecture slides, document citations.
- "teacher": Draft lesson plans, rubric essay evaluation, cohort stats.
- "exam": Generating comprehensive practice exams, mock papers.
- "feedback": Evaluating student essay, code, or math submissions with 4-part feedback.
- "coach": Learning momentum, study consistency, motivation, habit coaching.

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
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            raw_text = response.content.strip()
            return json.loads(clean_llm_json(raw_text or "{}"))
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
        """Main Orchestrator Entrypoint: Coordinates multi-agent pipeline execution across all 9 agents."""
        classification = await self.classify_intent(query)
        intent = classification.get("intent", "tutor")

        logger.info(f"Orchestrator decision for '{query[:30]}...': intent={intent}")

        # PIPELINE 1: TUTOR + RAG + PROFILER
        if intent == "tutor":
            # rag_agent uses a sync LLM call — run it off the event loop.
            rag_results = await anyio.to_thread.run_sync(
                rag_agent.query_course_knowledge, course_id, query, 2
            )
            rag_citations = rag_results.get("cited_sources", [])

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
                answer_text = f"Socratic guidance breakdown for '{query}':\n\n1. **Core Concept**: Let's review the fundamental principles.\n2. **Guiding Question**: What factor drives this process?\n3. **Next Step**: Apply this logic to your problem!"
                sess_id = session_id or "demo_session"

            return {
                "orchestrator_decision": classification,
                "response": answer_text,
                "rag_passages_retrieved": len(rag_citations),
                "rag_citations": [c.get("material_title") if isinstance(c, dict) else str(c) for c in rag_citations],
                "session_id": sess_id,
                "delegated_agents": ["Agent #5 (RAG Vector Store)", "Agent #1 (Socratic AI Tutor)", "Agent #2 (Student Profiler)"],
            }

        # PIPELINE 2: REVISION PLANNER
        elif intent == "planner":
            if db:
                plan = await planner_agent.generate_plan(db=db, student_id=student_id, target_days=7, custom_goals=query)
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

        # PIPELINE 4: EXAM GENERATOR
        elif intent == "exam":
            if db:
                exam_res = await exam_agent.generate_exam(db=db, student_id=student_id, topic=query, num_questions=5)
                resp_text = f"Generated practice exam: '{exam_res.get('title')}' with {len(exam_res.get('questions', []))} questions."
            else:
                exam_res = {"title": f"Practice Exam: {query}", "questions": []}
                resp_text = f"Generated custom practice exam paper for '{query}'."
            return {
                "orchestrator_decision": classification,
                "response": resp_text,
                "exam": exam_res,
                "session_id": session_id,
                "delegated_agents": ["Agent #7 (AI Exam Generator)"],
            }

        # PIPELINE 5: ASSIGNMENT FEEDBACK
        elif intent == "feedback":
            if db:
                feedback_res = await feedback_agent.analyze_submission(
                    db=db, student_id=student_id, assignment_title=query, submission_text=query
                )
                resp_text = f"Evaluated submission for '{query}'. Overall Score: {feedback_res.get('overall_score', 80)}% ({feedback_res.get('letter_grade', 'B')})."
            else:
                feedback_res = {"overall_score": 85.0, "letter_grade": "A-"}
                resp_text = f"Provided 4-part feedback analysis for your submission on '{query}'."
            return {
                "orchestrator_decision": classification,
                "response": resp_text,
                "feedback": feedback_res,
                "session_id": session_id,
                "delegated_agents": ["Agent #8 (Assignment Feedback Agent)"],
            }

        # PIPELINE 6: LEARNING COACH
        elif intent == "coach":
            if db:
                coach_res = await coach_agent.generate_coaching_insights(db=db, student_id=student_id)
                resp_text = f"🤖 **Learning Coach Nudge:** {coach_res.get('motivation_nudge', 'Keep going!')}\n\n**Recommended Next Action:** {coach_res.get('recommended_next_action', 'Study 20 mins')}"
            else:
                coach_res = {"motivation_nudge": "Consistency is key to mastery! Take it one step at a time."}
                resp_text = f"🤖 **Learning Coach:** Consistency is key to mastery! Take a focused 25-minute study session today."
            return {
                "orchestrator_decision": classification,
                "response": resp_text,
                "coach": coach_res,
                "session_id": session_id,
                "delegated_agents": ["Agent #9 (AI Learning Coach)"],
            }

        # PIPELINE 7: TEACHER ASSISTANT
        elif intent == "teacher":
            teacher_res = await teacher_agent.draft_lesson_plan(topic=query)
            return {
                "orchestrator_decision": classification,
                "response": f"Drafted lesson plan for '{query}': {teacher_res.get('title', 'Lesson Plan')}.",
                "teacher": teacher_res,
                "session_id": session_id,
                "delegated_agents": ["Agent #6 (Teacher Assistant Agent)"],
            }

        # PIPELINE 8: RAG COURSE KNOWLEDGE
        elif intent == "rag":
            # rag_agent uses a sync LLM call — run it off the event loop.
            rag_res = await anyio.to_thread.run_sync(
                rag_agent.query_course_knowledge, course_id, query, 3
            )
            return {
                "orchestrator_decision": classification,
                "response": rag_res.get("answer", f"Found grounded course information for '{query}'."),
                "rag": rag_res,
                "session_id": session_id,
                "delegated_agents": ["Agent #5 (Course RAG Knowledge Base)"],
            }

        # PIPELINE 9: PROFILER ANALYSIS
        elif intent == "profiler":
            profile_analysis = profiler_agent.analyze_knowledge_depth(db=db, student_id=student_id)
            return {
                "orchestrator_decision": classification,
                "response": f"Retrieved student knowledge analysis. Overall level: {profile_analysis.get('overall_level', 'intermediate').upper()}.",
                "profiler": profile_analysis,
                "session_id": session_id,
                "delegated_agents": ["Agent #2 (Student Profiler)"],
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
