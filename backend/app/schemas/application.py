from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from backend.app.schemas.job import JobResponse
from backend.app.schemas.student import StudentProfileResponse

class ApplicationCreate(BaseModel):
    job_id: int
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="Applied, Shortlisted, Interview Scheduled, Selected, Rejected, Withdrawn")
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime
    updated_at: datetime
    notes: Optional[str] = None
    job: Optional[JobResponse] = None
    student: Optional[StudentProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

class SavedJobResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    created_at: datetime
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)
