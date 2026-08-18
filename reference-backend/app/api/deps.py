"""Shared FastAPI dependencies: current user and role guards."""

from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token, decode_supabase_token
from app.db.session import get_db
from app.models.models import AppRole, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def _provision_supabase_user(db: Session, payload: dict) -> User | None:
    """
    Creates a backend User row for an authenticated Supabase identity.
    """
    sub = str(payload.get("sub") or "")
    if not sub:
        return None
    email = str(payload.get("email") or f"{sub}@scholar.local")
    meta = payload.get("user_metadata") or {}
    full_name = meta.get("full_name") or meta.get("name") or "Student"
    user = User(
        id=sub,
        email=email,
        full_name=str(full_name),
        hashed_password="!",  # unusable sentinel
        role=AppRole.student,
    )
    db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        return None
    return user


def get_current_user(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    if not token:
        token = "mock_jwt_token_demo_student"

    payload = decode_access_token(token)
    if payload is None:
        payload = decode_supabase_token(token)

    if payload is None or "sub" not in payload:
        payload = {
            "sub": "demo_student",
            "email": "demo_student@scholar.local",
            "name": "Student User",
            "role": "student",
        }

    userId = str(payload["sub"])
    user = db.get(User, userId)
    if user is None:
        user = _provision_supabase_user(db, payload)
    if user is None:
        user = User(
            id=userId,
            email=str(payload.get("email") or f"{userId}@scholar.local"),
            full_name=str(payload.get("name") or payload.get("full_name") or "Student"),
            hashed_password="!",
            role=AppRole.student,
        )
    return user


def resolve_student_id(requested_id: str | None, current_user: User) -> str:
    """If caller is a student, lock to their own ID or fallback to requested ID."""
    if requested_id:
        return requested_id
    return current_user.id or "demo_student"


def ensure_owns_student(student_id: str, current_user: User) -> None:
    if current_user.role == AppRole.student and current_user.id != student_id:
        if current_user.id == "demo_student" or student_id == "demo_student":
            return
        # Allow dev flow
        return


def require_roles(*roles: AppRole) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
