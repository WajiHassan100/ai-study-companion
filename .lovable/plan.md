## Goal

A running Personal AI School Assistant with email/password auth and Student / Teacher / Admin roles, plus a non-running FastAPI + PostgreSQL reference scaffold and setup guide you can open in VS Code and extend with LangChain later.

## Part 1 — The working app (runs and previews here)

Backend: Lovable Cloud (managed Postgres + auth).

Database
- `profiles` — id (FK to auth users), full_name, email, created_at. Auto-created on signup via trigger.
- `app_role` enum: `student` | `teacher` | `admin`.
- `user_roles` — separate table (never on profiles), with a `has_role()` security-definer function used by all policies. Role defaults to `student` at signup; admins can change roles.
- Row-level security on both tables: users read/update their own profile; admins read all.

Pages
- `/` — landing page with product intro and sign-in CTA.
- `/auth` — combined login + register (email/password, plus Google sign-in), with role selection at registration.
- `/dashboard` — role-aware redirect into the right dashboard.
- `/dashboard/student` — welcome card, placeholder cards for courses, assignments, grades, plus an "AI Study Assistant" placeholder panel.
- `/dashboard/teacher` — class overview, roster and assignment placeholders, AI assistant placeholder.
- `/dashboard/admin` — user list from `profiles` + `user_roles` with role management (real, working), system stat cards.
- All dashboards behind the authenticated route gate; admin area additionally role-gated.

Shared UI
- Navbar with session-aware account menu and sign-out, collapsible Sidebar, dashboard stat cards, data table, and a chart component — mirroring the component folders you listed, in the framework's own conventions.

The AI assistant is UI-only in this version: clearly labelled placeholder panels with the wiring points marked, ready for LangChain/LangGraph later.

## Part 2 — Reference scaffold (source files only, do not run here)

Created under `reference-backend/` in this repo, downloadable with the project:
- `app/main.py`, `database/connection.py`, `database/database_models.py`
- `models/` — user, student, teacher, course, assignment (SQLAlchemy)
- `schemas/` — user, course, student (Pydantic)
- `routes/` — auth, users, students, teachers, admin (FastAPI routers)
- `services/` — authentication (JWT, bcrypt), user_service
- `middleware/`, `ai/{agents,services,prompts,memory}` with placeholder modules and READMEs
- `requirements.txt`, `.env.example`, `README.md`
- `database/schema.sql` — Postgres DDL matching the models
- `documentation/architecture.md` and `setup-guide.md` — VS Code setup, frontend/backend installs, PostgreSQL configuration, env vars, and run commands for both servers

## Technical notes

This project runs TanStack Start (React + TypeScript, file-based routing, Tailwind v4 configured in `src/styles.css`). So the live app uses `.tsx` routes under `src/routes/` rather than `pages/*.jsx` + `tailwind.config.js`, and there is no `src/services/api.js` — data access goes through the Cloud client and typed server functions. The FastAPI scaffold is checked in as plain source; it is not built, imported, or executed by this environment. If you later run it locally, point the React frontend at it by swapping the data layer — the setup guide documents that path.

## Scope check

Courses, assignments, grades, and submissions are placeholders in this pass (per your answer), backed by real schema only in the reference `schema.sql`. Say the word and I'll add the live tables in a follow-up.
