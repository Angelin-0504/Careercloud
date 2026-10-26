from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.core.dependencies import get_current_user, require_role, get_current_student
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job
from backend.app.models.application import Application, SavedJob
from backend.app.models.resume import Resume
from backend.app.schemas.student import StudentProfileResponse, StudentProfileUpdate, ResumeResponse
from backend.app.schemas.analytics import StudentDashboardStats
from backend.app.services.matching_service import matching_service
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/students", tags=["Student Management"])

def calculate_completion_percentage(profile: StudentProfile) -> int:
    """Calculate profile completion percentage based on filled fields."""
    points = 0
    total_points = 7
    if profile.department: points += 1
    if profile.degree: points += 1
    if profile.graduation_year: points += 1
    if profile.cgpa and profile.cgpa > 0: points += 1
    if profile.skills and len(profile.skills.strip()) > 0: points += 1
    if profile.projects or profile.certifications: points += 1
    if profile.resumes and len(profile.resumes) > 0: points += 1
    return int((points / total_points) * 100)

@router.get("/me", response_model=StudentProfileResponse)
def get_my_profile(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    student.profile_completed_percentage = calculate_completion_percentage(student)
    db.commit()

    resumes_list = [
        ResumeResponse(
            id=r.id,
            file_name=r.file_name,
            file_size_bytes=r.file_size_bytes,
            content_type=r.content_type,
            uploaded_at=r.uploaded_at,
            download_url=f"/api/v1/resumes/{r.id}/download"
        )
        for r in student.resumes
    ]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        phone=student.phone,
        department=student.department,
        degree=student.degree,
        graduation_year=student.graduation_year,
        cgpa=student.cgpa,
        skills=student.skills,
        certifications=student.certifications,
        projects=student.projects,
        experience=student.experience,
        bio=student.bio,
        profile_completed_percentage=student.profile_completed_percentage,
        updated_at=student.updated_at,
        resumes=resumes_list,
        full_name=student.user.full_name,
        email=student.user.email
    )

@router.put("/me", response_model=StudentProfileResponse)
def update_my_profile(
    profile_in: StudentProfileUpdate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    student.profile_completed_percentage = calculate_completion_percentage(student)
    student.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(student)

    audit_service.log_action(
        db=db,
        user_id=student.user_id,
        action="PROFILE_UPDATED",
        resource_type="StudentProfile",
        resource_id=str(student.id),
        details=f"Updated profile for student {student.user.email}"
    )

    resumes_list = [
        ResumeResponse(
            id=r.id,
            file_name=r.file_name,
            file_size_bytes=r.file_size_bytes,
            content_type=r.content_type,
            uploaded_at=r.uploaded_at,
            download_url=f"/api/v1/resumes/{r.id}/download"
        )
        for r in student.resumes
    ]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        phone=student.phone,
        department=student.department,
        degree=student.degree,
        graduation_year=student.graduation_year,
        cgpa=student.cgpa,
        skills=student.skills,
        certifications=student.certifications,
        projects=student.projects,
        experience=student.experience,
        bio=student.bio,
        profile_completed_percentage=student.profile_completed_percentage,
        updated_at=student.updated_at,
        resumes=resumes_list,
        full_name=student.user.full_name,
        email=student.user.email
    )

@router.get("/dashboard", response_model=StudentDashboardStats)
def get_student_dashboard(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Application counts
    apps = db.query(Application).filter(Application.student_id == student.id).all()
    total_applied = len(apps)
    shortlisted = sum(1 for a in apps if a.status == "Shortlisted")
    interviews = sum(1 for a in apps if a.status == "Interview Scheduled")
    selected = sum(1 for a in apps if a.status == "Selected")

    saved_count = db.query(SavedJob).filter(SavedJob.student_id == student.id).count()

    # Recommended jobs count (active jobs where match_score >= 40)
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    recommended_count = 0
    for job in active_jobs:
        match_result = matching_service.calculate_match(student, job)
        if match_result["match_score"] >= 40.0:
            recommended_count += 1

    return StudentDashboardStats(
        profile_completion=student.profile_completed_percentage,
        total_applied=total_applied,
        shortlisted=shortlisted,
        interviews=interviews,
        selected=selected,
        saved_jobs_count=saved_count,
        recommended_jobs_count=recommended_count
    )
