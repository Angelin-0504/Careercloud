from backend.app.schemas.user import UserRegister, UserLogin, UserResponse, Token, TokenPayload
from backend.app.schemas.student import StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse, ResumeResponse
from backend.app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, RecruiterProfileResponse
from backend.app.schemas.job import JobCreate, JobUpdate, JobResponse, RecommendedJobResponse, MatchScoreDetails
from backend.app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse, SavedJobResponse
from backend.app.schemas.notification import NotificationResponse
from backend.app.schemas.analytics import AdminDashboardStats, RecruiterDashboardStats, StudentDashboardStats

__all__ = [
    "UserRegister", "UserLogin", "UserResponse", "Token", "TokenPayload",
    "StudentProfileCreate", "StudentProfileUpdate", "StudentProfileResponse", "ResumeResponse",
    "CompanyCreate", "CompanyUpdate", "CompanyResponse", "RecruiterProfileResponse",
    "JobCreate", "JobUpdate", "JobResponse", "RecommendedJobResponse", "MatchScoreDetails",
    "ApplicationCreate", "ApplicationStatusUpdate", "ApplicationResponse", "SavedJobResponse",
    "NotificationResponse",
    "AdminDashboardStats", "RecruiterDashboardStats", "StudentDashboardStats"
]
