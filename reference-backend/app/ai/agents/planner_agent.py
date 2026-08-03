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

logger = logging.getLogger(__name__)


class PlannerAgent:
    """
    Study Planner Agent for dynamic study schedule generation.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_planner_prompt_template()

    async def generate_plan(
        self,
        db: DBSession,
        student_id: str,
        target_days: int = 7,
        custom_goals: str | None = None,
    ) -> dict[str, Any]:
        """
        Generates and saves a personalized study schedule for a student.
        """
        # Fetch student profile data
        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        student_level = profile.current_level if profile else "beginner"
        weaknesses = json.loads(profile.weaknesses_json) if (profile and profile.weaknesses_json) else ["General Concepts"]
        topic_mastery = json.loads(profile.topic_mastery_json) if (profile and profile.topic_mastery_json) else {}

        # Fetch upcoming assignment deadlines
        assignments = db.query(Assignment).limit(5).all()
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
            custom_goals=custom_goals or "Balanced study & weakness review",
            target_days=target_days,
            assignments_summary=assignments_summary,
        )

        logger.info("Invoking Planner Agent for student_id=%s target_days=%d", student_id, target_days)

        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()

        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        try:
            parsed = json.loads(raw_text)
        except Exception as e:
            logger.warning("Failed to parse Planner JSON output: %s. Using fallback plan.", e)
            parsed = {
                "title": f"{target_days}-Day Targeted Study Plan",
                "summary": "Focus on weak topics and daily consistent review.",
                "schedule": [
                    {
                        "day": "Day 1",
                        "topic": weaknesses[0] if weaknesses else "General Study",
                        "duration_minutes": 45,
                        "priority": "high",
                        "description": "Review core concepts and complete worked practice problems.",
                    },
                    {
                        "day": "Day 2",
                        "topic": "Assignment & Homework Prep",
                        "duration_minutes": 30,
                        "priority": "normal",
                        "description": "Read through active course materials and outline key notes.",
                    },
                ],
                "action_items": [
                    "Complete daily 30-min revision session",
                    "Ask AI Tutor for guidance on weak concepts",
                ],
            }

        title = parsed.get("title", f"{target_days}-Day Personalized Study Plan")
        summary = parsed.get("summary", "Personalized study schedule.")
        schedule = parsed.get("schedule", [])
        action_items = parsed.get("action_items", [])

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
