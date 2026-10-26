import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.core.security import get_password_hash, create_access_token
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.models.company import Company, RecruiterProfile
from backend.app.models.job import Job
from backend.app.models.application import Application, Placement
from backend.app.models.resume import Resume

# In-memory SQLite with StaticPool so all threads/endpoints share the exact same DB
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_admin(db_session):
    admin = User(
        email="test_admin@careercloud.edu",
        hashed_password=get_password_hash("Password@123"),
        full_name="Admin Director",
        role="admin",
        is_active=True,
        is_approved=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    token = create_access_token({"sub": str(admin.id), "role": admin.role})
    return {"user": admin, "token": token}

@pytest.fixture
def test_company(db_session):
    company = Company(
        name="Test Cloud Corp",
        industry="Cloud Infrastructure",
        location="Bangalore",
        is_verified=True
    )
    db_session.add(company)
    db_session.commit()
    db_session.refresh(company)
    return company

@pytest.fixture
def test_recruiter(db_session, test_company):
    recruiter_user = User(
        email="test_recruiter@cloudcorp.com",
        hashed_password=get_password_hash("Password@123"),
        full_name="Recruiter Jane",
        role="recruiter",
        is_active=True,
        is_approved=True
    )
    db_session.add(recruiter_user)
    db_session.commit()
    db_session.refresh(recruiter_user)

    rec_profile = RecruiterProfile(
        user_id=recruiter_user.id,
        company_id=test_company.id,
        designation="Lead Recruiter"
    )
    db_session.add(rec_profile)
    db_session.commit()

    token = create_access_token({"sub": str(recruiter_user.id), "role": recruiter_user.role})
    return {"user": recruiter_user, "profile": rec_profile, "company": test_company, "token": token}

@pytest.fixture
def test_student(db_session):
    student_user = User(
        email="test_student@university.edu",
        hashed_password=get_password_hash("Password@123"),
        full_name="Student Bob",
        role="student",
        is_active=True,
        is_approved=True
    )
    db_session.add(student_user)
    db_session.commit()
    db_session.refresh(student_user)

    student_profile = StudentProfile(
        user_id=student_user.id,
        department="Computer Science & Engineering",
        degree="B.Tech",
        graduation_year=2026,
        cgpa=8.5,
        skills="Python, AWS, Docker, React, FastAPI",
        profile_completed_percentage=80
    )
    db_session.add(student_profile)
    db_session.commit()
    db_session.refresh(student_profile)

    # Add a mock resume
    resume = Resume(
        student_id=student_profile.id,
        file_name="Bob_Resume.pdf",
        storage_key="resumes/test-bob.pdf",
        storage_type="local",
        file_size_bytes=1024,
        content_type="application/pdf"
    )
    db_session.add(resume)
    db_session.commit()

    token = create_access_token({"sub": str(student_user.id), "role": student_user.role})
    return {"user": student_user, "profile": student_profile, "token": token}

@pytest.fixture
def test_job(db_session, test_company, test_recruiter):
    job = Job(
        company_id=test_company.id,
        posted_by_user_id=test_recruiter["user"].id,
        title="Associate Cloud Engineer",
        description="Build AWS cloud solutions and automation.",
        job_type="Full-time",
        location="Bangalore",
        salary_range="₹8,00,000 - ₹12,00,000",
        min_cgpa=7.5,
        eligible_departments="Computer Science & Engineering, Information Technology",
        eligible_graduation_years="2026",
        required_skills="Python, AWS, Docker",
        status="active"
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job
