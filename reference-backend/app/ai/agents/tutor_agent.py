"""
AI Tutor Agent Implementation
=============================

Core agent class responsible for handling student academic queries,
executing the 7-step pedagogical workflow, maintaining conversation context,
and generating structured explanations.
"""

import json
import uuid
import logging
from typing import Any
from sqlalchemy.orm import Session as DBSession

from app.ai.services.llm_service import get_llm
from app.ai.prompts.tutor_prompt import get_tutor_prompt_template
from app.ai.memory.conversation_memory import DBChatMessageHistory
from app.models.models import StudentProfile

from app.ai.services.student_memory_service import student_memory_service

logger = logging.getLogger(__name__)


class TutorAgent:
    """
    AI Tutor Agent encapsulating prompt management, LLM invocation,
    and structured response validation.
    """

    def __init__(self):
        self.llm = get_llm()
        self.prompt = get_tutor_prompt_template()

    async def ask(
        self,
        db: DBSession,
        student_id: str,
        message: str,
        course_id: str | None = None,
        session_id: str | None = None,
        student_level: str = "beginner",
        learning_style: str = "visual",
    ) -> dict[str, Any]:
        """
        Executes a tutor session query.
        """
        # Retrieve deep student personalization & memory context
        student_memory_context = student_memory_service.retrieve_student_memory_context(db, student_id)

        # Automatically pull student profile from DB if available
        if student_id and db:
            profile = db.query(StudentProfile).filter_by(student_id=student_id).first()
            if profile:
                if student_level == "beginner" and profile.current_level:
                    student_level = profile.current_level
                if learning_style == "visual" and profile.learning_style:
                    learning_style = profile.learning_style

        if not session_id:
            session_id = str(uuid.uuid4())

        history = DBChatMessageHistory(
            db=db,
            session_id=session_id,
            student_id=student_id,
            course_id=course_id,
        )

        chat_messages = history.messages

        # Persistent Memory Context Summary
        memory_context = "No previous session history."
        if chat_messages:
            recent_turns = [f"{m.type}: {m.content[:100]}" for m in chat_messages[-4:]]
            memory_context = "Recent Session History:\n" + "\n".join(recent_turns)

        # Adaptive Hint Scaling: Check if student is stuck
        stuck_keywords = ["stuck", "don't understand", "dont get it", "confused", "explain again", "hard", "help me", "don't know"]
        is_stuck = any(kw in message.lower() for kw in stuck_keywords)
        
        # Check previous student messages for stuck count
        stuck_count = 1 if is_stuck else 0
        if is_stuck:
            for msg_item in reversed(chat_messages):
                if getattr(msg_item, "type", "") == "human":
                    if any(kw in str(msg_item.content).lower() for kw in stuck_keywords):
                        stuck_count += 1

        assistance_mode = "worked_example" if stuck_count >= 2 else "socratic_hint"

        # Render prompt with inputs & history
        prompt_value = self.prompt.format_prompt(
            student_id=student_id,
            student_level=student_level,
            learning_style=learning_style,
            course_id=course_id or "General",
            assistance_mode=assistance_mode,
            memory_context=memory_context,
            student_memory_context=student_memory_context,
            chat_history=chat_messages,
            message=message,
        )

        logger.info("Invoking Tutor Agent session=%s message='%s'", session_id, message)
        
        # Invoke LLM
        response_msg = await self.llm.ainvoke(prompt_value.to_messages())
        raw_text = response_msg.content.strip()

        # Clean JSON markdown fences if present
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        # Parse JSON output
        try:
            parsed = json.loads(raw_text)
        except Exception as e:
            logger.warning("Failed to parse JSON output directly: %s. Using raw fallback.", e)
            parsed = {
                "topic": "Academic Assistance",
                "socratic_question": f"What do you think is the core idea behind {message}?",
                "explanation": raw_text,
                "examples": [],
                "practice_questions": [],
                "encouragement": "Keep going! Asking questions is the best way to learn.",
                "recommendations": ["Review course materials"],
            }

        socratic_question = parsed.get("socratic_question", "")
        explanation = parsed.get("explanation", raw_text)

        # Build full formatted answer string including Socratic opening question
        if socratic_question:
            formatted_answer = f"❓ **Socratic Thought Question:**\n_{socratic_question}_\n\n{explanation}"
        else:
            formatted_answer = explanation

        # Save to DB conversation history
        history.add_message(prompt_value.to_messages()[-1])  # HumanMessage
        history.add_message(response_msg)                    # AIMessage

        return {
            "answer": formatted_answer,
            "session_id": session_id,
            "topic": parsed.get("topic", "Tutor Session"),
            "socratic_question": socratic_question,
            "explanation": explanation,
            "examples": parsed.get("examples", []),
            "practice_questions": parsed.get("practice_questions", []),
            "encouragement": parsed.get("encouragement", "Great job staying curious!"),
            "recommendations": parsed.get("recommendations", ["Ask follow-up questions", "Practice the questions provided"]),
        }
