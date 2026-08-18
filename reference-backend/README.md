# Reference backend — FastAPI

This folder is a **source-only reference scaffold**. It does not run inside
Lovable (which hosts the React/TanStack app); copy it into VS Code and run it
locally, or deploy it anywhere Python runs.

The live app in this project already has a working backend (auth, profiles,
roles, RLS) via Lovable Cloud. Use this scaffold if you want to self-host a
Python API instead — especially for LangChain/LangGraph agents.

## Layout

```
reference-backend/
├── app/
│   ├── main.py                 FastAPI app, CORS, router wiring
│   ├── core/
│   │   ├── config.py           Settings from .env
│   │   └── security.py         Password hashing + JWT
│   ├── db/session.py           Engine, SessionLocal, Base, get_db
│   ├── models/models.py        User, Course, Enrollment, Assignment
│   ├── schemas/schemas.py      Pydantic request/response models
│   └── api/
│       ├── deps.py             get_current_user, require_roles
│       └── routes/
│           ├── auth.py         register / login / me
│           ├── users.py        admin user + role management
│           ├── courses.py      courses & assignments
│           └── ai.py           AI chat endpoint (PLACEHOLDER)
├── requirements.txt
└── .env.example
```

## Run it

```bash
cd reference-backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for interactive API docs.

## Auth

- `JWT_SECRET_KEY` signs tokens issued by this backend's `/auth/login` + `/auth/register`.
- `SUPABASE_JWT_SECRET` (from the Supabase project settings, **JWT Secret** under
  Authentication → JWT Settings) is optional. When set, the backend also accepts
  Supabase-issued access tokens, auto-provisions a matching `users` row on first
  request, and keys all agent data (profiles, plans, attempts) to the Supabase
  user id — so the frontend's existing `Authorization: Bearer <supabase token>`
  works with no extra setup. Supabase users always get the `student` role.

## Roles

`AppRole` is `student | teacher | admin`, matching the roles in the Lovable app.
Guard any route with:

```python
from app.api.deps import require_roles
from app.models.models import AppRole

@router.get("/reports")
def reports(user = Depends(require_roles(AppRole.admin))):
    ...
```

## Tests

```bash
cd reference-backend
.venv/Scripts/python.exe -m pytest tests/ -q
```

The suite covers bcrypt/JWT primitives, Supabase-token acceptance, auth
requirements on every AI route, student-data ownership (IDOR), and the
"no fabricated data" guarantees (empty plans/profiles for new students,
loud failures for unknown quizzes/exams).

## Adding the AI agents later

`app/api/routes/ai.py` returns a canned placeholder reply. To make it real:

1. `pip install langchain langgraph langchain-openai` (uncomment in requirements).
2. Create `app/ai/graph.py` with a `StateGraph` that has tools for courses,
   assignments and grades (reuse the SQLAlchemy session).
3. Replace the body of `chat()` with `await graph.ainvoke(...)` and set
   `placeholder=False`.

See `setup-guide.md` for the full local setup and how to point the frontend at
this API.
