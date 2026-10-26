from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    industry: str = Field(..., min_length=2, max_length=100)
    website: Optional[str] = None
    location: str = Field(..., min_length=2, max_length=255)

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    is_verified: bool
    created_at: datetime
    active_jobs_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    company_id: Optional[int] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[CompanyResponse] = None

    model_config = ConfigDict(from_attributes=True)
