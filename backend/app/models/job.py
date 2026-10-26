from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    posted_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    job_type = Column(String(50), nullable=False, default="Full-time")  # Full-time, Internship, Contract
    location = Column(String(255), nullable=False)  # Bangalore / Remote
    salary_range = Column(String(100), nullable=True)  # e.g., "₹8,00,000 - ₹12,00,000 / year"
    min_cgpa = Column(Float, nullable=False, default=0.0)
    eligible_departments = Column(Text, nullable=False, default="")  # comma-separated e.g., "Computer Science & Engineering,Information Technology"
    eligible_graduation_years = Column(Text, nullable=False, default="")  # comma-separated e.g., "2026,2025"
    required_skills = Column(Text, nullable=False, default="")  # comma-separated e.g., "Python,AWS,FastAPI"
    application_deadline = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False, default="active")  # active, closed, draft, flagged
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    posted_by = relationship("User", foreign_keys=[posted_by_user_id])
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="job", cascade="all, delete-orphan")
