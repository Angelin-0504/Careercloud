from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.core.dependencies import (
    get_current_user,
    get_current_student,
    get_current_recruiter,
    require_role
)
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job
from backend.app.models.application import Application, SavedJob, Placement
from backend.app.models.resume import Resume
from backend.app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    SavedJobResponse
)
from backend.app.services.matching_service import matching_service
from backend.app.services.audit_service import audit_service
from backend.app.services.notification_service import notification_service

router = APIRouter(prefix="/applications", tags=["Applications & Shortlisting"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_for_job(
    app_in: ApplicationCreate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This job posting is {job.status} and is no longer accepting applications.",
        )

    # Check deadline
    if job.application_deadline:
        deadline = job.application_deadline
        now = datetime.now(timezone.utc) if deadline.tzinfo is not None else datetime.now(timezone.utc).replace(tzinfo=None)
        if deadline < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The application deadline for this job has expired.",
            )

    # Check duplicate application
    existing_app = (
        db.query(Application)
        .filter(Application.student_id == student.id, Application.job_id == job.id)
        .first()
    )
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this job posting.",
        )

    # Verify student has uploaded at least one resume
    if not student.resumes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a PDF resume in your profile before applying for jobs.",
        )

    # Check match & eligibility
    match_result = matching_service.calculate_match(student, job)
    if not match_result["is_eligible"]:
        reasons = "; ".join(match_result["ineligibility_reasons"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You do not meet the mandatory criteria for this role: {reasons}",
        )

    # Create application
    application = Application(
        student_id=student.id,
        job_id=job.id,
        status="Applied",
        notes=app_in.notes
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Notify student
    notification_service.create_notification(
        db=db,
        user_id=student.user_id,
        title="Application Submitted",
        message=f"Your application for '{job.title}' at {job.company.name if job.company else 'the company'} was submitted successfully.",
        notif_type="application_status",
        link="/student/applications"
    )

    # Notify recruiter if posted_by user exists
    if job.posted_by_user_id:
        notification_service.create_notification(
            db=db,
            user_id=job.posted_by_user_id,
            title="New Job Applicant",
            message=f"{student.user.full_name} applied for '{job.title}'. Compatibility score: {match_result['match_score']}%.",
            notif_type="job_alert",
            link="/recruiter/applicants"
        )

    # Audit log
    audit_service.log_action(
        db=db,
        user_id=student.user_id,
        action="APPLICATION_SUBMITTED",
        resource_type="Application",
        resource_id=str(application.id),
        details=f"Student applied for job '{job.title}' (ID {job.id})"
    )

    return application

@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    apps = (
        db.query(Application)
        .filter(Application.student_id == student.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return apps

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
def get_job_applicants(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    # Authorization check
    if current_user.role != "admin":
        if (
            current_user.role != "recruiter"
            or not current_user.recruiter_profile
            or current_user.recruiter_profile.company_id != job.company_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view applicants for jobs posted by your company.",
            )

    apps = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return apps

@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_in: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Authorization
    if current_user.role != "admin":
        if (
            current_user.role != "recruiter"
            or not current_user.recruiter_profile
            or current_user.recruiter_profile.company_id != application.job.company_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage this application.",
            )

    old_status = application.status
    new_status = status_in.status.strip()
    valid_statuses = ["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "Withdrawn"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed: {valid_statuses}",
        )

    application.status = new_status
    if status_in.notes:
        application.notes = status_in.notes
    application.updated_at = datetime.now(timezone.utc)

    # If selected, create Placement record if not exists
    if new_status == "Selected":
        existing_placement = (
            db.query(Placement)
            .filter(
                Placement.student_id == application.student_id,
                Placement.job_id == application.job_id
            )
            .first()
        )
        if not existing_placement:
            # Parse package if available from salary_range or default
            package = 8.5
            placement = Placement(
                student_id=application.student_id,
                company_id=application.job.company_id,
                job_id=application.job.id,
                package_lpa=package,
                academic_year="2025-2026"
            )
            db.add(placement)

    db.commit()
    db.refresh(application)

    # Notify student
    student_user_id = application.student.user_id
    notification_service.create_notification(
        db=db,
        user_id=student_user_id,
        title="Application Status Update",
        message=f"Your application status for '{application.job.title}' has been updated to '{new_status}'.",
        notif_type="application_status",
        link="/student/applications"
    )

    # Audit log
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="APPLICATION_STATUS_UPDATED",
        resource_type="Application",
        resource_id=str(application.id),
        details=f"Application {application.id} status changed from {old_status} to {new_status}"
    )

    return application

@router.post("/save-job/{job_id}", status_code=status.HTTP_201_CREATED)
def save_job(
    job_id: int,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing_saved = (
        db.query(SavedJob)
        .filter(SavedJob.student_id == student.id, SavedJob.job_id == job_id)
        .first()
    )
    if existing_saved:
        return {"message": "Job already saved in shortlist."}

    saved = SavedJob(student_id=student.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"message": "Job saved successfully to shortlist."}

@router.delete("/save-job/{job_id}", status_code=status.HTTP_200_OK)
def remove_saved_job(
    job_id: int,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    saved = (
        db.query(SavedJob)
        .filter(SavedJob.student_id == student.id, SavedJob.job_id == job_id)
        .first()
    )
    if saved:
        db.delete(saved)
        db.commit()
        return {"message": "Job removed from shortlist."}
    return {"message": "Job was not in shortlist."}

@router.get("/saved", response_model=List[SavedJobResponse])
def get_saved_jobs(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    return (
        db.query(SavedJob)
        .filter(SavedJob.student_id == student.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )
