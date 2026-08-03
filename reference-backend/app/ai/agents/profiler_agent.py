"""
Assessment & Student Profiler Agent Implementation
===================================================

Core agent class responsible for evaluating student practice responses and
assignment answers, tracking topic mastery percentages, identifying concept gaps,
and updating student profiles dynamically.
"""

import json
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.profiler_prompt import get_profiler_prompt_template
from app.models.models import StudentProfile

logger = logging.getLogger(__name__)


class ProfilerAgent:
    """
    Assessment & Profiler Agent for answer evaluation and adaptive learning tracking.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_profiler_prompt_template()

    async def evaluate_and_profile(
        self,
        db: DBSession,
        student_id: str,
        topic: str,
        question: str,
        student_answer: str,
    ) -> dict[str, Any]:
        """
        Evaluates a student's answer and updates their profile in DB.
        """
        # Fetch or create student profile in database
        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if not profile:
            profile = StudentProfile(
                student_id=student_id,
                current_level="beginner",
                learning_style="visual",
                weaknesses_json="[]",
                topic_mastery_json="{}",
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # Parse current JSON fields
        try:
            topic_mastery: dict[str, float] = json.loads(profile.topic_mastery_json)
        except Exception:
            topic_mastery = {}

        try:
            weaknesses: list[str] = json.loads(profile.weaknesses_json)
        except Exception:
            weaknesses = []

        current_mastery = topic_mastery.get(topic, 50.0)

        # Render system prompt
        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            topic=topic,
            current_level=profile.current_level,
            current_mastery=current_mastery,
            question=question,
            student_answer=student_answer,
        )

        logger.info("Invoking Profiler Agent student_id=%s topic='%s'", student_id, topic)

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
            logger.warning("Failed to parse Profiler JSON output: %s. Using fallback.", e)
            parsed = {
                "is_correct": True,
                "score": 75.0,
                "feedback": raw_text,
                "concept_gaps": [],
                "updated_mastery": min(100.0, current_mastery + 5.0),
                "recommended_level": profile.current_level,
            }

        is_correct: bool = parsed.get("is_correct", True)
        score: float = float(parsed.get("score", 75.0))
        feedback: str = parsed.get("feedback", "Good effort!")
        concept_gaps: list[str] = parsed.get("concept_gaps", [])
        updated_mastery: float = float(parsed.get("updated_mastery", current_mastery))
        recommended_level: str = parsed.get("recommended_level", profile.current_level)

        # Update topic mastery
        topic_mastery[topic] = round(updated_mastery, 1)

        # Update weaknesses list
        for gap in concept_gaps:
            if gap not in weaknesses:
                weaknesses.append(gap)

        if is_correct and score >= 80.0:
            # Remove topic from weaknesses if student mastered it
            weaknesses = [w for w in weaknesses if w.lower() != topic.lower()]

        # Persist back to database
        profile.topic_mastery_json = json.dumps(topic_mastery)
        profile.weaknesses_json = json.dumps(weaknesses)
        if recommended_level in ["beginner", "intermediate", "advanced"]:
            profile.current_level = recommended_level

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return {
            "student_id": student_id,
            "topic": topic,
            "is_correct": is_correct,
            "score": score,
            "feedback": feedback,
            "concept_gaps": concept_gaps,
            "updated_mastery": topic_mastery[topic],
            "recommended_level": profile.current_level,
        }
