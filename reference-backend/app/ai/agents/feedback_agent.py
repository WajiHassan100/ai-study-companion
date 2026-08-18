"""
AI Assignment Feedback Agent Implementation (feedback_agent.py)
================================================================

Core agent class responsible for analyzing student code submissions, mathematical derivations,
and written assignment solutions. Generates a structured 4-part feedback report and automatically
synchronizes identified mistake patterns with Student Profile Memory (Agent #2) & Study Planner (#3).
"""

import json
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.feedback_prompt import get_feedback_prompt_template
from app.ai.services.student_memory_service import student_memory_service
from app.models.models import StudentProfile
from app.ai.utils import clean_llm_json, AgentOutputError

logger = logging.getLogger(__name__)


class AssignmentFeedbackAgent:
    """
    AI Assignment Feedback Agent for code & written submission analysis.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_feedback_prompt_template()

    async def analyze_submission(
        self,
        db: DBSession,
        student_id: str,
        assignment_title: str,
        submission_text: str,
        submission_type: str = "code",  # code, math, essay, general
        subject: str = "Computer Science / Mathematics",
    ) -> dict[str, Any]:
        """
        Analyzes a student submission and returns structured 4-part AI feedback while logging mistakes into Student Profile.
        """
        p = student_memory_service.get_or_create_profile(db, student_id)
        student_level = p.get("current_level", "intermediate")

        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            student_level=student_level,
            assignment_title=assignment_title,
            subject=subject,
            submission_type=submission_type,
            submission_text=submission_text,
        )

        logger.info("Invoking AI Assignment Feedback Agent for student_id=%s title='%s' type=%s", student_id, assignment_title, submission_type)

        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()
        cleaned_text = clean_llm_json(raw_text)

        try:
            parsed = json.loads(cleaned_text)
        except Exception as e:
            logger.warning("Failed to parse Feedback JSON output: %s", e)
            raise AgentOutputError("Assignment Feedback Agent could not produce a valid feedback structure.") from e

        required_keys = [
            "overall_score",
            "letter_grade",
            "error_identification",
            "explanation_of_mistakes",
            "suggestions_for_improvement",
            "learning_resources",
        ]
        if not all(k in parsed for k in required_keys):
            raise AgentOutputError("Assignment Feedback Agent returned an incomplete feedback report.")

        score = parsed.get("overall_score")
        errors = parsed.get("error_identification", [])
        explanation = parsed.get("explanation_of_mistakes", "")
        suggestions = parsed.get("suggestions_for_improvement", [])
        resources = parsed.get("learning_resources", [])
        refactored = parsed.get("refactored_solution_snippet", "")

        # ── SYNCHRONIZE WITH AGENT #2 (STUDENT PROFILE MEMORY) ────────
        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if profile:
            try:
                prev_mistakes: list[str] = json.loads(profile.previous_mistakes_json) if profile.previous_mistakes_json else []
            except Exception:
                prev_mistakes = []

            # Append new error observations to student memory
            for err in errors[:2]:
                if err not in prev_mistakes:
                    prev_mistakes.append(err)

            profile.previous_mistakes_json = json.dumps(prev_mistakes[-8:])  # keep recent 8 mistakes
            db.add(profile)
            db.commit()

        planner_recommendation = (
            f"Submission score was {score}%. Identified error pattern added to Student Memory. "
            f"Recommended to review '{resources[0] if resources else assignment_title}' with AI Tutor."
        )

        return {
            "assignment_title": assignment_title,
            "subject": subject,
            "overall_score": score,
            "letter_grade": parsed.get("letter_grade"),
            "error_identification": errors,
            "explanation_of_mistakes": explanation,
            "suggestions_for_improvement": suggestions,
            "learning_resources": resources,
            "refactored_solution_snippet": refactored,
            "planner_recommendation": planner_recommendation,
        }


# Singleton instance
feedback_agent = AssignmentFeedbackAgent()
