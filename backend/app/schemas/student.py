from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    file_name: str
    file_size_bytes: int
    content_type: str
    uploaded_at: datetime
    download_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StudentProfileBase(BaseModel):
    phone: Optional[str] = None
    department: str = Field(..., description="e.g. Computer Science & Engineering")
    degree: str = Field(default="B.Tech")
    graduation_year: int = Field(..., ge=2000, le=2035)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    skills: str = Field(default="", description="Comma-separated skills, e.g. 'Python, AWS, React'")
    certifications: Optional[str] = None
    projects: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    phone: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    projects: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    profile_completed_percentage: int
    updated_at: datetime
    resumes: List[ResumeResponse] = []
    full_name: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
