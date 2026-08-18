"""
AI Exam Generator Agent Routes (exam.py)
========================================

Exposes endpoints for generating practice exams across multi-format question types
(MCQs, Short, Long, Numerical, Conceptual) and evaluating submitted exam attempts.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_current_user, resolve_student_id
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    ExamGenerateRequest,
    ExamGenerateResponse,
    ExamEvaluateRequest,
    ExamEvaluateResponse,
)
from app.ai.agents.exam_agent import exam_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Agent #7: AI Exam Generator Agent"])


@router.post("/exam/generate", response_model=ExamGenerateResponse, status_code=status.HTTP_200_OK)
async def generate_practice_exam(
    req: ExamGenerateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExamGenerateResponse:
    """
    Generates a multi-format practice assessment tailored to student weak concepts and requested difficulty.
    """
    student_id = resolve_student_id(req.student_id, current_user)

    try:
        res = await exam_agent.generate_exam(
            db=db,
            student_id=student_id,
            topic=req.topic,
            difficulty=req.difficulty,
            num_questions=req.num_questions,
            course_id=req.course_id,
        )
        return ExamGenerateResponse(**res)
    except Exception as e:
        logger.error("Failed to generate exam: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Exam Generator Agent error: {str(e)}",
        )


@router.post("/exam/evaluate", response_model=ExamEvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_practice_exam(
    req: ExamEvaluateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExamEvaluateResponse:
    """
    Evaluates a submitted practice exam, scores each question, updates Agent #2 Mastery, and returns recommendations.
    """
    student_id = resolve_student_id(req.student_id, current_user)

    try:
        res = await exam_agent.evaluate_exam(
            db=db,
            exam_id=req.exam_id,
            student_id=student_id,
            user_answers=req.user_answers,
        )
        return ExamEvaluateResponse(**res)
    except Exception as e:
        logger.error("Failed to evaluate exam: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Exam Evaluation error: {str(e)}",
        )
