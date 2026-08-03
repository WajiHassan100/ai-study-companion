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
