"""Pydantic request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.models import AppRole


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: AppRole = AppRole.student


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: AppRole
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class CourseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    teacher_id: str
    created_at: datetime


class AssignmentCreate(BaseModel):
    course_id: str
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    due_at: datetime | None = None
    max_score: float = 100.0


class AssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    description: str | None
    due_at: datetime | None
    max_score: float
    created_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    thread_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    thread_id: str | None = None
    placeholder: bool = True


# ── AI Tutor Agent Schemas ─────────────────────────────────────
class TutorChatRequest(BaseModel):
    student_id: str = Field(default="", description="ID of the student requesting assistance")
    message: str = Field(min_length=1, description="Student academic query or prompt")
    course_id: str | None = Field(default=None, description="Optional active course ID")
    session_id: str | None = Field(default=None, description="Optional active session ID for chat continuity")
    student_level: str = Field(default="beginner", description="beginner, intermediate, or advanced")
    learning_style: str = Field(default="visual", description="visual, auditory, reading, or kinesthetic")


class TutorChatResponse(BaseModel):
    answer: str = Field(description="Primary structured response/explanation")
    session_id: str = Field(description="Chat session ID")
    topic: str = Field(default="Tutor Session", description="Identified academic topic")
    explanation: str = Field(default="", description="Step-by-step concept explanation")
    examples: list[str] = Field(default_factory=list, description="Worked-through examples")
    practice_questions: list[str] = Field(default_factory=list, description="Practice questions with hints")
    encouragement: str = Field(default="", description="Warm motivational closing")
    recommendations: list[str] = Field(default_factory=list, description="Follow-up revision topics or actions")


# ── Assessment & Profiler Agent Schemas ──────────────────────────
class AssessmentEvaluateRequest(BaseModel):
    student_id: str = Field(min_length=1, description="ID of the student")
    topic: str = Field(min_length=1, description="Topic being assessed")
    question: str = Field(min_length=1, description="The practice question or assignment prompt")
    student_answer: str = Field(min_length=1, description="The answer provided by the student")


class AssessmentEvaluateResponse(BaseModel):
    student_id: str
    topic: str
    is_correct: bool = Field(description="Whether the answer demonstrates correct understanding")
    score: float = Field(description="Score between 0 and 100")
    feedback: str = Field(description="Pedagogical feedback explaining what was right or wrong")
    concept_gaps: list[str] = Field(default_factory=list, description="Specific conceptual gaps identified")
    updated_mastery: float = Field(description="Updated topic mastery percentage (0-100)")
    recommended_level: str = Field(description="Updated recommended level: beginner, intermediate, or advanced")


class StudentProfileResponse(BaseModel):
    student_id: str
    current_level: str
    learning_style: str
    weaknesses: list[str]
    topic_mastery: dict[str, float]
    updated_at: datetime


# ── Study Planner Agent Schemas ──────────────────────────────────
class StudyBlock(BaseModel):
    day: str = Field(description="Day of week or date (e.g. Monday, Day 1)")
    topic: str = Field(description="Subject or concept to review")
    duration_minutes: int = Field(default=30, description="Recommended study duration in minutes")
    priority: str = Field(default="normal", description="high, normal, or low")
    description: str = Field(description="Specific task or revision goal for this block")


class PlannerGenerateRequest(BaseModel):
    student_id: str = Field(min_length=1, description="ID of the student")
    target_days: int = Field(default=5, description="Number of days to plan for")
    custom_goals: str | None = Field(default=None, description="Optional custom target or exam deadline notes")
    available_hours: float = Field(default=2.0, ge=0.5, le=8.0, description="Available study hours per day")
    learning_speed: str = Field(default="moderate", description="fast, moderate, or thorough")


class PlannerGenerateResponse(BaseModel):
    plan_id: str
    title: str
    summary: str
    schedule: list[StudyBlock]
    action_items: list[str]
    created_at: datetime


class StudyPlanResponse(BaseModel):
    id: str
    student_id: str
    title: str
    summary: str
    schedule: list[StudyBlock]
    action_items: list[str]
    created_at: datetime


# ── Quiz & Flashcard Generator Agent Schemas ──────────────────────
class QuizQuestionItem(BaseModel):
    id: str = Field(description="Question ID")
    question: str = Field(description="The question prompt")
    options: dict[str, str] = Field(description="Map of options e.g. {'A': '...', 'B': '...'}")
    correct_option: str = Field(description="Key of correct option e.g. 'A', 'B', 'C', or 'D'")
    explanation: str = Field(description="Detailed pedagogical explanation of why this answer is correct")
    target_concept: str = Field(default="", description="Specific concept or sub-topic tested")


class QuizGenerateRequest(BaseModel):
    student_id: str = Field(min_length=1, description="ID of the student")
    topic: str | None = Field(default=None, description="Optional topic (if omitted, uses weak topics from profile)")
    num_questions: int = Field(default=5, ge=1, le=10, description="Number of questions to generate")
    mode: str = Field(default="quiz", description="'quiz' or 'flashcard'")


class QuizGenerateResponse(BaseModel):
    quiz_id: str
    title: str
    topic: str
    difficulty: str
    questions: list[QuizQuestionItem]
    created_at: datetime


class QuizSubmitRequest(BaseModel):
    quiz_id: str = Field(min_length=1)
    student_id: str = Field(min_length=1)
    user_answers: dict[str, str] = Field(description="Mapping of question ID to selected option e.g. {'1': 'A'}")


class QuizSubmitResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score_percentage: float
    correct_count: int
    total_count: int
    question_feedback: dict[str, dict] = Field(description="Feedback per question")
    updated_mastery: float
    recommended_next_steps: list[str]


# ── Agent #5: RAG Course Knowledge Agent Schemas ──────────────────
class SourceCitationItem(BaseModel):
    material_title: str = Field(description="Title of the source document or slide deck")
    chapter: str = Field(default="General", description="Chapter or section reference")
    page_number: int = Field(default=1, description="Page number of cited quote")
    snippet: str = Field(description="Exact snippet or passage from the course material")


class RAGQueryRequest(BaseModel):
    course_id: str = Field(min_length=1, description="Course ID e.g. biol_101")
    query: str = Field(min_length=1, description="Student academic query")
    top_k: int = Field(default=3, ge=1, le=10, description="Number of context passages to retrieve")


class RAGQueryResponse(BaseModel):
    answer: str = Field(description="Grounded response synthesized from course materials")
    cited_sources: list[SourceCitationItem] = Field(default_factory=list, description="Explicit document & page citations")
    confidence_score: float = Field(default=0.95, description="Confidence score between 0.0 and 1.0")
    topic: str = Field(default="Course Concept", description="Primary academic concept")


class RAGUploadRequest(BaseModel):
    course_id: str = Field(min_length=1)
    material_title: str = Field(min_length=1)
    type: str = Field(default="pdf", description="pdf, slides, notes, or syllabus")
    chapters_covered: str = Field(default="Chapter 1")
    pages_count: int = Field(default=10)
    content: str = Field(min_length=1, description="Raw text or extracted passage content")


class RAGUploadResponse(BaseModel):
    material_id: str
    course_id: str
    status: str
    chunks_indexed: int
    message: str


class RAGLearningActionRequest(BaseModel):
    course_id: str = Field(default="biol_101")
    material_title: str | None = Field(default=None, description="Optional target document title")
    action: str = Field(default="mcqs", description="'mcqs', 'summary', or 'explain_simply'")


# ── Agent #7: AI Exam Generator Agent Schemas ─────────────────────
class ExamQuestionItem(BaseModel):
    id: str
    type: str = Field(description="mcq, short, long, numerical, or conceptual")
    question: str
    difficulty: str = Field(default="medium")
    options: dict[str, str] | None = Field(default=None)
    correct_option: str | None = Field(default=None)
    model_solution: str | None = Field(default=None)
    max_marks: int = Field(default=20)


class ExamGenerateRequest(BaseModel):
    student_id: str = Field(default="demo_student")
    topic: str | None = Field(default=None)
    difficulty: str = Field(default="medium", description="easy, medium, or advanced")
    num_questions: int = Field(default=5, ge=1, le=10)
    course_id: str = Field(default="biol_101")


class ExamGenerateResponse(BaseModel):
    exam_id: str
    title: str
    topic: str
    difficulty: str
    total_marks: int
    questions: list[ExamQuestionItem]
    created_at: datetime


class ExamEvaluateRequest(BaseModel):
    exam_id: str = Field(min_length=1)
    student_id: str = Field(min_length=1)
    user_answers: dict[str, str] = Field(description="Map of question ID to student answer")


class ExamEvaluateResponse(BaseModel):
    attempt_id: str
    exam_id: str
    score_percentage: float
    earned_marks: float
    total_marks: float
    updated_mastery: float
    question_feedback: dict[str, dict]
    planner_recommendation: str


# ── Agent #8: AI Assignment Feedback Agent Schemas ────────────────
class AssignmentFeedbackRequest(BaseModel):
    student_id: str = Field(default="demo_student")
    assignment_title: str = Field(min_length=1, description="Title or prompt of assignment")
    submission_text: str = Field(min_length=1, description="Code, math solution, or written answer")
    submission_type: str = Field(default="code", description="code, math, essay, or general")
    subject: str = Field(default="Computer Science / Mathematics")


class AssignmentFeedbackResponse(BaseModel):
    assignment_title: str
    subject: str
    overall_score: float
    letter_grade: str
    error_identification: list[str]
    explanation_of_mistakes: str
    suggestions_for_improvement: list[str]
    learning_resources: list[str]
    refactored_solution_snippet: str
    planner_recommendation: str


# ── Agent #9: AI Learning Coach Agent Schemas ─────────────────────
class LearningCoachRequest(BaseModel):
    student_id: str = Field(default="demo_student")
    timeframe: str = Field(default="weekly", description="weekly, monthly, or term")


class LearningCoachResponse(BaseModel):
    coach_title: str
    consistency_score: float
    missed_sessions_count: int
    performance_recommendations: list[str]
    problem_detection: list[str]
    strategic_improvements: list[str]
    planner_rebalance_action: dict
    socratic_tutor_prompts: list[str]


# ── Agent #6: Teacher Assistant Agent Schemas ─────────────────────
class TeacherLessonPlanRequest(BaseModel):
    course_id: str = Field(default="biol_101", description="Course ID")
    topic: str = Field(min_length=1, description="Topic for the lesson plan e.g. Photosynthesis")
    target_grade: str = Field(default="High School / Intro College", description="Grade level")
    duration_minutes: int = Field(default=60, ge=15, le=180)


class LessonTimelineBlock(BaseModel):
    section: str
    minutes: int
    activities: str


class TeacherLessonPlanResponse(BaseModel):
    lesson_title: str
    topic: str
    learning_objectives: list[str]
    timeline: list[LessonTimelineBlock]
    discussion_prompts: list[str]
    differentiation: dict[str, str]


class TeacherGradeRequest(BaseModel):
    assignment_title: str = Field(min_length=1)
    rubric: str = Field(default="Score based on accuracy, clarity, and conceptual depth.")
    submission_text: str = Field(min_length=1)


class TeacherGradeResponse(BaseModel):
    score: float
    letter_grade: str
    strengths: list[str]
    areas_for_improvement: list[str]
    constructive_feedback: str
    suggested_remediation: list[str]


# ── Agent #0: AI Orchestrator Agent Schemas ───────────────────────
class OrchestrationRequest(BaseModel):
    student_id: str = Field(default="demo_student", description="Student ID")
    query: str = Field(min_length=1, description="Student request prompt")
    course_id: str = Field(default="biol_101", description="Active course ID")
    session_id: str | None = Field(default=None, description="Active session ID")


class OrchestrationResponse(BaseModel):
    orchestrator_decision: dict = Field(description="Intent classification & reasoning")
    response: str = Field(description="Primary response text")
    delegated_agents: list[str] = Field(default_factory=list, description="List of specialized agents invoked")
    session_id: str | None = Field(default=None, description="Optional active session ID")






