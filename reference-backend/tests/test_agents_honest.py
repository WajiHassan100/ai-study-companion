"""Tests that agent-facing endpoints never fabricate data.

A fresh student must get empty profiles/plans, and grading unknown artifacts
must fail loudly instead of returning canned success.
"""

from tests.conftest import auth_header, register_student


def test_new_student_has_no_fabricated_plan(client):
    student = register_student(client, "fresh1@test.com")
    headers = auth_header(student["access_token"])
    student_id = student["user"]["id"]

    response = client.get(f"/api/v1/ai/planner/{student_id}", headers=headers)
    assert response.status_code == 200
    assert response.json() == []  # no hardcoded default plan


def test_new_student_profile_is_empty_not_fabricated(client):
    student = register_student(client, "fresh2@test.com")
    headers = auth_header(student["access_token"])
    student_id = student["user"]["id"]

    response = client.get(f"/api/v1/ai/student/profile/{student_id}", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["weaknesses"] == []
    assert body["topic_mastery"] == {}
    assert body["current_level"] == "beginner"


def test_grading_unknown_quiz_fails_loudly(client):
    student = register_student(client, "fresh3@test.com")
    headers = auth_header(student["access_token"])
    student_id = student["user"]["id"]

    response = client.post(
        "/api/v1/ai/quiz/submit",
        headers=headers,
        json={
            "quiz_id": "does-not-exist",
            "student_id": student_id,
            "user_answers": {"q1": "A"},
        },
    )
    assert response.status_code == 500
    assert "not found" in response.json()["detail"].lower()


def test_grading_unknown_exam_fails_loudly(client):
    student = register_student(client, "fresh4@test.com")
    headers = auth_header(student["access_token"])
    student_id = student["user"]["id"]

    response = client.post(
        "/api/v1/ai/exam/evaluate",
        headers=headers,
        json={
            "exam_id": "does-not-exist",
            "student_id": student_id,
            "user_answers": {"q1": "A"},
        },
    )
    assert response.status_code == 500
    assert "not found" in response.json()["detail"].lower()
