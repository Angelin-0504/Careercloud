from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=False)  # e.g., "Computer Science & Engineering"
    degree = Column(String(100), nullable=False, default="B.Tech")  # e.g., "B.Tech", "M.Tech"
    graduation_year = Column(Integer, nullable=False)  # e.g., 2026
    cgpa = Column(Float, nullable=False, default=0.0)  # e.g., 8.5
    skills = Column(Text, nullable=False, default="")  # comma-separated string, e.g., "Python,AWS,React,Docker"
    certifications = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    profile_completed_percentage = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan", order_by="desc(Resume.uploaded_at)")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="student", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="student", cascade="all, delete-orphan")
