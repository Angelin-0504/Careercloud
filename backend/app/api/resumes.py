import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import Response, RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.core.dependencies import (
    get_current_user,
    get_current_student,
    require_role
)
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.models.resume import Resume
from backend.app.models.application import Application
from backend.app.models.job import Job
from backend.app.schemas.student import ResumeResponse
from backend.app.storage import get_storage
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/resumes", tags=["Resume Storage & Access"])

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF (.pdf) documents are accepted.",
        )

    # 2. Read content and validate size (max 5MB)
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds limit of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # 3. Validate PDF magic bytes (%PDF)
    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or invalid PDF content signature.",
        )

    # 4. Upload via Storage Service (Local or AWS S3)
    storage = get_storage()
    upload_res = storage.upload_file(
        content=content,
        original_filename=filename,
        content_type="application/pdf"
    )

    # 5. Persist metadata
    resume = Resume(
        student_id=student.id,
        file_name=filename,
        storage_key=upload_res["storage_key"],
        storage_type=upload_res["storage_type"],
        file_size_bytes=upload_res["file_size"],
        content_type="application/pdf"
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Update student profile completion
    student.profile_completed_percentage = min(100, student.profile_completed_percentage + 15)
    db.commit()

    # Log audit
    audit_service.log_action(
        db=db,
        user_id=student.user_id,
        action="RESUME_UPLOADED",
        resource_type="Resume",
        resource_id=str(resume.id),
        details=f"Uploaded resume '{filename}' ({len(content)} bytes)"
    )

    return ResumeResponse(
        id=resume.id,
        file_name=resume.file_name,
        file_size_bytes=resume.file_size_bytes,
        content_type=resume.content_type,
        uploaded_at=resume.uploaded_at,
        download_url=f"/api/v1/resumes/{resume.id}/download"
    )

@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume record not found")

    student = resume.student
    is_authorized = False

    # Authorization Check:
    # 1. Admin/Placement Officer has access
    if current_user.role == "admin":
        is_authorized = True
    # 2. Student owner has access
    elif current_user.role == "student" and current_user.student_profile and current_user.student_profile.id == student.id:
        is_authorized = True
    # 3. Recruiter has access ONLY IF student has applied to at least one job from this recruiter's company
    elif current_user.role == "recruiter" and current_user.recruiter_profile and current_user.recruiter_profile.company_id:
        company_id = current_user.recruiter_profile.company_id
        applied_to_recruiter_job = (
            db.query(Application)
            .join(Job, Application.job_id == Job.id)
            .filter(
                Application.student_id == student.id,
                Job.company_id == company_id
            )
            .first()
        )
        if applied_to_recruiter_job:
            is_authorized = True

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not authorized to view or download this private candidate resume.",
        )

    storage = get_storage()

    # If S3 presigned URL is available, redirect
    download_url = storage.get_download_url(resume.storage_key)
    if download_url:
        return RedirectResponse(url=download_url)

    # Otherwise stream bytes directly
    try:
        content, content_type = storage.get_file(resume.storage_key)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file content not found on server")

    safe_filename = resume.file_name.replace('"', '').replace('\n', '').replace('\r', '')
    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f'inline; filename="{safe_filename}"',
            "Cache-Control": "private, max-age=300"
        }
    )

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.student_id == student.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found or unauthorized")

    storage = get_storage()
    storage.delete_file(resume.storage_key)

    db.delete(resume)
    db.commit()

    audit_service.log_action(
        db=db,
        user_id=student.user_id,
        action="RESUME_DELETED",
        resource_type="Resume",
        resource_id=str(resume_id),
        details=f"Student deleted resume {resume.file_name}"
    )

    return {"message": "Resume deleted successfully"}
