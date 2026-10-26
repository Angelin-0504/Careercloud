from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="Applied")  # Applied, Shortlisted, Interview Scheduled, Selected, Rejected, Withdrawn
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_student_job_application"),
    )

    # Relationships
    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_student_saved_job"),
    )

    # Relationships
    student = relationship("StudentProfile", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_jobs")

class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    package_lpa = Column(Float, nullable=True)  # in Lakhs Per Annum or USD
    placed_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    academic_year = Column(String(20), nullable=False, default="2025-2026")

    # Relationships
    student = relationship("StudentProfile", back_populates="placements")
    company = relationship("Company", back_populates="placements")
    job = relationship("Job", back_populates="placements")
