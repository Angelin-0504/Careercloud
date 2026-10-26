from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class DepartmentStat(BaseModel):
    department: str
    total_students: int
    placed_students: int
    placement_rate: float

class CompanyStat(BaseModel):
    company_name: str
    placements_count: int
    avg_package_lpa: Optional[float] = None

class MonthlyTrend(BaseModel):
    month: str
    applications: int
    selections: int

class RecentActivity(BaseModel):
    id: int
    action: str
    resource_type: str
    details: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

class AdminDashboardStats(BaseModel):
    total_students: int
    total_companies: int
    total_jobs: int
    total_applications: int
    total_placed: int
    placement_rate: float
    department_stats: List[DepartmentStat]
    company_stats: List[CompanyStat]
    monthly_trends: List[MonthlyTrend]
    recent_activities: List[RecentActivity]

class RecruiterDashboardStats(BaseModel):
    total_jobs_posted: int
    active_jobs: int
    total_applicants: int
    shortlisted_count: int
    selected_count: int
    recent_applications: List[Dict[str, Any]]

class StudentDashboardStats(BaseModel):
    profile_completion: int
    total_applied: int
    shortlisted: int
    interviews: int
    selected: int
    saved_jobs_count: int
    recommended_jobs_count: int
