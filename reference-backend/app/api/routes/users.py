"""User administration routes (admin only)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.models import AppRole, User
from app.schemas.schemas import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(AppRole.admin)),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at)))


@router.patch("/{user_id}/role", response_model=UserRead)
def update_role(
    user_id: str,
    role: AppRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(AppRole.admin)),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    db.refresh(user)
    return user
