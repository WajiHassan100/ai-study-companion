"""
AI Assignment Feedback Agent Routes (feedback.py)
=================================================

Exposes endpoints for analyzing student code submissions, mathematical derivations,
and written assignment solutions to generate structured 4-part AI feedback reports.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_optional_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    AssignmentFeedbackRequest,
    AssignmentFeedbackResponse,
)
from app.ai.agents.feedback_agent import feedback_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Agent #8: AI Assignment Feedback Agent"])


@router.post("/assignment/feedback", response_model=AssignmentFeedbackResponse, status_code=status.HTTP_200_OK)
async def generate_assignment_feedback(
    req: AssignmentFeedbackRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> AssignmentFeedbackResponse:
    """
    Analyzes student code/written submissions and returns structured 4-part AI feedback.
    """
    student_id = req.student_id or (current_user.id if current_user else "demo_student")

    try:
        res = await feedback_agent.analyze_submission(
            db=db,
            student_id=student_id,
            assignment_title=req.assignment_title,
            submission_text=req.submission_text,
            submission_type=req.submission_type,
            subject=req.subject,
        )
        return AssignmentFeedbackResponse(**res)
    except Exception as e:
        logger.error("Failed to generate assignment feedback: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Assignment Feedback Agent error: {str(e)}",
        )
