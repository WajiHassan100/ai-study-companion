"""
Spaced Repetition Service (SM-2 Algorithm)
==========================================

Implements the SuperMemo SM-2 spaced repetition algorithm for intelligent
review scheduling. Tracks per-topic review intervals based on student
performance quality, ensuring optimal long-term retention.

Based on: Piotr Wozniak's SM-2 algorithm (1987), used by Anki and similar tools.
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session as DBSession

logger = logging.getLogger(__name__)


@dataclass
class SpacedRepetitionItem:
    """Tracks spaced repetition state for a single topic."""

    topic: str
    ease_factor: float = 2.5
    interval_days: int = 1
    repetitions: int = 0
    next_review: Optional[datetime] = None
    last_reviewed: Optional[datetime] = None

    def update_after_review(self, quality: int) -> None:
        """
        Update spaced repetition parameters after a review session.

        Args:
            quality: Review quality rating (0-5 scale):
                0 = Complete failure, no recall
                1 = Incorrect, but upon seeing answer, remembered
                2 = Incorrect, but answer seemed easy to recall
                3 = Correct with serious difficulty
                4 = Correct after hesitation
                5 = Perfect recall
        """
        quality = max(0, min(5, quality))

        if quality >= 3:  # Successful recall
            if self.repetitions == 0:
                self.interval_days = 1
            elif self.repetitions == 1:
                self.interval_days = 6
            else:
                self.interval_days = round(self.interval_days * self.ease_factor)
            self.repetitions += 1
        else:  # Failed recall — reset
            self.repetitions = 0
            self.interval_days = 1

        # Update ease factor using SM-2 formula
        self.ease_factor = max(
            1.3,
            self.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
        )

        self.last_reviewed = datetime.now(timezone.utc)
        self.next_review = self.last_reviewed + timedelta(days=self.interval_days)

    def is_due(self) -> bool:
        """Check if this topic is due for review."""
        if self.next_review is None:
            return True
        return datetime.now(timezone.utc) >= self.next_review

    def days_until_due(self) -> int:
        """Days until next review (negative means overdue)."""
        if self.next_review is None:
            return 0
        delta = self.next_review - datetime.now(timezone.utc)
        return delta.days

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dict for JSON storage."""
        return {
            "topic": self.topic,
            "ease_factor": round(self.ease_factor, 2),
            "interval_days": self.interval_days,
            "repetitions": self.repetitions,
            "next_review": self.next_review.isoformat() if self.next_review else None,
            "last_reviewed": self.last_reviewed.isoformat() if self.last_reviewed else None,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "SpacedRepetitionItem":
        """Deserialize from dict."""
        item = cls(
            topic=data.get("topic", "Unknown"),
            ease_factor=float(data.get("ease_factor", 2.5)),
            interval_days=int(data.get("interval_days", 1)),
            repetitions=int(data.get("repetitions", 0)),
        )
        if data.get("next_review"):
            item.next_review = datetime.fromisoformat(data["next_review"])
        if data.get("last_reviewed"):
            item.last_reviewed = datetime.fromisoformat(data["last_reviewed"])
        return item


class SpacedRepetitionService:
    """Service for managing spaced repetition schedules per student."""

    def _load_sr_data(self, db: DBSession, student_id: str) -> dict[str, SpacedRepetitionItem]:
        """Load spaced repetition data from StudentProfile."""
        from app.models.models import StudentProfile

        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if not profile:
            return {}

        try:
            raw = json.loads(getattr(profile, "spaced_repetition_json", "{}") or "{}")
        except Exception:
            raw = {}

        items: dict[str, SpacedRepetitionItem] = {}
        for topic, data in raw.items():
            if isinstance(data, dict):
                data["topic"] = topic
                items[topic] = SpacedRepetitionItem.from_dict(data)
        return items

    def _save_sr_data(
        self, db: DBSession, student_id: str, items: dict[str, SpacedRepetitionItem]
    ) -> None:
        """Save spaced repetition data to StudentProfile."""
        from app.models.models import StudentProfile

        profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
        if not profile:
            return

        serialized = {topic: item.to_dict() for topic, item in items.items()}
        profile.spaced_repetition_json = json.dumps(serialized)
        db.add(profile)
        db.commit()

    def get_due_topics(self, db: DBSession, student_id: str) -> list[dict[str, Any]]:
        """
        Get all topics that are due for review today.

        Returns:
            List of dicts with topic info and urgency data.
        """
        items = self._load_sr_data(db, student_id)
        due: list[dict[str, Any]] = []

        for topic, item in items.items():
            if item.is_due():
                due.append({
                    "topic": topic,
                    "ease_factor": item.ease_factor,
                    "interval_days": item.interval_days,
                    "days_overdue": abs(item.days_until_due()),
                    "last_reviewed": item.last_reviewed.isoformat() if item.last_reviewed else "Never",
                    "repetitions": item.repetitions,
                })

        # Sort by most overdue first
        due.sort(key=lambda x: x["days_overdue"], reverse=True)
        return due

    def record_review(
        self, db: DBSession, student_id: str, topic: str, quality: int
    ) -> dict[str, Any]:
        """
        Record a review for a topic and update SM-2 parameters.

        Args:
            quality: 0-5 rating. Map from quiz scores:
                0-30% → quality 0
                31-50% → quality 1
                51-60% → quality 2
                61-70% → quality 3
                71-85% → quality 4
                86-100% → quality 5
        """
        items = self._load_sr_data(db, student_id)

        if topic not in items:
            items[topic] = SpacedRepetitionItem(topic=topic)

        items[topic].update_after_review(quality)
        self._save_sr_data(db, student_id, items)

        return items[topic].to_dict()

    @staticmethod
    def score_to_quality(score_percentage: float) -> int:
        """Convert a quiz score percentage (0-100) to SM-2 quality (0-5)."""
        if score_percentage >= 86:
            return 5
        elif score_percentage >= 71:
            return 4
        elif score_percentage >= 61:
            return 3
        elif score_percentage >= 51:
            return 2
        elif score_percentage >= 31:
            return 1
        else:
            return 0

    def get_review_summary_for_prompt(self, db: DBSession, student_id: str) -> str:
        """
        Generate a formatted string for injection into agent prompts
        listing topics due for review.
        """
        due = self.get_due_topics(db, student_id)
        if not due:
            return "No topics currently due for spaced repetition review."

        lines = ["PRIORITY REVIEW TOPICS (due for spaced repetition):"]
        for i, item in enumerate(due[:5], 1):
            overdue_str = f"{item['days_overdue']} days overdue" if item["days_overdue"] > 0 else "due TODAY"
            lines.append(
                f"{i}. \"{item['topic']}\" — last reviewed {item['last_reviewed']}, "
                f"{overdue_str} (ease: {item['ease_factor']:.1f})"
            )

        return "\n".join(lines)


# Singleton instance
spaced_repetition_service = SpacedRepetitionService()
