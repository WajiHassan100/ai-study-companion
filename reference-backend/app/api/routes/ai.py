"""AI assistant routes — PLACEHOLDER.

Replace the body of `chat` with a LangChain / LangGraph agent invocation.
A typical LangGraph wiring looks like:

    from langgraph.graph import StateGraph
    graph = build_school_assistant_graph()          # app/ai/graph.py
    result = await graph.ainvoke({"messages": [...]}, config={...})
    return ChatResponse(reply=result["messages"][-1].content, placeholder=False)
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user)) -> ChatResponse:
    return ChatResponse(
        reply=(
            f"AI assistant is not connected yet. You said: '{payload.message}'. "
            f"Once a LangChain/LangGraph agent is wired up, it will answer as your "
            f"{current_user.role.value} assistant."
        ),
        thread_id=payload.thread_id,
        placeholder=True,
    )
