# Setup guide

How to run the two halves of this project: the **Lovable app** (React + TanStack
Start, already live in the preview) and the **reference FastAPI backend**
(source-only, runs on your own machine).

---

## 1. The Lovable app

Nothing to install here — it builds and previews automatically. Its backend
(auth, profiles, `user_roles`, RLS policies) runs on Lovable Cloud.

To work on it locally:

```bash
bun install
bun run dev          # http://localhost:8080
```

Key files:

| Path | Purpose |
| --- | --- |
| `src/routes/index.tsx` | Public landing page |
| `src/routes/auth.tsx` | Sign in / register (email + Google) |
| `src/routes/_authenticated/` | Everything behind the auth gate |
| `src/hooks/useAuth.tsx` | Session + role context |
| `src/components/` | Navbar, Sidebar, cards, tables, charts, AI panel |

Roles are `student`, `teacher`, `admin`, stored in the `user_roles` table
(never on `profiles`) and enforced with a `has_role()` security-definer
function inside RLS policies.

---

## 2. The reference FastAPI backend

```bash
cd reference-backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit JWT_SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Default database is SQLite (`school_assistant.db`, created on first start).
For Postgres, set:

```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/school
```

### Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | public |
| POST | `/api/v1/auth/login` | public |
| GET | `/api/v1/auth/me` | any signed-in user |
| GET | `/api/v1/users` | admin |
| PATCH | `/api/v1/users/{id}/role` | admin |
| GET | `/api/v1/courses` | any signed-in user |
| POST | `/api/v1/courses` | teacher, admin |
| GET | `/api/v1/courses/{id}/assignments` | any signed-in user |
| POST | `/api/v1/courses/assignments` | teacher, admin |
| POST | `/api/v1/ai/chat` | any signed-in user (placeholder) |

---

## 3. Pointing the frontend at the FastAPI backend (optional)

The Lovable app uses Lovable Cloud by default. If you'd rather call the Python
API, add to `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

and fetch with the JWT returned by `/auth/login`:

```ts
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Make sure your frontend origin is listed in `CORS_ORIGINS` in
`reference-backend/.env`.

---

## 4. Adding LangChain / LangGraph agents

1. Uncomment the AI dependencies in `reference-backend/requirements.txt` and
   reinstall.
2. Set `OPENAI_API_KEY` in `reference-backend/.env`.
3. Create `app/ai/graph.py`:

```python
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")

def assistant(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

builder = StateGraph(MessagesState)
builder.add_node("assistant", assistant)
builder.add_edge(START, "assistant")
builder.add_edge("assistant", END)
graph = builder.compile()
```

4. Call it from `app/api/routes/ai.py` and set `placeholder=False`.
5. In the Lovable app, replace `AiAssistantPanel`'s placeholder state with a
   fetch to `/api/v1/ai/chat`.

---

## Troubleshooting

- **`ModuleNotFoundError: app`** — run `uvicorn` from inside `reference-backend/`.
- **bcrypt warnings on install** — install build tools, or switch the passlib
  scheme to `argon2` and add `argon2-cffi`.
- **CORS errors** — add your exact frontend origin (scheme + host + port) to
  `CORS_ORIGINS`.
- **401 everywhere** — send `Authorization: Bearer <access_token>` from the
  login response.
