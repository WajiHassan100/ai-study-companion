import json
from app.db.session import SessionLocal, engine
from app.models.models import Base, User, AppRole, StudentProfile, Course, Assignment, StudyPlan, Quiz

def seed_sample_data():
    print("[INFO] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Demo User
        print("[INFO] Seeding User & Student Profile...")
        user = db.query(User).filter_by(id="demo_student").first()
        if not user:
            user = User(
                id="demo_student",
                email="student@aistudy.com",
                full_name="Waji ul Hassan",
                hashed_password="mock_hashed_password",
                role=AppRole.student,
            )
            db.add(user)
            db.commit()

        # Seed Student Profile
        profile = db.query(StudentProfile).filter_by(student_id="demo_student").first()
        if not profile:
            profile = StudentProfile(
                student_id="demo_student",
                current_level="intermediate",
                learning_style="visual",
                weaknesses_json=json.dumps([
                    "Photosynthesis Light Reactions",
                    "Quadratic Factoring",
                    "Newton's Second Law Vector Equations"
                ]),
                topic_mastery_json=json.dumps({
                    "Photosynthesis": 62,
                    "Calculus Derivatives": 85,
                    "Newtonian Mechanics": 70,
                    "Cellular Respiration": 90
                })
            )
            db.add(profile)

        # 2. Seed Courses
        print("[INFO] Seeding Courses...")
        teacher = db.query(User).filter_by(id="demo_teacher").first()
        if not teacher:
            teacher = User(
                id="demo_teacher",
                email="teacher@aistudy.com",
                full_name="Dr. Elizabeth Vance",
                hashed_password="mock_hashed_password",
                role=AppRole.teacher,
            )
            db.add(teacher)
            db.commit()

        courses_data = [
            {
                "id": "biol_101",
                "title": "BIOL 101: General Cell Biology",
                "description": "Introduction to cellular structure, photosynthesis, respiration, and molecular genetics.",
                "teacher_id": "demo_teacher",
            },
            {
                "id": "math_201",
                "title": "MATH 201: Multivariable Calculus",
                "description": "Differential and integral calculus of functions of several variables, partial derivatives, and vector fields.",
                "teacher_id": "demo_teacher",
            },
            {
                "id": "phys_102",
                "title": "PHYS 102: University Physics II",
                "description": "Fundamentals of Newtonian mechanics, work-energy theorem, and electromagnetic fields.",
                "teacher_id": "demo_teacher",
            },
        ]

        for c_data in courses_data:
            c = db.query(Course).filter_by(id=c_data["id"]).first()
            if not c:
                c = Course(**c_data)
                db.add(c)

        # 3. Seed Assignments
        print("[INFO] Seeding Assignments...")
        assignments_data = [
            {
                "id": "assign_bio1",
                "course_id": "biol_101",
                "title": "Class Assignment #1: Photosynthesis & Light Reactions",
                "description": "Describe thylakoid membrane electron transport and explain ATP synthase rotor mechanics.",
                "max_score": 100.0,
            },
            {
                "id": "assign_math1",
                "course_id": "math_201",
                "title": "Problem Set #3: Partial Derivatives & Gradient Vectors",
                "description": "Solve problems 1-10 on directional derivatives and tangent plane equations.",
                "max_score": 50.0,
            },
        ]

        for a_data in assignments_data:
            a = db.query(Assignment).filter_by(id=a_data["id"]).first()
            if not a:
                a = Assignment(**a_data)
                db.add(a)

        db.commit()
        print("[SUCCESS] Sample data successfully seeded into 'school_assistant.db'!")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_data()
