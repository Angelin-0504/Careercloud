from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_key = Column(String(255), unique=True, index=True, nullable=False)
    storage_type = Column(String(20), nullable=False, default="local")  # "local" or "s3"
    file_size_bytes = Column(Integer, nullable=False)
    content_type = Column(String(50), nullable=False, default="application/pdf")
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("StudentProfile", back_populates="resumes")
