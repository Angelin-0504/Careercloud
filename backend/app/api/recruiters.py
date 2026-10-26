from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.core.dependencies import get_current_recruiter
from backend.app.models.user import User
from backend.app.models.company import Company, RecruiterProfile
from backend.app.models.job import Job
from backend.app.models.application import Application
from backend.app.schemas.company import RecruiterProfileResponse, CompanyResponse, CompanyUpdate
from backend.app.schemas.analytics import RecruiterDashboardStats
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/recruiters", tags=["Recruiter Management"])

@router.get("/me", response_model=RecruiterProfileResponse)
def get_recruiter_profile(
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    company_data = None
    if recruiter.company:
        active_count = db.query(Job).filter(Job.company_id == recruiter.company.id, Job.status == "active").count()
        company_data = CompanyResponse(
            id=recruiter.company.id,
            name=recruiter.company.name,
            logo_url=recruiter.company.logo_url,
            description=recruiter.company.description,
            industry=recruiter.company.industry,
            website=recruiter.company.website,
            location=recruiter.company.location,
            is_verified=recruiter.company.is_verified,
            created_at=recruiter.company.created_at,
            active_jobs_count=active_count
        )

    return RecruiterProfileResponse(
        id=recruiter.id,
        user_id=recruiter.user_id,
        company_id=recruiter.company_id,
        designation=recruiter.designation,
        phone=recruiter.phone,
        company=company_data
    )

@router.put("/company", response_model=CompanyResponse)
def update_company(
    comp_in: CompanyUpdate,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if not recruiter.company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No company profile associated with this recruiter.",
        )

    company = recruiter.company
    update_data = comp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    audit_service.log_action(
        db=db,
        user_id=recruiter.user_id,
        action="COMPANY_UPDATED",
        resource_type="Company",
        resource_id=str(company.id),
        details=f"Company '{company.name}' updated by recruiter."
    )

    active_count = db.query(Job).filter(Job.company_id == company.id, Job.status == "active").count()
    return CompanyResponse(
        id=company.id,
        name=company.name,
        logo_url=company.logo_url,
        description=company.description,
        industry=company.industry,
        website=company.website,
        location=company.location,
        is_verified=company.is_verified,
        created_at=company.created_at,
        active_jobs_count=active_count
    )

@router.get("/dashboard", response_model=RecruiterDashboardStats)
def get_recruiter_dashboard(
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if not recruiter.company_id:
        return RecruiterDashboardStats(
            total_jobs_posted=0,
            active_jobs=0,
            total_applicants=0,
            shortlisted_count=0,
            selected_count=0,
            recent_applications=[]
        )

    # All jobs posted by this company
    jobs = db.query(Job).filter(Job.company_id == recruiter.company_id).all()
    job_ids = [j.id for j in jobs]
    total_jobs = len(jobs)
    active_jobs = sum(1 for j in jobs if j.status == "active")

    # Applications
    applications = (
        db.query(Application)
        .filter(Application.job_id.in_(job_ids))
        .order_by(Application.applied_at.desc())
        .all()
        if job_ids else []
    )

    total_applicants = len(applications)
    shortlisted_count = sum(1 for a in applications if a.status == "Shortlisted")
    selected_count = sum(1 for a in applications if a.status == "Selected")

    recent_apps = []
    for app in applications[:8]:
        student_user = app.student.user if app.student else None
        recent_apps.append({
            "id": app.id,
            "job_title": app.job.title if app.job else "Unknown",
            "student_name": student_user.full_name if student_user else "Anonymous",
            "department": app.student.department if app.student else "N/A",
            "cgpa": app.student.cgpa if app.student else 0.0,
            "status": app.status,
            "applied_at": app.applied_at.isoformat()
        })

    return RecruiterDashboardStats(
        total_jobs_posted=total_jobs,
        active_jobs=active_jobs,
        total_applicants=total_applicants,
        shortlisted_count=shortlisted_count,
        selected_count=selected_count,
        recent_applications=recent_apps
    )
