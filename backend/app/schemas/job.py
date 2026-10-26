from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from backend.app.schemas.company import CompanyResponse

class JobBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    job_type: str = Field(default="Full-time")
    location: str = Field(..., min_length=2, max_length=255)
    salary_range: Optional[str] = None
    min_cgpa: float = Field(default=0.0, ge=0.0, le=10.0)
    eligible_departments: str = Field(default="", description="Comma-separated eligible departments")
    eligible_graduation_years: str = Field(default="", description="Comma-separated eligible graduation years")
    required_skills: str = Field(default="", description="Comma-separated required skills")
    application_deadline: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    min_cgpa: Optional[float] = None
    eligible_departments: Optional[str] = None
    eligible_graduation_years: Optional[str] = None
    required_skills: Optional[str] = None
    application_deadline: Optional[datetime] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    company_id: int
    posted_by_user_id: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    company: Optional[CompanyResponse] = None
    applicants_count: Optional[int] = 0
    has_applied: Optional[bool] = False
    is_saved: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class MatchScoreDetails(BaseModel):
    match_score: float
    is_eligible: bool
    matched_skills: List[str]
    missing_skills: List[str]
    ineligibility_reasons: List[str]
    skills_score: float
    dept_score: float
    cgpa_score: float
    grad_score: float
    explanation: str

class RecommendedJobResponse(JobResponse):
    match_details: MatchScoreDetails
