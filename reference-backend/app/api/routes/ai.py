"""
AI Assistant Routes
===================

Exposes endpoints for the AI Tutor Agent, including:
- POST /api/v1/ai/tutor/chat (Dedicated AI Tutor Agent endpoint)
- POST /api/v1/ai/chat (General AI chat endpoint)
- GET  /api/v1/ai/tutor/history/{session_id} (Session history endpoint)
"""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_optional_current_user
from app.db.session import get_db
from app.models.models import User, AIChatMessage
from app.schemas.schemas import ChatRequest, ChatResponse, TutorChatRequest, TutorChatResponse
from app.ai.agents.tutor_agent import TutorAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

# Singleton agent instance
tutor_agent = TutorAgent()


@router.post("/tutor/chat", response_model=TutorChatResponse)
async def tutor_chat(
    payload: TutorChatRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> TutorChatResponse:
    """
    Dedicated AI Tutor endpoint.
    Accepts student questions, maintains conversation history in DB,
    and returns a structured educational response.
    """
    student_id = payload.student_id or (current_user.id if current_user else f"demo_{uuid.uuid4().hex[:8]}")

    try:
        result = await tutor_agent.ask(
            db=db,
            student_id=student_id,
            message=payload.message,
            course_id=payload.course_id,
            session_id=payload.session_id,
            student_level=payload.student_level,
            learning_style=payload.learning_style,
        )

        return TutorChatResponse(
            answer=result["answer"],
            session_id=result["session_id"],
            topic=result.get("topic", "Tutor Session"),
            explanation=result.get("explanation", result["answer"]),
            examples=result.get("examples", []),
            practice_questions=result.get("practice_questions", []),
            encouragement=result.get("encouragement", ""),
            recommendations=result.get("recommendations", []),
        )
    except Exception as e:
        logger.error("AI Tutor query failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Tutor Agent error: {str(e)}",
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: DBSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
) -> ChatResponse:
    """
    General AI assistant route invoking the AI Tutor Agent under the hood.
    """
    student_id = current_user.id if current_user else "demo_student"
    try:
        result = await tutor_agent.ask(
            db=db,
            student_id=student_id,
            message=payload.message,
            session_id=payload.thread_id,
        )

        return ChatResponse(
            reply=result["answer"],
            thread_id=result["session_id"],
            placeholder=False,
        )
    except Exception as e:
        logger.error("AI Chat query failed: %s", str(e), exc_info=True)
        return ChatResponse(
            reply=f"Sorry, I encountered an issue: {str(e)}",
            thread_id=payload.thread_id,
            placeholder=True,
        )


@router.get("/tutor/history/{session_id}")
def get_session_history(
    session_id: str,
    db: DBSession = Depends(get_db),
):
    """
    Returns saved message history for a given chat session.
    """
    messages = (
        db.query(AIChatMessage)
        .filter(AIChatMessage.session_id == session_id)
        .order_by(AIChatMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]
