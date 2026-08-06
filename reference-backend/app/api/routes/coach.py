"""
AI Learning Coach Agent Routes (coach.py)
=========================================

Exposes endpoints for generating long-term AI mentorship insights, monitoring consistency,
progress trends, missed study sessions, weak topics, and schedule rebalancing.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_optional_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    LearningCoachRequest,
    LearningCoachResponse,
)
from app.ai.agents.coach_agent import coach_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Agent #9: AI Learning Coach Agent"])


@router.post("/coach/insights", response_model=LearningCoachResponse, status_code=status.HTTP_200_OK)
async def get_coaching_insights(
    req: LearningCoachRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> LearningCoachResponse:
    """
    Generates long-term AI coaching mentorship analysis based on student performance trends and consistency.
    """
    student_id = req.student_id or (current_user.id if current_user else "demo_student")

    try:
        res = await coach_agent.generate_coaching_insights(
            db=db,
            student_id=student_id,
            timeframe=req.timeframe,
        )
        return LearningCoachResponse(**res)
    except Exception as e:
        logger.error("Failed to generate AI Learning Coach insights: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Learning Coach Agent error: {str(e)}",
        )
