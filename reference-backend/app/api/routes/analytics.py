"""Student dashboard analytics endpoint.

Aggregates real data from StudentProfile, QuizAttempt, AIChatSession,
CourseDocument, and Enrollment tables into a single response shaped
for the frontend dashboard components.
"""

import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.models import (
    AIChatMessage,
    AIChatSession,
    CourseDocument,
    Enrollment,
    Course,
    QuizAttempt,
    StudentProfile,
    StudyPlan,
)

router = APIRouter(prefix="/student", tags=["student-analytics"])


# ── Response Schemas ──────────────────────────────────────────────────────


class WeakTopic(BaseModel):
    topic: str
    mastery_pct: float
    course: str


class RecommendedAction(BaseModel):
    title: str
    detail: str
    priority: int
    prompt: str = ""


class Recommendation(BaseModel):
    text: str
    detail: str
    action: str
    prompt: str


class AgentStatus(BaseModel):
    status: str
    last_activity: str


class RecentConversation(BaseModel):
    id: str
    title: str
    time: str
    prompt: str


class IndexedDocument(BaseModel):
    id: str
    title: str
    pages: int
    course: str


class DashboardAnalyticsResponse(BaseModel):
    # AiDailyBriefing
    streak_days: int
    streak_summary: str
    weak_topics: list[WeakTopic]
    recommended_actions: list[RecommendedAction]

    # AiLearningIntelligence
    consistency_score: int
    consistency_label: str
    performance_trend_pct: float
    performance_trend_label: str
    prediction_pct: int
    prediction_label: str
    recommendations: list[Recommendation]

    # AiAgentHub
    agent_statuses: dict[str, AgentStatus]

    # AiAssistantPanel
    recent_conversations: list[RecentConversation]
    indexed_documents: list[IndexedDocument]


# ── Helper functions ──────────────────────────────────────────────────────


def _compute_streak(study_history: list) -> tuple[int, str]:
    """Count consecutive study days up to today from study_history entries."""
    if not study_history:
        return 0, "No study sessions yet"

    today = datetime.now(timezone.utc).date()
    study_dates: set = set()

    for entry in study_history:
        if isinstance(entry, dict):
            date_str = entry.get("date") or entry.get("completed_at") or entry.get("timestamp", "")
        elif isinstance(entry, str):
            date_str = entry
        else:
            continue
        try:
            d = datetime.fromisoformat(str(date_str).replace("Z", "+00:00")).date()
            study_dates.add(d)
        except (ValueError, TypeError):
            continue

    if not study_dates:
        return 0, "No study sessions recorded"

    streak = 0
    check_date = today
    while check_date in study_dates:
        streak += 1
        check_date -= timedelta(days=1)

    # If today isn't included yet, check starting from yesterday
    if streak == 0:
        check_date = today - timedelta(days=1)
        while check_date in study_dates:
            streak += 1
            check_date -= timedelta(days=1)

    if streak == 0:
        return 0, "Start studying today to build a streak!"
    return streak, f"{streak} consecutive active study day{'s' if streak != 1 else ''}"


def _compute_weak_topics(mastery_json: str) -> list[WeakTopic]:
    """Extract topics with mastery < 60% from topic_mastery_json."""
    try:
        mastery = json.loads(mastery_json) if isinstance(mastery_json, str) else mastery_json
    except (json.JSONDecodeError, TypeError):
        return []

    weak = []
    if isinstance(mastery, dict):
        for topic, data in mastery.items():
            if isinstance(data, dict):
                pct = data.get("mastery", data.get("score", 0))
                course = data.get("course", "General")
            elif isinstance(data, (int, float)):
                pct = data
                course = "General"
            else:
                continue
            if pct < 60:
                weak.append(WeakTopic(topic=topic, mastery_pct=round(pct, 1), course=course))

    weak.sort(key=lambda w: w.mastery_pct)
    return weak[:5]


