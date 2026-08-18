"""
Agent #6: Teacher Assistant Agent Implementation (teacher_agent.py)
====================================================================
Helps teachers draft structured lesson plans, auto-grade student assignment submissions
with constructive feedback, and identify class-wide conceptual gaps.
"""

import json
import logging
from typing import Any

from langchain_core.messages import HumanMessage

from app.ai.prompts.teacher_prompt import (
    TEACHER_GRADING_PROMPT,
    TEACHER_LESSON_PLAN_PROMPT,
)
from app.ai.services.llm_service import get_llm
from app.ai.utils import clean_llm_json, AgentOutputError

logger = logging.getLogger(__name__)


class TeacherAgent:
    """Agent #6: Teacher Assistant Agent."""

    def __init__(self):
        self.llm = get_llm()

    async def draft_lesson_plan(
        self,
        course_id: str,
        topic: str,
        target_grade: str = "Introductory College / AP High School",
        duration_minutes: int = 60,
    ) -> dict[str, Any]:
        """Drafts a structured lesson plan with objectives, timeline, discussion questions, and differentiation."""
        prompt = TEACHER_LESSON_PLAN_PROMPT.format(
            course_id=course_id,
            topic=topic,
            target_grade=target_grade,
            duration_minutes=duration_minutes,
        )

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            raw_text = response.content.strip()
            cleaned_text = clean_llm_json(raw_text)
            return json.loads(cleaned_text or "{}")
        except Exception as e:
            logger.error("LLM call failed for TeacherAgent lesson plan: %s", e)
            raise AgentOutputError("Teacher Agent could not produce a lesson plan.") from e

    async def grade_submission(
        self,
        assignment_title: str,
        submission_text: str,
        rubric: str = "Score based on conceptual clarity, factual accuracy, and depth of explanation.",
    ) -> dict[str, Any]:
        """Evaluates a student assignment submission and generates score, strengths, and feedback."""
        prompt = TEACHER_GRADING_PROMPT.format(
            assignment_title=assignment_title,
            rubric=rubric,
            submission_text=submission_text,
        )

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            raw_text = response.content.strip()
            cleaned_text = clean_llm_json(raw_text)
            return json.loads(cleaned_text or "{}")
        except Exception as e:
            logger.error("LLM call failed for TeacherAgent grading: %s", e)
            raise AgentOutputError("Teacher Agent could not grade the submission.") from e


# Singleton instance
teacher_agent = TeacherAgent()
