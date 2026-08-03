"""
Quiz & Assessment Routes
========================

Exposes endpoints for generating adaptive quizzes/flashcards, submitting user attempts,
and retrieving student quiz performance history.
"""

import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_optional_current_user
from app.db.session import get_db
from app.models.models import User, Quiz, QuizAttempt
from app.schemas.schemas import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuizQuestionItem,
)
from app.ai.agents.quiz_agent import QuizAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["quiz"])

quiz_agent = QuizAgent()


@router.post("/quiz/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    payload: QuizGenerateRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> QuizGenerateResponse:
    """
    Generates an adaptive practice quiz or flashcard deck based on student profile.
    """
    student_id = payload.student_id or (current_user.id if current_user else "demo_student")

    try:
        result = await quiz_agent.generate_quiz(
            db=db,
            student_id=student_id,
            topic=payload.topic,
            num_questions=payload.num_questions,
            mode=payload.mode,
        )

        question_items = [QuizQuestionItem(**q) for q in result["questions"] if isinstance(q, dict)]

        return QuizGenerateResponse(
            quiz_id=result["quiz_id"],
            title=result["title"],
            topic=result["topic"],
            difficulty=result["difficulty"],
            questions=question_items,
            created_at=result["created_at"],
        )
    except Exception as e:
        logger.error("Quiz generation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz Generator Agent error: {str(e)}",
        )


@router.post("/quiz/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    payload: QuizSubmitRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> QuizSubmitResponse:
    """
    Grades a student quiz submission, provides question feedback,
    and updates Agent #2 StudentProfile topic mastery in database.
    """
    student_id = payload.student_id or (current_user.id if current_user else "demo_student")

    try:
        result = await quiz_agent.submit_and_evaluate_quiz(
            db=db,
            quiz_id=payload.quiz_id,
            student_id=student_id,
            user_answers=payload.user_answers,
        )

        return QuizSubmitResponse(
            attempt_id=result["attempt_id"],
            quiz_id=result["quiz_id"],
            score_percentage=result["score_percentage"],
            correct_count=result["correct_count"],
            total_count=result["total_count"],
            question_feedback=result["question_feedback"],
            updated_mastery=result["updated_mastery"],
            recommended_next_steps=result["recommended_next_steps"],
        )
    except Exception as e:
        logger.error("Quiz submission grading failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz evaluation error: {str(e)}",
        )


@router.get("/quiz/{student_id}")
def get_student_quizzes(
    student_id: str,
    db: DBSession = Depends(get_db),
):
    """
    Retrieves student quiz attempt history.
    """
    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student_id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "attempt_id": a.id,
            "quiz_id": a.quiz_id,
            "score_percentage": a.score_percentage,
            "completed_at": a.completed_at.isoformat(),
        }
        for a in attempts
    ]
