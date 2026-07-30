"""Course and assignment routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.models import AppRole, Assignment, Course, User
from app.schemas.schemas import (
    AssignmentCreate,
    AssignmentRead,
    CourseCreate,
    CourseRead,
)

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
def list_courses(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.created_at)))


@router.post("", response_model=CourseRead, status_code=201)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(AppRole.teacher, AppRole.admin)),
) -> Course:
    course = Course(
        title=payload.title,
        description=payload.description,
        teacher_id=current_user.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}/assignments", response_model=list[AssignmentRead])
def list_assignments(
    course_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Assignment]:
    if db.get(Course, course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return list(
        db.scalars(select(Assignment).where(Assignment.course_id == course_id))
    )


@router.post("/assignments", response_model=AssignmentRead, status_code=201)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(AppRole.teacher, AppRole.admin)),
) -> Assignment:
    course = db.get(Course, payload.course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role is AppRole.teacher and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")

    assignment = Assignment(**payload.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
