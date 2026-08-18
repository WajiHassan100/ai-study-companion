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

from app.api.deps import get_current_user, resolve_student_id, ensure_owns_student
from app.db.session import get_db
from app.models.models import User, AIChatMessage, AIChatSession
from app.schemas.schemas import (
    ChatRequest,
    ChatResponse,
    TutorChatRequest,
    TutorChatResponse,
    OrchestrationRequest,
    OrchestrationResponse,
)
from app.ai.agents.tutor_agent import TutorAgent
from app.ai.agents.orchestrator_agent import orchestrator_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

# Singleton agent instance
tutor_agent = TutorAgent()


@router.post("/orchestrate", response_model=OrchestrationResponse)
async def orchestrate_request(
    payload: OrchestrationRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrchestrationResponse:
    """
    Central AI Orchestrator endpoint.
    Analyzes student prompt intent, delegates execution to specialized agents,
    and returns unified multi-agent response with decision reasoning.
    """
    student_id = resolve_student_id(payload.student_id, current_user)
    try:
        res = await orchestrator_agent.orchestrate(
            db=db,
            student_id=student_id,
            query=payload.query,
            course_id=payload.course_id,
            session_id=payload.session_id,
        )
        return OrchestrationResponse(
            orchestrator_decision=res.get("orchestrator_decision", {}),
            response=res.get("response", ""),
            delegated_agents=res.get("delegated_agents", []),
            session_id=res.get("session_id"),
        )
    except Exception as e:
        logger.error("AI Orchestrator query failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Orchestrator Agent error: {str(e)}",
        )


@router.post("/tutor/chat", response_model=TutorChatResponse)
async def tutor_chat(
    payload: TutorChatRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TutorChatResponse:
    """
    Dedicated AI Tutor endpoint.
    Accepts student questions, maintains conversation history in DB,
    and returns a structured educational response.
    """
    student_id = resolve_student_id(payload.student_id, current_user)

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
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """
    General AI assistant route invoking the AI Tutor Agent under the hood.
    """
    student_id = current_user.id
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


@router.post("/tutor/chat/stream")
async def tutor_chat_stream(
    payload: TutorChatRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Streams the AI Tutor response token-by-token via Server-Sent Events (SSE).
    """
    from fastapi.responses import StreamingResponse
    import json
    import asyncio

    student_id = resolve_student_id(payload.student_id, current_user)
    session_id = payload.session_id or str(uuid.uuid4())

    async def event_generator():
        try:
            # 1. Pull settings
            student_level = payload.student_level or "beginner"
            learning_style = payload.learning_style or "visual"
            
            # Automatically pull student profile from DB if available
            if student_id and db:
                from app.models.models import StudentProfile
                profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
                if profile:
                    if student_level == "beginner" and profile.current_level:
                        student_level = profile.current_level
                    if learning_style == "visual" and profile.learning_style:
                        learning_style = profile.learning_style

            # 2. Get student context summary
            try:
                from app.ai.context.student_context import StudentContext
                student_context = StudentContext.from_db(db, student_id)
                student_context_summary = student_context.to_prompt_summary()
            except Exception as e:
                logger.warning("Failed to construct StudentContext for stream: %s", e)
                student_context_summary = "No cross-agent performance intelligence available."

            # 3. Retrieve deep student personalization & memory context
            from app.ai.services.student_memory_service import student_memory_service
            student_memory_context = student_memory_service.retrieve_student_memory_context(db, student_id)

            # 4. Retrieve course materials context from RAG
            course_materials_context = "No course-specific materials uploaded for this question."
            try:
                from app.ai.agents.rag_agent import rag_agent
                rag_chunks = rag_agent.retrieve_relevant_chunks(course_id=payload.course_id or "biol_101", query=payload.message, top_k=2)
                if rag_chunks:
                    chunks_list = []
                    for c in rag_chunks:
                        chunks_list.append(
                            f"From Grounded Document: '{c.get('material_title')}', {c.get('chapter')} (Page/Slide {c.get('page_number')}):\n"
                            f"\"...{c.get('content')[:500]}...\""
                        )
                    course_materials_context = "\n\n".join(chunks_list)
            except Exception as e:
                logger.warning("Failed to retrieve course materials for stream: %s", e)

            from app.ai.memory.conversation_memory import DBChatMessageHistory
            history = DBChatMessageHistory(
                db=db,
                session_id=session_id,
                student_id=student_id,
                course_id=payload.course_id,
            )

            # Summarize if needed
            try:
                await history.summarize_if_needed(tutor_agent.llm, max_messages=20)
            except Exception as e:
                logger.warning("Failed to summarize chat history for stream: %s", e)

            chat_messages = history.messages

            # Recent turns
            memory_context = "No previous session history."
            if chat_messages:
                recent_turns = [f"{m.type}: {m.content[:100]}" for m in chat_messages[-4:]]
                memory_context = "Recent Session History:\n" + "\n".join(recent_turns)

            # Stuck detection
            stuck_keywords = ["stuck", "don't understand", "dont get it", "confused", "explain again", "hard", "help me", "don't know"]
            is_stuck = any(kw in payload.message.lower() for kw in stuck_keywords)
            stuck_count = 1 if is_stuck else 0
            if is_stuck:
                for msg_item in reversed(chat_messages):
                    if getattr(msg_item, "type", "") == "human":
                        if any(kw in str(msg_item.content).lower() for kw in stuck_keywords):
                            stuck_count += 1
            assistance_mode = "worked_example" if stuck_count >= 2 else "socratic_hint"

            # Format prompt
            prompt_value = tutor_agent.prompt.format_prompt(
                student_id=student_id,
                student_level=student_level,
                learning_style=learning_style,
                course_id=payload.course_id or "General",
                assistance_mode=assistance_mode,
                memory_context=memory_context,
                student_memory_context=student_memory_context,
                student_context_summary=student_context_summary,
                course_materials_context=course_materials_context,
                chat_history=chat_messages,
                message=payload.message,
            )

            # Yield token stream
            full_response = ""
            async for chunk in tutor_agent.llm.astream(prompt_value.to_messages()):
                content = chunk.content
                full_response += content
                yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
                await asyncio.sleep(0.002)

            # Parse response
            from app.ai.utils import robust_parse_json
            parsed = robust_parse_json(
                full_response,
                llm=tutor_agent.llm,
                fallback={
                    "topic": "Academic Assistance",
                    "socratic_question": f"What do you think is the core idea behind {payload.message}?",
                    "explanation": full_response,
                    "examples": [],
                    "practice_questions": [],
                    "encouragement": "Keep going! Asking questions is the best way to learn.",
                    "recommendations": ["Review course materials"],
                }
            )

            socratic_question = parsed.get("socratic_question", "")
            explanation = parsed.get("explanation", full_response)
            if socratic_question:
                formatted_answer = f"❓ **Socratic Thought Question:**\n_{socratic_question}_\n\n{explanation}"
            else:
                formatted_answer = explanation

            # Save to DB conversation history
            from langchain_core.messages import AIMessage
            history.add_message(prompt_value.to_messages()[-1])  # HumanMessage
            history.add_message(AIMessage(content=full_response)) # AIMessage

            final_data = {
                "answer": formatted_answer,
                "session_id": session_id,
                "topic": parsed.get("topic", "Tutor Session"),
                "socratic_question": socratic_question,
                "explanation": explanation,
                "examples": parsed.get("examples", []),
                "practice_questions": parsed.get("practice_questions", []),
                "encouragement": parsed.get("encouragement", "Great job staying curious!"),
                "recommendations": parsed.get("recommendations", []),
            }

            yield f"data: {json.dumps({'type': 'complete', 'content': final_data})}\n\n"

        except Exception as err:
            logger.error("Error in tutor streaming: %s", err, exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'content': str(err)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/tutor/history/{session_id}")
def get_session_history(
    session_id: str,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns saved message history for a given chat session.
    """
    session = db.get(AIChatSession, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    ensure_owns_student(session.student_id, current_user)

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
