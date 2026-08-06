"""
Student Memory & Personalization Intelligence Service (student_memory_service.py)
===================================================================================
Manages deep student profile intelligence, memory retrieval before AI prompt generation,
and interaction tracking (past mistakes, weak/strong topics, progress trends, preferred styles).
"""

import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session as DBSession

from sqlalchemy import text
from app.models.models import StudentProfile, User

logger = logging.getLogger(__name__)


def _ensure_sqlite_columns(db: DBSession):
    """Dev convenience: Ensures new personalization memory columns exist on SQLite table."""
    cols = [
        ("preferred_explanation_method", "VARCHAR(50) DEFAULT 'worked_examples'"),
        ("strong_topics_json", "TEXT DEFAULT '[]'"),
        ("previous_mistakes_json", "TEXT DEFAULT '[]'"),
        ("study_history_json", "TEXT DEFAULT '[]'"),
        ("progress_trends_json", "TEXT DEFAULT '{}'"),
        ("recent_queries_json", "TEXT DEFAULT '[]'"),
    ]
    for col_name, col_def in cols:
        try:
            db.execute(text(f"ALTER TABLE student_profiles ADD COLUMN {col_name} {col_def}"))
            db.commit()
        except Exception:
            db.rollback()


class StudentMemoryService:
    """Service layer for student intelligence and memory context retrieval."""

    def get_or_create_profile(self, db: Optional[DBSession], student_id: str) -> Dict[str, Any]:
        """Retrieves or initializes a student's profile memory record."""
        if not db:
            return {
                "student_id": student_id,
                "current_level": "intermediate",
                "learning_style": "visual",
                "preferred_explanation_method": "Worked Examples & Conceptual Analogies",
                "weaknesses": ["Partial Derivatives", "Thylakoid Electron Transport"],
                "strong_topics": ["Single Variable Integration", "Cell Membrane Transport"],
                "previous_mistakes": ["Struggled connecting partial derivatives with 3D slope directional vectors."],
                "study_history": ["Reviewed Calculus Chapter 14", "Completed 5 Biology Practice Questions"],
                "progress_trends": {"Calculus": "+12% this week", "Biology": "+8% this week"},
                "recent_queries": ["What is a gradient vector?"],
                "topic_mastery": {"BIOL 101": 78.0, "MATH 201": 62.0, "PHYS 101": 84.0},
            }

        _ensure_sqlite_columns(db)

        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if not profile:
            try:
                user = db.query(User).filter_by(id=student_id).first()
                if not user:
                    user = User(
                        id=student_id,
                        email=f"{student_id}@student.edu",
                        full_name="Student",
                        hashed_password="demo_hashed_password",
                        role="student",
                    )
                    db.add(user)
                    db.commit()

                profile = StudentProfile(
                    student_id=student_id,
                    current_level="intermediate",
                    learning_style="visual",
                    preferred_explanation_method="Worked Examples & Conceptual Analogies",
                    weaknesses_json=json.dumps(["Partial Derivatives", "Thylakoid Electron Transport"]),
                    strong_topics_json=json.dumps(["Single Variable Integration", "Cell Membrane Transport"]),
                    previous_mistakes_json=json.dumps(["Struggled connecting partial derivatives with 3D slope directional vectors."]),
                    study_history_json=json.dumps(["Reviewed Calculus Chapter 14"]),
                    progress_trends_json=json.dumps({"Calculus": "+12% this week", "Biology": "+8% this week"}),
                    recent_queries_json=json.dumps([]),
                    topic_mastery_json=json.dumps({"BIOL 101": 78.0, "MATH 201": 62.0, "PHYS 101": 84.0}),
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)
            except Exception as err:
                db.rollback()
                logger.error("Error creating student profile/user: %s", err)
                profile = db.query(StudentProfile).filter_by(student_id=student_id).first()

        def _safe_json_list(field_str: str) -> List[str]:
            try:
                val = json.loads(field_str or "[]")
                return val if isinstance(val, list) else []
            except Exception:
                return []

        def _safe_json_dict(field_str: str) -> Dict[str, Any]:
            try:
                val = json.loads(field_str or "{}")
                return val if isinstance(val, dict) else {}
            except Exception:
                return {}

        if not profile:
            return {
                "student_id": student_id,
                "current_level": "intermediate",
                "learning_style": "visual",
                "preferred_explanation_method": "Worked Examples & Conceptual Analogies",
                "weaknesses": ["Partial Derivatives", "Thylakoid Electron Transport"],
                "strong_topics": ["Single Variable Integration", "Cell Membrane Transport"],
                "previous_mistakes": ["Struggled connecting partial derivatives with 3D slope directional vectors."],
                "study_history": ["Reviewed Calculus Chapter 14", "Completed 5 Biology Practice Questions"],
                "progress_trends": {"Calculus": "+12% this week", "Biology": "+8% this week"},
                "recent_queries": ["What is a gradient vector?"],
                "topic_mastery": {"BIOL 101": 78.0, "MATH 201": 62.0, "PHYS 101": 84.0},
            }

        return {
            "student_id": profile.student_id,
            "current_level": profile.current_level or "intermediate",
            "learning_style": profile.learning_style or "visual",
            "preferred_explanation_method": getattr(profile, "preferred_explanation_method", "Worked Examples & Conceptual Analogies") or "Worked Examples",
            "weaknesses": _safe_json_list(profile.weaknesses_json),
            "strong_topics": _safe_json_list(getattr(profile, "strong_topics_json", "[]")),
            "previous_mistakes": _safe_json_list(getattr(profile, "previous_mistakes_json", "[]")),
            "study_history": _safe_json_list(getattr(profile, "study_history_json", "[]")),
            "progress_trends": _safe_json_dict(getattr(profile, "progress_trends_json", "{}")),
            "recent_queries": _safe_json_list(getattr(profile, "recent_queries_json", "[]")),
            "topic_mastery": _safe_json_dict(profile.topic_mastery_json),
        }

    def retrieve_student_memory_context(self, db: Optional[DBSession], student_id: str) -> str:
        """Constructs a rich, structured memory context string for prompt injection into AI agents."""
        p = self.get_or_create_profile(db, student_id)

        weaknesses_str = ", ".join(p["weaknesses"]) if p["weaknesses"] else "None recorded"
        strong_str = ", ".join(p["strong_topics"]) if p["strong_topics"] else "None recorded"
        mistakes_str = " | ".join(p["previous_mistakes"][-3:]) if p["previous_mistakes"] else "No critical mistakes recorded."
        queries_str = ", ".join(p["recent_queries"][-3:]) if p["recent_queries"] else "None"

        trends_formatted = ", ".join([f"{k}: {v}" for k, v in p["progress_trends"].items()]) if p["progress_trends"] else "Stable"

        return f"""
================================================================
STUDENT PERSONALIZATION & MEMORY CONTEXT:
----------------------------------------------------------------
- Student Academic Level: {p['current_level'].upper()}
- Preferred Learning Style: {p['learning_style'].capitalize()} Learner
- Preferred Explanation Method: {p['preferred_explanation_method']}
- Known Weak Concepts (Struggles): {weaknesses_str}
- Known Strong Concepts (Mastered): {strong_str}
- Recent Mistakes & Confusion History: {mistakes_str}
- Recent Query History: {queries_str}
- Progress Trends: {trends_formatted}
================================================================
INSTRUCTION FOR AI AGENT: Use the student's known weak concepts and previous mistakes
to build explicit bridge connections in your explanation (e.g. "Since you previously struggled with X, I will connect Y to X first.").
================================================================
"""

    def record_interaction(
        self,
        db: Optional[DBSession],
        student_id: str,
        query: str,
        response_summary: str,
        detected_mistake: Optional[str] = None,
    ):
        """Records student query, updates recent history, and registers detected mistakes."""
        if not db:
            return

        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if not profile:
            return

        try:
            recent_queries = json.loads(getattr(profile, "recent_queries_json", "[]") or "[]")
            if query not in recent_queries:
                recent_queries.append(query)
                if len(recent_queries) > 10:
                    recent_queries.pop(0)
            profile.recent_queries_json = json.dumps(recent_queries)

            if detected_mistake:
                mistakes = json.loads(getattr(profile, "previous_mistakes_json", "[]") or "[]")
                if detected_mistake not in mistakes:
                    mistakes.append(detected_mistake)
                    if len(mistakes) > 5:
                        mistakes.pop(0)
                profile.previous_mistakes_json = json.dumps(mistakes)

            db.add(profile)
            db.commit()
        except Exception as e:
            logger.error("Failed to record student interaction memory: %s", str(e))


# Singleton instance
student_memory_service = StudentMemoryService()