def _compute_consistency(study_history: list, days: int = 7) -> tuple[int, str]:
    """Score = (active study days in last N days / N) * 100."""
    if not study_history:
        return 0, "No Activity"

    cutoff = datetime.now(timezone.utc).date() - timedelta(days=days)
    active_dates: set = set()

    for entry in study_history:
        if isinstance(entry, dict):
            date_str = entry.get("date") or entry.get("completed_at") or entry.get("timestamp", "")
        elif isinstance(entry, str):
            date_str = entry
        else:
            continue
        try:
            d = datetime.fromisoformat(str(date_str).replace("Z", "+00:00")).date()
            if d >= cutoff:
                active_dates.add(d)
        except (ValueError, TypeError):
            continue

    score = round((len(active_dates) / days) * 100)
    score = min(score, 100)

    if score >= 80:
        label = "High Retention"
    elif score >= 50:
        label = "Good Retention"
    elif score >= 20:
        label = "Needs Improvement"
    else:
        label = "No Activity"

    return score, label


def _compute_performance_trend(db: Session, student_id: str) -> tuple[float, str]:
    """Compare avg quiz scores: last 7 days vs prior 7 days."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    recent_avg = (
        db.query(func.avg(QuizAttempt.score_percentage))
        .filter(QuizAttempt.student_id == student_id, QuizAttempt.completed_at >= week_ago)
        .scalar()
    )

    prior_avg = (
        db.query(func.avg(QuizAttempt.score_percentage))
        .filter(
            QuizAttempt.student_id == student_id,
            QuizAttempt.completed_at >= two_weeks_ago,
            QuizAttempt.completed_at < week_ago,
        )
        .scalar()
    )

    if recent_avg is None and prior_avg is None:
        return 0.0, "No Quiz Data"
    if prior_avg is None or prior_avg == 0:
        return round(recent_avg or 0, 1), "New Baseline"
    if recent_avg is None:
        return 0.0, "No Recent Quizzes"

    delta = round(recent_avg - prior_avg, 1)
    if delta > 0:
        label = "Upward Mastery"
    elif delta < 0:
        label = "Declining — Action Needed"
    else:
        label = "Steady"

    return delta, label


def _compute_prediction(db: Session, student_id: str) -> tuple[int, str]:
    """Weighted avg of last 10 quiz scores as exam readiness predictor."""
    recent_scores = (
        db.query(QuizAttempt.score_percentage)
        .filter(QuizAttempt.student_id == student_id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(10)
        .all()
    )

    if not recent_scores:
        return 0, "Not Enough Data"

    scores = [s[0] for s in recent_scores]
    # Weight recent scores more heavily
    weights = list(range(len(scores), 0, -1))
    weighted_avg = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
    pct = round(weighted_avg)

    return pct, "Exam Readiness"


def _get_agent_statuses(db: Session, student_id: str) -> dict[str, AgentStatus]:
    """Derive agent statuses from latest AIChatSession per agent_type."""
    agent_types = ["tutor", "planner", "assessment", "analytics"]
    statuses = {}

    for agent in agent_types:
        latest = (
            db.query(AIChatSession)
            .filter(AIChatSession.student_id == student_id, AIChatSession.agent_type == agent)
            .order_by(AIChatSession.created_at.desc())
            .first()
        )

        if latest:
            elapsed = datetime.now(timezone.utc) - latest.created_at.replace(tzinfo=timezone.utc)
            if elapsed < timedelta(minutes=5):
                time_str = "just now"
            elif elapsed < timedelta(hours=1):
                time_str = f"{int(elapsed.total_seconds() / 60)}m ago"
            elif elapsed < timedelta(days=1):
                time_str = f"{int(elapsed.total_seconds() / 3600)}h ago"
            else:
                time_str = f"{elapsed.days}d ago"

            msg_count = db.query(func.count(AIChatMessage.id)).filter(
                AIChatMessage.session_id == latest.id
            ).scalar() or 0

            statuses[agent] = AgentStatus(
                status="Online",
                last_activity=f"Processed {msg_count} messages {time_str}",
            )
        else:
            statuses[agent] = AgentStatus(status="Idle", last_activity="No sessions yet")

    return statuses


def _get_recent_conversations(db: Session, student_id: str) -> list[RecentConversation]:
    """Last 6 chat sessions with their first message as title/prompt."""
    sessions = (
        db.query(AIChatSession)
        .filter(AIChatSession.student_id == student_id)
        .order_by(AIChatSession.created_at.desc())
        .limit(6)
        .all()
    )

    now = datetime.now(timezone.utc)
    result = []

    for s in sessions:
        first_msg = (
            db.query(AIChatMessage)
            .filter(AIChatMessage.session_id == s.id, AIChatMessage.sender == "user")
            .order_by(AIChatMessage.created_at.asc())
            .first()
        )

        elapsed = now - s.created_at.replace(tzinfo=timezone.utc)
        if elapsed < timedelta(days=1):
            time_label = "Today"
        elif elapsed < timedelta(days=2):
            time_label = "Yesterday"
        else:
            time_label = f"{elapsed.days} days ago"

        prompt = first_msg.content if first_msg else (s.title or "AI Chat Session")
        title = prompt[:50] + ("..." if len(prompt) > 50 else "")

        result.append(RecentConversation(id=s.id, title=title, time=time_label, prompt=prompt))

    return result


def _get_indexed_documents(db: Session, student_id: str) -> list[IndexedDocument]:
    """Unique documents from course_documents, grouped by material_id."""
    docs = (
        db.query(
            CourseDocument.material_id,
            CourseDocument.material_title,
            CourseDocument.course_id,
            func.count(CourseDocument.id).label("page_count"),
        )
        .group_by(CourseDocument.material_id, CourseDocument.material_title, CourseDocument.course_id)
        .all()
    )

    return [
        IndexedDocument(
            id=d.material_id,
            title=d.material_title,
            pages=d.page_count,
            course=d.course_id or "General",
        )
        for d in docs
    ]


def _build_recommendations(
    weak_topics: list[WeakTopic], streak: int, trend_pct: float
) -> list[Recommendation]:
    """Generate contextual recommendations based on actual student data."""
    recs = []

    # Recommendation based on weakest topic
    if weak_topics:
        worst = weak_topics[0]
        recs.append(
            Recommendation(
                text=f"Focus on {worst.topic} — currently at {worst.mastery_pct}% mastery.",
                detail=f"Your {worst.course} scores show this topic needs targeted practice.",
                action="Practice",
                prompt=f"Quiz me on {worst.topic} to improve my mastery score",
            )
        )

    # Recommendation based on second weakest topic
    if len(weak_topics) >= 2:
        second = weak_topics[1]
        recs.append(
            Recommendation(
                text=f"Review {second.topic} with flashcards before it decays further.",
                detail=f"Mastery at {second.mastery_pct}% in {second.course}. Flashcard review recommended.",
                action="Flashcards",
                prompt=f"Generate flashcards for {second.topic} in {second.course}",
            )
        )

    # Recommendation based on streak
    if streak == 0:
        recs.append(
            Recommendation(
                text="Start a study session today to build your learning streak!",
                detail="Consistent daily study of 15+ minutes dramatically improves retention.",
                action="Start",
                prompt="Create a quick 15-minute study plan for today",
            )
        )
    elif streak >= 5:
        recs.append(
            Recommendation(
                text=f"Amazing {streak}-day streak! Schedule advanced practice to level up.",
                detail="Your consistency is excellent. Time to tackle harder problems.",
                action="Optimize",
                prompt="Generate an advanced practice set for my strongest topics",
            )
        )
    else:
        recs.append(
            Recommendation(
                text=f"Keep your {streak}-day streak alive — study 15 minutes today!",
                detail="You're building momentum. Don't break the chain.",
                action="Continue",
                prompt="Generate a quick 5-minute quiz to maintain my streak",
            )
        )

    # If no weak topics exist, add a general recommendation
    if not weak_topics:
        recs.append(
            Recommendation(
                text="All topics above 60% mastery — great work!",
                detail="Consider taking a practice exam to test your overall readiness.",
                action="Exam",
                prompt="Generate a comprehensive practice exam across all my courses",
            )
        )

    return recs[:3]


def _build_actions(
    weak_topics: list[WeakTopic], study_plans: list, streak: int
) -> list[RecommendedAction]:
    """Build prioritized action items for the daily briefing."""
    actions = []
    priority = 1

    # Action 1: Weakest topic remediation
    if weak_topics:
        worst = weak_topics[0]
        actions.append(
            RecommendedAction(
                title="Weakness Diagnostic",
                detail=f"{worst.topic} at {worst.mastery_pct}%. Solve adaptive questions.",
                priority=priority,
                prompt=f"Quiz me on {worst.topic} to improve my mastery",
            )
        )
        priority += 1

    # Action 2: Study plan follow-up
    if study_plans:
        actions.append(
            RecommendedAction(
                title="Follow Study Plan",
                detail="Continue your active study plan schedule.",
                priority=priority,
                prompt="Show me today's tasks from my study plan",
            )
        )
    else:
        actions.append(
            RecommendedAction(
                title="Generate Study Plan",
                detail="No active plan found. Create a personalized 7-day plan.",
                priority=priority,
                prompt="Create a 7-day study revision plan for my courses",
            )
        )
    priority += 1

    # Action 3: Streak maintenance
    if streak == 0:
        actions.append(
            RecommendedAction(
                title="Start Today's Session",
                detail="Complete a 15-minute block to start your streak.",
                priority=priority,
                prompt="Create a quick 15-minute study session for me",
            )
        )
    else:
        actions.append(
            RecommendedAction(
                title="Maintain Streak",
                detail=f"Keep your {streak}-day streak alive with a quick quiz.",
                priority=priority,
                prompt="Generate a quick 5-minute quiz to maintain my streak",
            )
        )

    return actions


# ── Main Endpoint ─────────────────────────────────────────────────────────


@router.get("/{student_id}/dashboard-analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(student_id: str, db: Session = Depends(get_db)):
    """Aggregate all student data into a single dashboard analytics response."""

    # 1. Load student profile
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()

    study_history: list = []
    mastery_json: str = "{}"

    if profile:
        try:
            study_history = json.loads(profile.study_history_json) if profile.study_history_json else []
        except (json.JSONDecodeError, TypeError):
            study_history = []
        mastery_json = profile.topic_mastery_json or "{}"

    # 2. Compute metrics
    streak_days, streak_summary = _compute_streak(study_history)
    weak_topics = _compute_weak_topics(mastery_json)
    consistency_score, consistency_label = _compute_consistency(study_history)
    trend_pct, trend_label = _compute_performance_trend(db, student_id)
    prediction_pct, prediction_label = _compute_prediction(db, student_id)

    # 3. Get study plans for action generation
    plans = db.query(StudyPlan).filter(StudyPlan.student_id == student_id).all()

    # 4. Build derived data
    recommendations = _build_recommendations(weak_topics, streak_days, trend_pct)
    actions = _build_actions(weak_topics, plans, streak_days)
    agent_statuses = _get_agent_statuses(db, student_id)
    recent_conversations = _get_recent_conversations(db, student_id)
    indexed_documents = _get_indexed_documents(db, student_id)

    return DashboardAnalyticsResponse(
        streak_days=streak_days,
        streak_summary=streak_summary,
        weak_topics=weak_topics,
        recommended_actions=actions,
        consistency_score=consistency_score,
        consistency_label=consistency_label,
        performance_trend_pct=trend_pct,
        performance_trend_label=trend_label,
        prediction_pct=prediction_pct,
        prediction_label=prediction_label,
        recommendations=recommendations,
        agent_statuses=agent_statuses,
        recent_conversations=recent_conversations,
        indexed_documents=indexed_documents,
    )
