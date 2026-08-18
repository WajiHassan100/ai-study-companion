"""Shared pytest fixtures and test environment configuration.

Environment variables are set BEFORE importing the app so the settings object
picks up the isolated test database and secrets.
"""

import os  # noqa: E402

# A per-run DB file avoids stale-state flakes between test runs.
TEST_DB = f"./_test_db_{os.getpid()}.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"
os.environ["SUPABASE_JWT_SECRET"] = "test-supabase-secret"

import time  # noqa: E402

import jwt as pyjwt  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def supabase_token() -> str:
    """A token signed exactly like a Supabase-issued access token."""
    now = int(time.time())
    payload = {
        "sub": "11111111-2222-4333-8444-555555555555",
        "email": "supa@test.com",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": now,
        "exp": now + 3600,
    }
    return pyjwt.encode(payload, "test-supabase-secret", algorithm="HS256")


@pytest.fixture(scope="session", autouse=True)
def _cleanup_test_db():
    yield
    # Release pooled connections before removing the file (Windows locks it).
    try:
        from app.db.session import engine

        engine.dispose()
    except Exception:
        pass
    try:
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
    except Exception:
        pass


def register_student(client, email: str, full_name: str = "Test Student") -> dict:
    """Registers a student and returns the full token response."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": full_name,
            "password": "testpass123",
            "role": "student",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
