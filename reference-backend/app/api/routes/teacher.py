"""
API Routes for Agent #6: Teacher Assistant Agent (teacher.py)
===============================================================
Exposes endpoints for lesson plan drafting and automated assignment grading.
"""

from fastapi import APIRouter, HTTPException, status

from app.ai.agents.teacher_agent import teacher_agent
from app.schemas.schemas import (
    TeacherGradeRequest,
    TeacherGradeResponse,
    TeacherLessonPlanRequest,
    TeacherLessonPlanResponse,
)

router = APIRouter(prefix="/ai/teacher", tags=["Agent #6: Teacher Assistant Agent"])


@router.post("/lesson-plan", response_model=TeacherLessonPlanResponse, status_code=status.HTTP_200_OK)
def draft_lesson_plan(req: TeacherLessonPlanRequest) -> TeacherLessonPlanResponse:
    """
    Drafts a pedagogically structured lesson plan for a given topic and grade level.
    """
    try:
        res = teacher_agent.draft_lesson_plan(
            course_id=req.course_id,
            topic=req.topic,
            target_grade=req.target_grade,
            duration_minutes=req.duration_minutes,
        )
        return TeacherLessonPlanResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lesson plan: {str(e)}",
        )


@router.post("/grade", response_model=TeacherGradeResponse, status_code=status.HTTP_200_OK)
def grade_student_submission(req: TeacherGradeRequest) -> TeacherGradeResponse:
    """
    Evaluates a student assignment submission and generates score, feedback, and strengths.
    """
    try:
        res = teacher_agent.grade_submission(
            assignment_title=req.assignment_title,
            submission_text=req.submission_text,
            rubric=req.rubric,
        )
        return TeacherGradeResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade submission: {str(e)}",
        )
