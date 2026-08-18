"""
Assessment & Student Profiler Routes
======================================

Exposes endpoints for evaluating student practice responses and retrieving
live student learning profiles, topic mastery, and weak concepts.
"""

import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_current_user, resolve_student_id, ensure_owns_student
from app.db.session import get_db
from app.models.models import User, StudentProfile
from app.schemas.schemas import (
    AssessmentEvaluateRequest,
    AssessmentEvaluateResponse,
    StudentProfileResponse,
)
from app.ai.agents.profiler_agent import ProfilerAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["assessment"])

profiler_agent = ProfilerAgent()


@router.post("/assessment/evaluate", response_model=AssessmentEvaluateResponse)
async def evaluate_student_answer(
    payload: AssessmentEvaluateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssessmentEvaluateResponse:
    """
    Evaluates a student's answer to a practice question or assignment prompt,
    computes updated topic mastery, identifies concept gaps, and updates profile.
    """
    student_id = resolve_student_id(payload.student_id, current_user)

    try:
        result = await profiler_agent.evaluate_and_profile(
            db=db,
            student_id=student_id,
            topic=payload.topic,
            question=payload.question,
            student_answer=payload.student_answer,
        )

        return AssessmentEvaluateResponse(
            student_id=result["student_id"],
            topic=result["topic"],
            is_correct=result["is_correct"],
            score=result["score"],
            feedback=result["feedback"],
            concept_gaps=result["concept_gaps"],
            updated_mastery=result["updated_mastery"],
            recommended_level=result["recommended_level"],
        )
    except Exception as e:
        logger.error("Assessment evaluation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment Profiler error: {str(e)}",
        )


@router.get("/student/profile/{student_id}", response_model=StudentProfileResponse)
def get_student_profile(
    student_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentProfileResponse:
    """
    Retrieves live student learning profile including level, style,
    weaknesses list, and topic mastery dictionary.
    """
    ensure_owns_student(student_id, current_user)

    profile = db.query(StudentProfile).filter_by(student_id=student_id).first()

    if not profile:
        # Honest empty profile — a new student has no weaknesses or mastery yet.
        return StudentProfileResponse(
            student_id=student_id,
            current_level="beginner",
            learning_style="visual",
            weaknesses=[],
            topic_mastery={},
            updated_at=datetime.now(timezone.utc),
        )

    try:
        weaknesses = json.loads(profile.weaknesses_json)
    except Exception:
        weaknesses = []

    try:
        topic_mastery = json.loads(profile.topic_mastery_json)
    except Exception:
        topic_mastery = {}

    return StudentProfileResponse(
        student_id=profile.student_id,
        current_level=profile.current_level,
        learning_style=profile.learning_style,
        weaknesses=weaknesses,
        topic_mastery=topic_mastery,
        updated_at=profile.updated_at or datetime.now(timezone.utc),
    )


@router.get("/student/analysis/{student_id}")
def analyze_student_knowledge(
    student_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns explainable student knowledge depth analysis, root cause analysis,
    and prerequisite knowledge dependency mapping trees.
    """
    ensure_owns_student(student_id, current_user)

    try:
        return profiler_agent.analyze_knowledge_depth(db, student_id)
    except Exception as e:
        logger.error("Knowledge analysis failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge Analysis Error: {str(e)}",
        )
