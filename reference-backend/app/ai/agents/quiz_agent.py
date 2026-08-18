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
from app.ai.utils import clean_llm_json, robust_parse_json, AgentOutputError

logger = logging.getLogger(__name__)


class QuizAgent:
    """
    Quiz & Assessment Agent for adaptive test generation and evaluation.
    """

    def __init__(self):
        self._llm = None
        self.prompt = get_quiz_prompt_template()

    @property
    def llm(self):
        if self._llm is None:
            self._llm = get_llm()
        return self._llm

    def _normalize_questions(self, raw_questions: list, default_topic: str) -> list[dict[str, Any]]:
        """Cleans and normalizes questions ensuring robust schema compliance."""
        normalized = []
        for idx, q in enumerate(raw_questions, 1):
            if not isinstance(q, dict):
                continue
            
            q_id = str(q.get("id") or f"q{idx}")
            q_text = str(q.get("question") or f"Question {idx} regarding {default_topic}")
            
            raw_options = q.get("options")
            options_dict = {}
            if isinstance(raw_options, dict):
                options_dict = {k.upper(): str(v) for k, v in raw_options.items()}
            elif isinstance(raw_options, list):
                keys = ["A", "B", "C", "D"]
                for i, opt in enumerate(raw_options[:4]):
                    options_dict[keys[i]] = str(opt)
            
            if len(options_dict) < 2:
                options_dict = {
                    "A": "Primary correct mechanism/definition",
                    "B": "Secondary alternative pathway",
                    "C": "Inverted conceptual outcome",
                    "D": "None of the above",
                }

            correct_option = str(q.get("correct_option") or "A").upper()
            if correct_option not in options_dict:
                correct_option = list(options_dict.keys())[0]

            explanation = str(q.get("explanation") or f"Option {correct_option} is the accurate statement for {default_topic}.")
            target_concept = str(q.get("target_concept") or default_topic)

            normalized.append({
                "id": q_id,
                "question": q_text,
                "options": options_dict,
                "correct_option": correct_option,
                "explanation": explanation,
                "target_concept": target_concept,
            })
        return normalized

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

        # ── ADAPTIVE DIFFICULTY ENGINE DATA ──────────────────────────────
        topic_mastery_percent = 50.0
        try:
            mastery_data = json.loads(profile.topic_mastery_json) if profile else {}
            topic_mastery_percent = float(mastery_data.get(topic, 50.0))
        except Exception:
            pass

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

        try:
            import asyncio
            response_msg = await asyncio.wait_for(
                self.llm.ainvoke(prompt_value.to_messages()),
                timeout=12.0
            )
            raw_text = response_msg.content.strip()
            parsed = robust_parse_json(raw_text)
        except Exception as e:
            logger.warning("LLM invocation or parse timed out / failed: %s, building adaptive fallback quiz", e)
            parsed = {}

        raw_questions = parsed.get("questions", []) if isinstance(parsed, dict) else []
        questions = self._normalize_questions(raw_questions, topic)

        if not questions:
            # Generate instant fallback questions
            questions = [
                {
                    "id": "q1",
                    "question": f"Which of the following best defines the primary concept of {topic}?",
                    "options": {
                        "A": f"The fundamental operational principle governing {topic}",
                        "B": "An unrelated peripheral artifact",
                        "C": "The inverse derivative reaction",
                        "D": "None of the above",
                    },
                    "correct_option": "A",
                    "explanation": f"Option A encapsulates the foundational definition of {topic}.",
                    "target_concept": topic,
                },
                {
                    "id": "q2",
                    "question": f"When analyzing {topic}, what is the critical step or factor to evaluate?",
                    "options": {
                        "A": "Rate-limiting step and energy transfer balance",
                        "B": "Static arbitrary constants only",
                        "C": "Random fluctuations",
                        "D": "Exclusively thermal decay",
                    },
                    "correct_option": "A",
                    "explanation": "Evaluating rate limits and conservation laws is essential for mastery.",
                    "target_concept": topic,
                },
                {
                    "id": "q3",
                    "question": f"What is the direct consequence when {topic} conditions are perturbed?",
                    "options": {
                        "A": "Proportional shift in reaction equilibrium and output efficiency",
                        "B": "Immediate total breakdown without intermediate phases",
                        "C": "Zero change across all states",
                        "D": "Undefined divergence",
                    },
                    "correct_option": "A",
                    "explanation": f"Equilibrium shifts to balance gradients according to governing laws.",
                    "target_concept": topic,
                },
            ]

        title = parsed.get("title") if isinstance(parsed, dict) else f"{topic} Mastery Quiz"
        if not title:
            title = f"{topic} Mastery Quiz"

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
            raise AgentOutputError(f"Quiz {quiz_id} not found — cannot grade an unknown quiz.")

        try:
            questions = json.loads(quiz_record.questions_json)
        except Exception:
            questions = []

        if not questions:
            raise AgentOutputError(f"Quiz {quiz_id} has no stored questions to grade.")

        topic = quiz_record.topic

        correct_count = 0
        total_count = len(questions)
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
                current_level="intermediate",
                learning_style="visual",
                weaknesses_json="[]",
                topic_mastery_json="{}",
            )
            db.add(profile)

        try:
            mastery_dict = json.loads(profile.topic_mastery_json) if profile.topic_mastery_json else {}
        except Exception:
            mastery_dict = {}

        # Weighted moving average for topic mastery
        old_mastery = float(mastery_dict.get(topic, 50.0))
        new_mastery = round(old_mastery * 0.4 + score_percentage * 0.6, 1)
        mastery_dict[topic] = new_mastery
        profile.topic_mastery_json = json.dumps(mastery_dict)

        # Update weaknesses list
        try:
            weaknesses = json.loads(profile.weaknesses_json) if profile.weaknesses_json else []
        except Exception:
            weaknesses = []

        if new_mastery < 60.0 and topic not in weaknesses:
            weaknesses.append(topic)
        elif new_mastery >= 75.0 and topic in weaknesses:
            weaknesses.remove(topic)

        profile.weaknesses_json = json.dumps(weaknesses)

        # Store attempt record
        attempt_record = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student_id,
            score_percentage=score_percentage,
            correct_count=correct_count,
            total_count=total_count,
            user_answers_json=json.dumps(user_answers),
            feedback_json=json.dumps(question_feedback),
        )
        db.add(attempt_record)
        db.commit()
        db.refresh(attempt_record)

        # Generate action recommendations
        recommended_next_steps = []
        if score_percentage >= 80.0:
            recommended_next_steps = [
                f"Great job! Topic '{topic}' is in your strong concepts.",
                "Advance to timed Practice Exam Simulator to test mixed-format problem solving.",
            ]
        elif score_percentage >= 50.0:
            recommended_next_steps = [
                f"Good attempt on '{topic}'. Review the step-by-step explanations for missed questions.",
                "Ask Socratic Tutor for worked derivations on incorrect concepts.",
            ]
        else:
            recommended_next_steps = [
                f"Knowledge gap detected in '{topic}'. Recommend a 15-minute concept review with Socratic Tutor.",
                "Re-test using Flashcards mode after reviewing lecture notes.",
            ]

        return {
            "attempt_id": attempt_record.id,
            "quiz_id": quiz_id,
            "score_percentage": score_percentage,
            "correct_count": correct_count,
            "total_count": total_count,
            "question_feedback": question_feedback,
            "updated_mastery": new_mastery,
            "recommended_next_steps": recommended_next_steps,
        }


# Singleton instance
quiz_agent = QuizAgent()
