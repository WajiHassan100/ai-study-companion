"""
AI Learning Coach Agent Implementation (coach_agent.py)
======================================================

Core agent class responsible for long-term student guidance and mentorship.
Monitors study consistency, performance trends, missed sessions, weak areas, and exam deadlines.
Works in tandem with Student Profile (Agent #2), Planner (Agent #3), and Tutor Agent (#1).
"""

import json
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.coach_prompt import get_coach_prompt_template
from app.ai.services.student_memory_service import student_memory_service
from app.ai.utils import clean_llm_json, AgentOutputError
from app.models.models import StudentProfile

logger = logging.getLogger(__name__)


class LearningCoachAgent:
    """
    Agent #9: AI Learning Coach Agent for long-term guidance and mentorship.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_coach_prompt_template()

    async def generate_coaching_insights(
        self,
        db: DBSession,
        student_id: str = "demo_student",
        timeframe: str = "weekly",
    ) -> dict[str, Any]:
        """
        Generates long-term AI coaching mentorship analysis based on student performance trends and consistency.
        """
        p = student_memory_service.get_or_create_profile(db, student_id)

        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            student_level=p.get("current_level", "intermediate"),
            learning_style=p.get("learning_style", "visual"),
            topic_mastery=json.dumps(p.get("topic_mastery", {})),
            weaknesses=", ".join(p.get("weaknesses", [])) or "None",
            strong_topics=", ".join(p.get("strong_topics", [])) or "None",
            previous_mistakes=" | ".join(p.get("previous_mistakes", [])[-3:]) or "None",
            progress_trends=json.dumps(p.get("progress_trends", {})),
            study_history=" | ".join(p.get("study_history", [])[-5:]) or "None",
        )

        logger.info("Invoking AI Learning Coach Agent for student_id=%s timeframe=%s", student_id, timeframe)

        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()
        cleaned_text = clean_llm_json(raw_text)

        try:
            parsed = json.loads(cleaned_text)
        except Exception as e:
            logger.warning("Failed to parse Learning Coach JSON output: %s", e)
            raise AgentOutputError("Learning Coach Agent could not produce a valid coaching report.") from e

        required_keys = [
            "coach_title",
            "consistency_score",
            "missed_sessions_count",
            "performance_recommendations",
            "problem_detection",
            "strategic_improvements",
            "planner_rebalance_action",
            "socratic_tutor_prompts",
        ]
        if not all(k in parsed for k in required_keys):
            raise AgentOutputError("Learning Coach Agent returned an incomplete coaching report.")

        # Save coach observation summary back into StudentProfile progress_trends_json
        if db:
            profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
            if profile:
                try:
                    trends = json.loads(getattr(profile, "progress_trends_json", "{}") or "{}")
                    trends["last_coach_insight"] = parsed.get("performance_recommendations", ["Consistency verified."])[0]
                    profile.progress_trends_json = json.dumps(trends)
                    db.add(profile)
                    db.commit()
                except Exception as ex:
                    logger.error("Failed to update coach progress trends in DB: %s", str(ex))

        return parsed


# Singleton instance
coach_agent = LearningCoachAgent()
