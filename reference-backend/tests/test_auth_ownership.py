"""Tests for authentication requirements and student-data ownership (IDOR)."""

from tests.conftest import auth_header, register_student


def test_ai_routes_reject_unauthenticated(client):
    endpoints = [
        ("/api/v1/ai/orchestrate", {"query": "hello"}),
        ("/api/v1/ai/tutor/chat", {"message": "hello"}),
        ("/api/v1/ai/planner/generate", {"student_id": "x"}),
        ("/api/v1/ai/quiz/generate", {"student_id": "x", "num_questions": 2}),
        ("/api/v1/ai/assessment/evaluate", {"student_id": "x", "topic": "t", "question": "q", "student_answer": "a"}),
        ("/api/v1/ai/coach/insights", {"student_id": "x"}),
        ("/api/v1/ai/exam/generate", {"student_id": "x"}),
        ("/api/v1/ai/assignment/feedback", {"assignment_title": "t", "submission_text": "s"}),
        ("/api/v1/ai/rag/query", {"course_id": "c", "query": "q"}),
    ]
    for path, body in endpoints:
        response = client.post(path, json=body)
        assert response.status_code == 401, (path, response.status_code)

    for path in [
        "/api/v1/ai/student/profile/anyuser",
        "/api/v1/ai/planner/anyuser",
        "/api/v1/ai/quiz/anyuser",
        "/api/v1/ai/tutor/history/nonexistent",
    ]:
        response = client.get(path)
        assert response.status_code == 401, (path, response.status_code)


def test_student_cannot_read_another_students_data(client):
    alice = register_student(client, "alice@test.com")
    bob = register_student(client, "bob@test.com")
    headers = auth_header(alice["access_token"])
    bob_id = bob["user"]["id"]

    # Own profile is readable.
    own = client.get(f"/api/v1/ai/student/profile/{alice['user']['id']}", headers=headers)
    assert own.status_code == 200

    # Bob's profile, plans, and quiz history are off-limits.
    for path in [
        f"/api/v1/ai/student/profile/{bob_id}",
        f"/api/v1/ai/planner/{bob_id}",
        f"/api/v1/ai/quiz/{bob_id}",
        f"/api/v1/ai/student/analysis/{bob_id}",
    ]:
        response = client.get(path, headers=headers)
        assert response.status_code == 403, (path, response.status_code)

    # Client-supplied student_id in a POST body cannot impersonate another student.
    impersonation = client.post(
        "/api/v1/ai/quiz/generate",
        headers=headers,
        json={"student_id": bob_id, "num_questions": 2},
    )
    assert impersonation.status_code == 403


def test_student_cannot_read_anothers_chat_history(client):
    alice = register_student(client, "alice2@test.com")
    bob = register_student(client, "bob2@test.com")
    headers = auth_header(alice["access_token"])
    bob_id = bob["user"]["id"]

    response = client.get(f"/api/v1/ai/tutor/history/{bob_id}", headers=headers)
    assert response.status_code == 404  # session id == bob's user id does not exist as a session


def test_supabase_token_auto_provisions_user(client, supabase_token):
    headers = auth_header(supabase_token)
    supabase_user_id = "11111111-2222-4333-8444-555555555555"

    # First call auto-provisions the user row and returns an empty, honest profile.
    profile = client.get(f"/api/v1/ai/student/profile/{supabase_user_id}", headers=headers)
    assert profile.status_code == 200
    body = profile.json()
    assert body["student_id"] == supabase_user_id
    assert body["weaknesses"] == []
    assert body["topic_mastery"] == {}

    # The auto-provisioned identity can access its own empty plan list.
    plans = client.get(f"/api/v1/ai/planner/{supabase_user_id}", headers=headers)
    assert plans.status_code == 200
    assert plans.json() == []


def test_teacher_endpoints_require_teacher_role(client):
    student = register_student(client, "student-only@test.com")
    headers = auth_header(student["access_token"])
    response = client.post(
        "/api/v1/ai/teacher/lesson-plan",
        headers=headers,
        json={"course_id": "c", "topic": "Photosynthesis"},
    )
    assert response.status_code == 403
