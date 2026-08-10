"""
Quiz & Practice Generator Agent Implementation
==============================================

Core agent class responsible for generating adaptive practice quizzes & flashcards
from student profile weaknesses, grading quiz submissions, and automatically
updating Agent #2 (Student Profile Agent) topic mastery scores in the database.
"""

import json
import uuid
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.quiz_prompt import get_quiz_prompt_template
from app.models.models import StudentProfile, Quiz, QuizAttempt
from app.ai.utils import clean_llm_json, robust_parse_json

logger = logging.getLogger(__name__)


class QuizAgent:
    """
    Quiz & Assessment Agent for adaptive test generation and evaluation.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_quiz_prompt_template()

    async def generate_quiz(
        self,
        db: DBSession,
        student_id: str,
        topic: str | None = None,
        num_questions: int = 5,
        mode: str = "quiz",
    ) -> dict[str, Any]:
        """
        Generates an adaptive quiz or flashcard set tailored to student weak concepts.
        Uses mastery scores, recent quiz history, and spaced repetition data for difficulty adaptation.
        """
        # Query StudentProfile for weak topics & level
        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        student_level = profile.current_level if profile else "beginner"

        try:
            weaknesses = json.loads(profile.weaknesses_json) if (profile and profile.weaknesses_json) else []
        except Exception:
            weaknesses = []

        # Target topic selection
        if not topic:
            topic = weaknesses[0] if weaknesses else "General Science & Math"

        # ── ADAPTIVE DIFFICULTY DATA ──────────────────────────────────────
        # 1. Get topic mastery score
        topic_mastery_percent = 50.0
        try:
            mastery_data = json.loads(profile.topic_mastery_json) if profile else {}
            topic_mastery_percent = float(mastery_data.get(topic, 50.0))
        except Exception:
            pass

        # 2. Get recent quiz scores for this topic
        recent_scores_str = "No previous attempts"
        try:
            recent_attempts = (
                db.query(QuizAttempt)
                .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
                .filter(QuizAttempt.student_id == student_id)
                .filter(Quiz.topic == topic)
                .order_by(QuizAttempt.completed_at.desc())
                .limit(3)
                .all()
            )
            if recent_attempts:
                scores = [f"{a.score_percentage:.0f}%" for a in reversed(recent_attempts)]
                recent_scores_str = ", ".join(scores)
        except Exception:
            pass

        # 3. Extract commonly wrong question types from past feedback
        weak_question_types_str = "None identified"
        try:
            all_recent = (
                db.query(QuizAttempt)
                .filter(QuizAttempt.student_id == student_id)
                .order_by(QuizAttempt.completed_at.desc())
                .limit(5)
                .all()
            )
            wrong_concepts = []
            for attempt in all_recent:
                feedback = json.loads(attempt.feedback_json or "{}")
                for _qid, fb in feedback.items():
                    if not fb.get("is_correct", True):
                        concept = fb.get("target_concept", "")
                        if concept and concept not in wrong_concepts:
                            wrong_concepts.append(concept)
            if wrong_concepts:
                weak_question_types_str = ", ".join(wrong_concepts[:5])
        except Exception:
            pass

        # 4. Get spaced repetition context
        spaced_repetition_context = "No spaced repetition data available."
        try:
            from app.ai.services.spaced_repetition import spaced_repetition_service
            spaced_repetition_context = spaced_repetition_service.get_review_summary_for_prompt(db, student_id)
        except Exception:
            pass

        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            topic=topic,
            student_level=student_level,
            weaknesses=", ".join(weaknesses) if weaknesses else "None",
            num_questions=num_questions,
            mode=mode,
            topic_mastery_percent=f"{topic_mastery_percent:.0f}",
            recent_scores=recent_scores_str,
            weak_question_types=weak_question_types_str,
            spaced_repetition_context=spaced_repetition_context,
        )

        logger.info("Invoking Quiz Agent for student_id=%s topic='%s' mode=%s", student_id, topic, mode)

        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()
        fallback_quiz = {
            "title": f"{topic} Mastery Quiz",
            "topic": topic,
            "difficulty": student_level,
            "questions": [
                {
                    "id": "q1",
                    "question": f"What is the primary function or definition of {topic}?",
                    "options": {
                        "A": f"It is a fundamental process in {topic}.",
                        "B": "It is an unrelated chemical reaction.",
                        "C": "It is a historical timeline event.",
                        "D": "None of the above.",
                    },
                    "correct_option": "A",
                    "explanation": f"Option A accurately describes {topic}.",
                    "target_concept": topic,
                },
                {
                    "id": "q2",
                    "question": f"Which component is essential for {topic} to occur effectively?",
                    "options": {
                        "A": "Optimal energy input & conditions",
                        "B": "Absolute zero temperature",
                        "C": "Zero molecular activity",
                        "D": "Vacuum state",
                    },
                    "correct_option": "A",
                    "explanation": "Optimal energy and conditions are required for biological and physical processes.",
                    "target_concept": topic,
                },
            ],
        }

        parsed = robust_parse_json(raw_text, llm=self.llm, fallback=fallback_quiz)

        title = parsed.get("title", f"{topic} Practice Quiz")
        questions = parsed.get("questions", [])

        # Persist quiz record in database
        quiz_record = Quiz(
            student_id=student_id,
            topic=topic,
            title=title,
            difficulty=student_level,
            questions_json=json.dumps(questions),
        )
        db.add(quiz_record)
        db.commit()
        db.refresh(quiz_record)

        return {
            "quiz_id": quiz_record.id,
            "title": title,
            "topic": topic,
            "difficulty": student_level,
            "questions": questions,
            "created_at": quiz_record.created_at,
        }

    async def submit_and_evaluate_quiz(
        self,
        db: DBSession,
        quiz_id: str,
        student_id: str,
        user_answers: dict[str, str],
    ) -> dict[str, Any]:
        """
        Grades a quiz submission, provides detailed feedback, and updates StudentProfile topic mastery.
        """
        quiz_record = db.query(Quiz).filter_by(id=quiz_id).first()
        if not quiz_record:
            # Fallback evaluation if quiz record not found
            questions = [
                {
                    "id": q_id,
                    "correct_option": "A",
                    "explanation": "Sample correct answer explanation.",
                    "target_concept": "General",
                }
                for q_id in user_answers.keys()
            ]
            topic = "General Study"
        else:
            try:
                questions = json.loads(quiz_record.questions_json)
            except Exception:
                questions = []
            topic = quiz_record.topic

        correct_count = 0
        total_count = len(questions) if questions else 1
        question_feedback = {}

        for q in questions:
            q_id = str(q.get("id"))
            selected = user_answers.get(q_id, "")
            correct = q.get("correct_option", "A")
            is_correct = selected.upper() == correct.upper()

            if is_correct:
                correct_count += 1

            question_feedback[q_id] = {
                "question": q.get("question", ""),
                "selected_option": selected,
                "correct_option": correct,
                "is_correct": is_correct,
                "explanation": q.get("explanation", ""),
                "target_concept": q.get("target_concept", topic),
            }

        score_percentage = round((correct_count / max(total_count, 1)) * 100.0, 1)

        # ── AUTOMATIC AGENT #2 PROFILE MASTERY UPDATE ──────────────────
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

        try:
            topic_mastery: dict[str, float] = json.loads(profile.topic_mastery_json)
        except Exception:
            topic_mastery = {}

        try:
            weaknesses: list[str] = json.loads(profile.weaknesses_json)
        except Exception:
            weaknesses = []

        old_mastery = topic_mastery.get(topic, 50.0)

        # Adjust mastery score based on performance
        if score_percentage >= 80.0:
            new_mastery = min(100.0, old_mastery + 15.0)
            weaknesses = [w for w in weaknesses if w.lower() != topic.lower()]
        elif score_percentage >= 60.0:
            new_mastery = min(100.0, old_mastery + 5.0)
        else:
            new_mastery = max(0.0, old_mastery - 10.0)
            if topic not in weaknesses:
                weaknesses.append(topic)

        topic_mastery[topic] = round(new_mastery, 1)

        # Level advancement logic
        if score_percentage >= 85.0 and new_mastery >= 85.0:
            if profile.current_level == "beginner":
                profile.current_level = "intermediate"
            elif profile.current_level == "intermediate":
                profile.current_level = "advanced"

        profile.topic_mastery_json = json.dumps(topic_mastery)
        profile.weaknesses_json = json.dumps(weaknesses)

        db.add(profile)

        # Save attempt record
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student_id,
            score_percentage=score_percentage,
            user_answers_json=json.dumps(user_answers),
            feedback_json=json.dumps(question_feedback),
        )
        db.add(attempt)

        # Update spaced repetition status if applicable
        try:
            from app.ai.services.spaced_repetition import spaced_repetition_service
            quality = spaced_repetition_service.score_to_quality(score_percentage)
            spaced_repetition_service.record_review(db, student_id, topic, quality)
        except Exception as e:
            logger.warning("Failed to update spaced repetition review: %s", e)

        db.commit()
        db.refresh(attempt)

        recommendations = [
            f"Review explanations for missed questions on {topic}.",
            "Ask AI Tutor to clarify any confusing concepts.",
        ]
        if score_percentage >= 80.0:
            recommendations.insert(0, f"Great job! Topic mastery on {topic} increased to {new_mastery}%.")

        return {
            "attempt_id": attempt.id,
            "quiz_id": quiz_id,
            "score_percentage": score_percentage,
            "correct_count": correct_count,
            "total_count": total_count,
            "question_feedback": question_feedback,
            "updated_mastery": new_mastery,
            "recommended_next_steps": recommendations,
        }
