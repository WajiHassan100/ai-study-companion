"""
Conversation Memory Persistence
================================

Manages message history persistence using SQLAlchemy sessions.
"""

from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from sqlalchemy.orm import Session as DBSession

from app.models.models import AIChatMessage, AIChatSession


class DBChatMessageHistory(BaseChatMessageHistory):
    """
    SQLAlchemy-backed chat message history for LangChain agents.
    """

    def __init__(self, db: DBSession, session_id: str, student_id: str | None = None, course_id: str | None = None):
        self.db = db
        self.session_id = session_id

        # Ensure session record exists
        session_rec = self.db.query(AIChatSession).filter_by(id=session_id).first()
        if not session_rec and student_id:
            session_rec = AIChatSession(
                id=session_id,
                student_id=student_id,
                course_id=course_id,
                agent_type="tutor",
            )
            self.db.add(session_rec)
            self.db.commit()

    @property
    def messages(self) -> list[BaseMessage]:
        records = (
            self.db.query(AIChatMessage)
            .filter_by(session_id=self.session_id)
            .order_by(AIChatMessage.created_at.asc())
            .all()
        )
        msg_list: list[BaseMessage] = []
        for r in records:
            if r.sender == "user":
                msg_list.append(HumanMessage(content=r.content))
            else:
                msg_list.append(AIMessage(content=r.content))
        return msg_list

    def add_message(self, message: BaseMessage) -> None:
        sender = "user" if isinstance(message, HumanMessage) else "assistant"
        rec = AIChatMessage(
            session_id=self.session_id,
            sender=sender,
            content=str(message.content),
        )
        self.db.add(rec)
        self.db.commit()

    def clear(self) -> None:
        self.db.query(AIChatMessage).filter_by(session_id=self.session_id).delete()
        self.db.commit()

    async def summarize_if_needed(self, llm, max_messages: int = 20) -> None:
        """
        If conversation history exceeds max_messages, summarize older messages
        to save context window tokens while retaining key learning context.

        Args:
            llm: LangChain LLM instance for generating summaries.
            max_messages: Threshold before summarization triggers.
        """
        all_msgs = self.messages
        if len(all_msgs) <= max_messages:
            return

        # Keep last 6 messages intact for immediate context
        older_msgs = all_msgs[:-6]
        recent_msgs = all_msgs[-6:]

        # Build summary from older messages
        conversation_text = "\n".join(
            f"{'Student' if isinstance(m, HumanMessage) else 'AI'}: {m.content[:200]}"
            for m in older_msgs
        )

        summary_prompt = (
            "Summarize this tutoring conversation concisely. "
            "Focus on: topics covered, student's understanding level, key concepts explained, "
            "unresolved questions, and any areas where the student struggled.\n\n"
            f"Conversation:\n{conversation_text}"
        )

        try:
            summary_response = await llm.ainvoke([HumanMessage(content=summary_prompt)])
            summary_text = summary_response.content.strip()

            # Delete ALL messages for this session
            self.db.query(AIChatMessage).filter_by(session_id=self.session_id).delete()
            self.db.commit()

            # Insert summary as first message
            self.add_message(AIMessage(
                content=f"[Previous Session Summary: {summary_text}]"
            ))

            # Re-add recent messages
            for msg in recent_msgs:
                self.add_message(msg)

            import logging
            logging.getLogger(__name__).info(
                "Summarized %d older messages into 1 summary for session %s",
                len(older_msgs), self.session_id,
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                "Conversation summarization failed for session %s: %s",
                self.session_id, e,
            )

