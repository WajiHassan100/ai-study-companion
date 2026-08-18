"""
Study Planner Routes
====================

Exposes endpoints for generating personalized AI study plans and retrieving
saved study schedules.
"""

import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_current_user, resolve_student_id, ensure_owns_student
from app.db.session import get_db
from app.models.models import User, StudyPlan
from app.schemas.schemas import (
    PlannerGenerateRequest,
    PlannerGenerateResponse,
    StudyPlanResponse,
    StudyBlock,
)
from app.ai.agents.planner_agent import PlannerAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["planner"])

planner_agent = PlannerAgent()


@router.post("/planner/generate", response_model=PlannerGenerateResponse)
async def generate_study_plan(
    payload: PlannerGenerateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PlannerGenerateResponse:
    """
    Generates a personalized AI study schedule incorporating weak concepts and deadlines.
    """
    student_id = resolve_student_id(payload.student_id, current_user)

    try:
        result = await planner_agent.generate_plan(
            db=db,
            student_id=student_id,
            target_days=payload.target_days,
            custom_goals=payload.custom_goals,
            available_hours=payload.available_hours,
            learning_speed=payload.learning_speed,
        )

        schedule_blocks = [StudyBlock(**block) for block in result["schedule"]]

        return PlannerGenerateResponse(
            plan_id=result["plan_id"],
            title=result["title"],
            summary=result["summary"],
            schedule=schedule_blocks,
            action_items=result["action_items"],
            created_at=result["created_at"],
        )
    except Exception as e:
        logger.error("Study plan generation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Study Planner Agent error: {str(e)}",
        )


@router.get("/planner/{student_id}", response_model=list[StudyPlanResponse])
def get_student_study_plans(
    student_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[StudyPlanResponse]:
    """
    Retrieves saved study schedules for a given student.
    """
    ensure_owns_student(student_id, current_user)

    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.student_id == student_id)
        .order_by(StudyPlan.created_at.desc())
        .limit(5)
        .all()
    )

    if not plans:
        # Honest empty result — no fabricated default plan.
        return []

    response = []
    for plan in plans:
        try:
            schedule_list = json.loads(plan.schedule_json)
        except Exception:
            schedule_list = []

        try:
            action_items_list = json.loads(plan.action_items_json)
        except Exception:
            action_items_list = []

        blocks = [StudyBlock(**b) for b in schedule_list if isinstance(b, dict)]

        response.append(
            StudyPlanResponse(
                id=plan.id,
                student_id=plan.student_id,
                title=plan.title,
                summary=plan.summary or "",
                schedule=blocks,
                action_items=action_items_list,
                created_at=plan.created_at,
            )
        )

    return response
