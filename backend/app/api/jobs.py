from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.core.dependencies import (
    get_current_user,
    get_optional_current_user,
    require_role,
    get_current_recruiter,
    get_current_student
)
from backend.app.models.user import User
from backend.app.models.company import Company, RecruiterProfile
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job
from backend.app.models.application import Application, SavedJob
from backend.app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    RecommendedJobResponse,
    MatchScoreDetails
)
from backend.app.schemas.company import CompanyResponse
from backend.app.services.matching_service import matching_service
from backend.app.services.audit_service import audit_service
from backend.app.services.notification_service import notification_service

router = APIRouter(prefix="/jobs", tags=["Jobs Management"])

def _format_job_response(job: Job, current_user: Optional[User], db: Session) -> JobResponse:
    company_data = None
    if job.company:
        company_data = CompanyResponse(
            id=job.company.id,
            name=job.company.name,
            logo_url=job.company.logo_url,
            description=job.company.description,
            industry=job.company.industry,
            website=job.company.website,
            location=job.company.location,
            is_verified=job.company.is_verified,
            created_at=job.company.created_at,
            active_jobs_count=0
        )

    applicants_count = len(job.applications)
    has_applied = False
    is_saved = False

    if current_user and current_user.role == "student" and current_user.student_profile:
        student_id = current_user.student_profile.id
        has_applied = any(a.student_id == student_id for a in job.applications)
        is_saved = any(s.student_id == student_id for s in job.saved_jobs)

    return JobResponse(
        id=job.id,
        company_id=job.company_id,
        posted_by_user_id=job.posted_by_user_id,
        title=job.title,
        description=job.description,
        job_type=job.job_type,
        location=job.location,
        salary_range=job.salary_range,
        min_cgpa=job.min_cgpa,
        eligible_departments=job.eligible_departments,
        eligible_graduation_years=job.eligible_graduation_years,
        required_skills=job.required_skills,
        application_deadline=job.application_deadline,
        status=job.status,
        created_at=job.created_at,
        updated_at=job.updated_at,
        company=company_data,
        applicants_count=applicants_count,
        has_applied=has_applied,
        is_saved=is_saved
    )

@router.get("", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = Query(None, description="Search keyword in title, skills, description"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    department: Optional[str] = Query(None, description="Filter by eligible department"),
    min_cgpa: Optional[float] = Query(None, description="Filter by maximum required CGPA"),
    status_filter: str = Query("active", alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if status_filter and status_filter != "all":
        query = query.filter(Job.status == status_filter)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.join(Job.company).filter(
            or_(
                Job.title.ilike(s),
                Job.description.ilike(s),
                Job.required_skills.ilike(s),
                Job.location.ilike(s),
                Company.name.ilike(s)
            )
        )

    if job_type:
        query = query.filter(Job.job_type.ilike(f"%{job_type.strip()}%"))

    if location:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if department:
        query = query.filter(Job.eligible_departments.ilike(f"%{department.strip()}%"))

    if min_cgpa is not None:
        query = query.filter(Job.min_cgpa <= min_cgpa)

    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    return [_format_job_response(j, current_user, db) for j in jobs]

@router.get("/recommendations", response_model=List[RecommendedJobResponse])
def get_job_recommendations(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """
    Get explainable job recommendations calculated using rule-based matching:
    Skills (50%), Dept (20%), CGPA (15%), Grad year (15%).
    Enforces hard constraints for CGPA and graduation year eligibility.
    """
    active_jobs = db.query(Job).filter(Job.status == "active").all()
    recommendations = []

    for job in active_jobs:
        match_result = matching_service.calculate_match(student, job)
        base_resp = _format_job_response(job, student.user, db)

        match_details = MatchScoreDetails(
            match_score=match_result["match_score"],
            is_eligible=match_result["is_eligible"],
            matched_skills=match_result["matched_skills"],
            missing_skills=match_result["missing_skills"],
            ineligibility_reasons=match_result["ineligibility_reasons"],
            skills_score=match_result["skills_score"],
            dept_score=match_result["dept_score"],
            cgpa_score=match_result["cgpa_score"],
            grad_score=match_result["grad_score"],
            explanation=match_result["explanation"]
        )

        rec = RecommendedJobResponse(
            **base_resp.model_dump(),
            match_details=match_details
        )
        recommendations.append(rec)

    # Sort eligible recommendations first by highest score, then ineligible recommendations
    recommendations.sort(
        key=lambda r: (r.match_details.is_eligible, r.match_details.match_score),
        reverse=True
    )

    return recommendations

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    return _format_job_response(job, current_user, db)

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if not recruiter.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter must be linked to a registered company before posting jobs.",
        )

    new_job = Job(
        company_id=recruiter.company_id,
        posted_by_user_id=recruiter.user_id,
        title=job_in.title.strip(),
        description=job_in.description.strip(),
        job_type=job_in.job_type,
        location=job_in.location.strip(),
        salary_range=job_in.salary_range.strip() if job_in.salary_range else None,
        min_cgpa=job_in.min_cgpa,
        eligible_departments=job_in.eligible_departments.strip(),
        eligible_graduation_years=job_in.eligible_graduation_years.strip(),
        required_skills=job_in.required_skills.strip(),
        application_deadline=job_in.application_deadline,
        status="active"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    audit_service.log_action(
        db=db,
        user_id=recruiter.user_id,
        action="JOB_POSTED",
        resource_type="Job",
        resource_id=str(new_job.id),
        details=f"Posted job '{new_job.title}' for company ID {recruiter.company_id}"
    )

    return _format_job_response(new_job, recruiter.user, db)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Authorization: only recruiter who posted it or admin
    if current_user.role != "admin":
        if current_user.role != "recruiter" or not current_user.recruiter_profile or current_user.recruiter_profile.company_id != job.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this job posting.",
            )

    update_data = job_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(job, field, val)

    job.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)

    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="JOB_UPDATED",
        resource_type="Job",
        resource_id=str(job.id),
        details=f"Job {job.id} updated by {current_user.email}"
    )

    return _format_job_response(job, current_user, db)

@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def delete_or_close_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if current_user.role != "admin":
        if current_user.role != "recruiter" or not current_user.recruiter_profile or current_user.recruiter_profile.company_id != job.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this job posting.",
            )

    # If job has applications, mark closed instead of hard delete to preserve student audit records
    if len(job.applications) > 0:
        job.status = "closed"
        db.commit()
        return {"message": "Job marked as closed because it has active student applications."}
    else:
        db.delete(job)
        db.commit()
        return {"message": "Job deleted successfully."}
