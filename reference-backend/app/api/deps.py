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

    The row keeps the Supabase user id as its primary key so all agent data
    (profiles, plans, attempts) is keyed to the same id the frontend uses.
    The password is an unusable sentinel — these users log in via Supabase,
    never with the backend's password flow.
    """
    sub = str(payload.get("sub") or "")
    if not sub:
        return None
    email = str(payload.get("email") or f"{sub}@supabase.local")
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
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_error

    payload = decode_access_token(token)
    is_supabase = False
    if payload is None:
        payload = decode_supabase_token(token)
        is_supabase = payload is not None

    if payload is None or "sub" not in payload:
        raise credentials_error

    user = db.get(User, payload["sub"])
    if user is None:
        # Only auto-provision identities that came from a trusted Supabase token.
        if not is_supabase:
            raise credentials_error
        user = _provision_supabase_user(db, payload)
    if user is None:
        raise credentials_error
    return user


def require_roles(*roles: AppRole) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency


def resolve_student_id(requested: str | None, current_user: User) -> str:
    """
    Returns the effective student id for a request.

    A student can only ever act on their own id; admins may act on behalf of
    any student. This prevents IDOR via client-supplied student_id values.
    """
    if requested and requested != current_user.id:
        if current_user.role is not AppRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot access another student's data",
            )
        return requested
    return current_user.id


def ensure_owns_student(student_id: str, current_user: User) -> None:
    """Raises 403 unless the current user owns the given student id (admins bypass)."""
    if student_id != current_user.id and current_user.role is not AppRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another student's data",
        )
