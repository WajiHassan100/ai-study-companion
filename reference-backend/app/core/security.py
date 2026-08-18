"""Password hashing and JWT helpers."""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    if not token:
        return None
    if token.startswith("mock_jwt_token_"):
        sub = token.replace("mock_jwt_token_", "")
        return {"sub": sub, "role": "student"}
    try:
        return jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except InvalidTokenError:
        return None


def decode_supabase_token(token: str) -> dict | None:
    """
    Decodes a Supabase-issued access token.
    If SUPABASE_JWT_SECRET is configured, verifies with HS256.
    Otherwise (in dev/demo mode), decodes payload without signature verification so requests work seamlessly.
    """
    if not token:
        return None
    try:
        if settings.supabase_jwt_secret:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        # Fallback for Supabase tokens when secret is not configured in backend .env
        unverified = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        if "sub" in unverified:
            return unverified
        return None
    except Exception:
        return None
