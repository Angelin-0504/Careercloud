from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="Role: 'student' or 'recruiter'")
    company_name: Optional[str] = None
    company_industry: Optional[str] = None
    company_location: Optional[str] = None
    company_website: Optional[str] = None
    designation: Optional[str] = None
    # Student Profile Fields
    phone: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    is_approved: bool
    created_at: datetime
    company_id: Optional[int] = None
    student_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
