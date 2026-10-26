import io
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.core.security import get_password_hash, create_access_token

def test_resume_upload_non_pdf_fails(client, test_student):
    headers = {"Authorization": f"Bearer {test_student['token']}"}
    fake_txt = io.BytesIO(b"This is a text resume file")
    response = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files={"file": ("resume.txt", fake_txt, "text/plain")}
    )
    assert response.status_code == 400
    assert "Only PDF" in response.json()["detail"]

def test_resume_upload_valid_pdf_succeeds(client, test_student):
    headers = {"Authorization": f"Bearer {test_student['token']}"}
    fake_pdf = io.BytesIO(b"%PDF-1.4 mock pdf binary header content for testing")
    response = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files={"file": ("valid_resume.pdf", fake_pdf, "application/pdf")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["file_name"] == "valid_resume.pdf"
    assert data["content_type"] == "application/pdf"

def test_resume_download_authorization(client, test_student, test_recruiter, test_job, db_session):
    student_headers = {"Authorization": f"Bearer {test_student['token']}"}
    fake_pdf = io.BytesIO(b"%PDF-1.4 authorized content bytes")
    upload_resp = client.post(
        "/api/v1/resumes/upload",
        headers=student_headers,
        files={"file": ("auth_resume.pdf", fake_pdf, "application/pdf")}
    )
    assert upload_resp.status_code == 201
    resume_id = upload_resp.json()["id"]

    # 1. Student owner can download
    owner_resp = client.get(f"/api/v1/resumes/{resume_id}/download", headers=student_headers)
    assert owner_resp.status_code == 200

    # 2. Another unrelated student attempts download -> 403 Forbidden
    other_user = User(
        email="stranger@university.edu",
        hashed_password=get_password_hash("Password@123"),
        full_name="Stranger Student",
        role="student",
        is_active=True,
        is_approved=True
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)
    other_prof = StudentProfile(
        user_id=other_user.id,
        department="IT",
        graduation_year=2026,
        cgpa=8.0
    )
    db_session.add(other_prof)
    db_session.commit()
    other_token = create_access_token({"sub": str(other_user.id), "role": other_user.role})

    forbidden_resp = client.get(
        f"/api/v1/resumes/{resume_id}/download",
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert forbidden_resp.status_code == 403
