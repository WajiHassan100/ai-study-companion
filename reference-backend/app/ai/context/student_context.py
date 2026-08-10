"""
Cross-Agent Student Context Sharing Module
===========================================

Provides a shared StudentContext dataclass that every agent can receive to
understand the student's full learning journey across ALL agents in the system.
This enables cross-agent intelligence: the Tutor knows about Quiz failures,
the Coach knows about Profiler weaknesses, and quizzes adapt to real mastery.
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session as DBSession

logger = logging.getLogger(__name__)


@dataclass
class StudentContext:
    """Shared context passed to every agent for personalized responses."""

    student_id: str
    student_level: str = "beginner"
    learning_style: str = "visual"

    # From Profiler Agent
    weak_topics: list[str] = field(default_factory=list)
    strong_topics: list[str] = field(default_factory=list)
    mastery_scores: dict[str, float] = field(default_factory=dict)

    # From Coach Agent
    study_consistency_score: float = 0.0
    missed_sessions: int = 0
    recommended_focus_areas: list[str] = field(default_factory=list)

    # From Quiz/Exam History
    recent_quiz_scores: list[dict[str, Any]] = field(default_factory=list)
    commonly_wrong_question_types: list[str] = field(default_factory=list)

    # Computed
    days_since_last_activity: int = 0
    total_study_hours_this_week: float = 0.0

    def get_priority_topics(self, n: int = 3) -> list[str]:
        """Return the N topics most needing attention (lowest mastery scores)."""
        if not self.mastery_scores:
            return self.weak_topics[:n]
        sorted_topics = sorted(self.mastery_scores.items(), key=lambda x: x[1])
        return [topic for topic, _score in sorted_topics[:n]]

    def get_recent_scores_for_topic(self, topic: str) -> list[float]:
        """Return recent quiz scores for a specific topic."""
        return [
            q["score"] for q in self.recent_quiz_scores
            if q.get("topic", "").lower() == topic.lower()
        ]

    def to_prompt_summary(self) -> str:
        """Generate a natural-language summary for injection into any agent prompt."""
        lines = [
            f"Student Level: {self.student_level} | Learning Style: {self.learning_style}",
            f"Weak Areas: {', '.join(self.weak_topics[:5]) or 'None identified yet'}",
            f"Strong Areas: {', '.join(self.strong_topics[:3]) or 'None identified yet'}",
        ]

        # Mastery breakdown
        if self.mastery_scores:
            top_3_weak = self.get_priority_topics(3)
            if top_3_weak:
                mastery_strs = [
                    f"{t}: {self.mastery_scores.get(t, 0):.0f}%"
                    for t in top_3_weak
                ]
                lines.append(f"Priority Review Topics: {', '.join(mastery_strs)}")

        # Recent quiz performance
        if self.recent_quiz_scores:
            last = self.recent_quiz_scores[-1]
            lines.append(
                f"Last Quiz: {last.get('topic', 'Unknown')} — scored {last.get('score', 0):.0f}%"
            )

        # Study consistency
        if self.study_consistency_score > 0:
            lines.append(f"Study Consistency: {self.study_consistency_score:.0f}%")
        if self.missed_sessions > 0:
            lines.append(f"⚠️ Missed {self.missed_sessions} planned study sessions recently")

        # Focus areas
        if self.recommended_focus_areas:
            lines.append(f"Coach Recommended Focus: {', '.join(self.recommended_focus_areas[:3])}")

        return "\n".join(lines)

    @classmethod
    def from_db(cls, db: Optional[DBSession], student_id: str) -> "StudentContext":
        """
        Build a StudentContext by querying StudentProfile, QuizAttempt, and StudyPlan tables.
        Gracefully handles missing data or database errors.
        """
        ctx = cls(student_id=student_id)

        if not db:
            return ctx

        try:
            from app.models.models import StudentProfile, QuizAttempt

            # ── Load student profile ──
            profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
            if profile:
                ctx.student_level = profile.current_level or "beginner"
                ctx.learning_style = profile.learning_style or "visual"

                # Parse JSON fields safely
                try:
                    ctx.mastery_scores = json.loads(profile.topic_mastery_json or "{}")
                except Exception:
                    ctx.mastery_scores = {}

                try:
                    ctx.weak_topics = json.loads(profile.weaknesses_json or "[]")
                except Exception:
                    ctx.weak_topics = []

                try:
                    ctx.strong_topics = json.loads(profile.strong_topics_json or "[]")
                except Exception:
                    ctx.strong_topics = []

                # Parse progress trends for coach data
                try:
                    trends = json.loads(profile.progress_trends_json or "{}")
                    ctx.study_consistency_score = float(trends.get("consistency_score", 0))
                    ctx.missed_sessions = int(trends.get("missed_sessions", 0))
                    focus = trends.get("recommended_focus", [])
                    ctx.recommended_focus_areas = focus if isinstance(focus, list) else []
                except Exception:
                    pass

                # Calculate days since last activity
                if profile.updated_at:
                    delta = datetime.now(timezone.utc) - profile.updated_at.replace(
                        tzinfo=timezone.utc
                    ) if profile.updated_at.tzinfo is None else datetime.now(timezone.utc) - profile.updated_at
                    ctx.days_since_last_activity = max(0, delta.days)

            # ── Load recent quiz attempts ──
            try:
                recent_attempts = (
                    db.query(QuizAttempt)
                    .filter(QuizAttempt.student_id == student_id)
                    .order_by(QuizAttempt.completed_at.desc())
                    .limit(5)
                    .all()
                )

                for attempt in reversed(recent_attempts):
                    # Get quiz topic from the related quiz record
                    quiz_topic = "Unknown"
                    if attempt.quiz:
                        quiz_topic = attempt.quiz.topic

                    ctx.recent_quiz_scores.append({
                        "topic": quiz_topic,
                        "score": attempt.score_percentage,
                        "date": attempt.completed_at.isoformat() if attempt.completed_at else "",
                    })

                    # Extract commonly wrong question types from feedback
                    try:
                        feedback = json.loads(attempt.feedback_json or "{}")
                        for _qid, fb in feedback.items():
                            if not fb.get("is_correct", True):
                                concept = fb.get("target_concept", "")
                                if concept and concept not in ctx.commonly_wrong_question_types:
                                    ctx.commonly_wrong_question_types.append(concept)
                    except Exception:
                        pass
            except Exception as e:
                logger.debug("Could not load quiz attempts for context: %s", e)

        except Exception as e:
            logger.warning("Error building StudentContext from DB: %s", e)

        return ctx
