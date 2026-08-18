"""
Study Planner Agent Implementation
===================================

Core agent class responsible for analyzing student learning profiles,
weak concepts, and course assignment deadlines to generate structured,
personalized study schedules.
"""

import json
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.planner_prompt import get_planner_prompt_template
from app.models.models import StudentProfile, Assignment, StudyPlan, Course
from app.ai.services.student_memory_service import student_memory_service
from app.ai.utils import clean_llm_json, AgentOutputError

logger = logging.getLogger(__name__)


class PlannerAgent:
    """
    AI Study Planner Agent for generating 7-day Spaced Repetition timetables.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_planner_prompt_template()

    async def generate_plan(
        self,
        db: DBSession,
        student_id: str,
        target_days: int = 5,
        custom_goals: str | None = None,
        available_hours: float = 2.0,
        learning_speed: str = "moderate",
    ) -> dict[str, Any]:
        """
        Generates an adaptive personalized study plan incorporating student memory intelligence,
        available study hours, exam target deadlines, and learning speed.
        """
        # Fetch deep student profile memory context
        p = student_memory_service.get_or_create_profile(db, student_id)
        student_level = p.get("current_level", "beginner")
        weaknesses = p.get("weaknesses", [])
        previous_mistakes = p.get("previous_mistakes", [])
        topic_mastery = p.get("topic_mastery", {})

        # Fetch upcoming assignment deadlines
        assignments = db.query(Assignment).limit(5).all() if db else []
        if assignments:
            assignments_summary = "\n".join(
                [f"• Assignment: {a.title} | Max Score: {a.max_score} | Due: {a.due_at or 'Flexible'}" for a in assignments]
            )
        else:
            assignments_summary = "• No strict upcoming course assignment deadlines."

        # Render prompt template
        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            student_level=student_level,
            weaknesses=", ".join(weaknesses) if weaknesses else "None",
            topic_mastery=json.dumps(topic_mastery),
            custom_goals=custom_goals or "Targeted exam preparation & weakness review",
            target_days=target_days,
            available_hours=available_hours,
            learning_speed=learning_speed,
            assignments_summary=assignments_summary,
        )

        logger.info("Invoking Planner Agent for student_id=%s target_days=%d", student_id, target_days)

        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()
        cleaned_text = clean_llm_json(raw_text)

        try:
            parsed = json.loads(cleaned_text)
        except Exception as e:
            logger.warning("Failed to parse Planner JSON output: %s", e)
            raise AgentOutputError("Study Planner Agent could not produce a valid study plan.") from e

        import urllib.parse

        title = parsed.get("title", f"{target_days}-Day Personalized Study Plan")
        summary = parsed.get("summary", "Personalized study schedule.")
        schedule = parsed.get("schedule", []) or []
        action_items = parsed.get("action_items", []) or []

        if not schedule:
            raise AgentOutputError("Study Planner Agent produced an empty schedule.")

        # Enrich each schedule block with YouTube video search URL
        for block in schedule:
            topic_str = block.get("topic", "Study Topic")
            if not block.get("video_url"):
                v_query = f"{topic_str} educational explanation tutorial"
                block["video_query"] = v_query
                block["video_url"] = f"https://www.youtube.com/results?search_query={urllib.parse.quote(v_query)}"

        # Store generated study plan in database
        study_plan = StudyPlan(
            student_id=student_id,
            title=title,
            summary=summary,
            schedule_json=json.dumps(schedule),
            action_items_json=json.dumps(action_items),
        )
        db.add(study_plan)
        db.commit()
        db.refresh(study_plan)

        return {
            "plan_id": study_plan.id,
            "title": study_plan.title,
            "summary": study_plan.summary or "",
            "schedule": schedule,
            "action_items": action_items,
            "created_at": study_plan.created_at,
        }
