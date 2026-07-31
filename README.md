# AI Study Companion

==================================================

PROJECT FILE STRUCTURE AND GENERATION REQUIREMENTS

==================================================

Generate the complete project with proper folders and files.

Do not provide only code snippets or examples. Create a complete application structure with all required files.

The final project should be organized as:

Personal-AI-School-Assistant/

│

├── frontend/

│   │

│   ├── public/

│   │

│   ├── src/

│   │   │

│   │   ├── components/

│   │   │   ├── Navbar/

│   │   │   ├── Sidebar/

│   │   │   ├── DashboardCards/

│   │   │   ├── Forms/

│   │   │   ├── Tables/

│   │   │   └── Charts/

│   │   │

│   │   ├── pages/

│   │   │   ├── Login.jsx

│   │   │   ├── Register.jsx

│   │   │   ├── StudentDashboard.jsx

│   │   │   ├── TeacherDashboard.jsx

│   │   │   └── AdminDashboard.jsx

│   │   │

│   │   ├── layouts/

│   │   │

│   │   ├── services/

│   │   │   └── api.js

│   │   │

│   │   ├── hooks/

│   │   │

│   │   ├── utils/

│   │   │

│   │   ├── assets/

│   │   │

│   │   ├── App.jsx

│   │   └── main.jsx

│   │

│   ├── package.json

│   ├── tailwind.config.js

│   └── README.md

│

│

├── backend/

│   │

│   ├── app/

│   │   │

│   │   ├── main.py

│   │   │

│   │   ├── database/

│   │   │   ├── connection.py

│   │   │   └── database_models.py

│   │   │

│   │   ├── models/

│   │   │   ├── user.py

│   │   │   ├── student.py

│   │   │   ├── teacher.py

│   │   │   ├── course.py

│   │   │   └── assignment.py

│   │   │

│   │   ├── schemas/

│   │   │   ├── user_schema.py

│   │   │   ├── course_schema.py

│   │   │   └── student_schema.py

│   │   │

│   │   ├── routes/

│   │   │   ├── auth.py

│   │   │   ├── users.py

│   │   │   ├── students.py

│   │   │   ├── teachers.py

│   │   │   └── admin.py

│   │   │

│   │   ├── services/

│   │   │   ├── authentication.py

│   │   │   └── user_service.py

│   │   │

│   │   ├── middleware/

│   │   │

│   │   └── ai/

│   │       ├── agents/

│   │       ├── services/

│   │       ├── prompts/

│   │       └── memory/

│   │

│   ├── requirements.txt

│   ├── .env.example

│   └── README.md

│

│

├── database/

│   └── schema.sql

│

├── documentation/

│   └── architecture.md

│

├── README.md

└── setup-guide.md

FILE CREATION REQUIREMENTS:

Generate all necessary files automatically.

Include:

Frontend:

- React components

- Pages

- Routing setup

- API service configuration

- Tailwind CSS configuration

- Package dependencies

Backend:

- FastAPI application

- Database models

- API routes

- Authentication logic

- JWT implementation

- SQLAlchemy configuration

- Environment configuration

The project should be exportable/downloadable as a complete application.

The generated code should be directly compatible with Visual Studio Code.

Provide instructions for:

1. Opening the project in VS Code

2. Installing frontend dependencies

3. Installing backend dependencies

4. Configuring PostgreSQL database

5. Setting environment variables

6. Running frontend server

7. Running backend server

The final result should be a complete working foundation that can later be extended with LangChain/LangGraph AI agents.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e2e43e34-c32f-4904-b4a6-b38eef9f00eb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
