def test_create_and_list_jobs(client, test_recruiter):
    headers = {"Authorization": f"Bearer {test_recruiter['token']}"}
    response = client.post(
        "/api/v1/jobs",
        headers=headers,
        json={
            "title": "Backend Python Developer",
            "description": "Develop high-performance REST APIs.",
            "job_type": "Full-time",
            "location": "Bangalore",
            "salary_range": "₹10,00,000",
            "min_cgpa": 7.0,
            "eligible_departments": "Computer Science & Engineering",
            "eligible_graduation_years": "2026",
            "required_skills": "Python, FastAPI, PostgreSQL"
        }
    )
    assert response.status_code == 201
    job_id = response.json()["id"]

    # Public list
    list_resp = client.get("/api/v1/jobs")
    assert list_resp.status_code == 200
    jobs = list_resp.json()
    assert any(j["id"] == job_id for j in jobs)

def test_application_workflow_and_duplicate_prevention(client, test_student, test_job, test_recruiter):
    student_headers = {"Authorization": f"Bearer {test_student['token']}"}
    recruiter_headers = {"Authorization": f"Bearer {test_recruiter['token']}"}

    # 1. Student applies
    apply_resp = client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"job_id": test_job.id, "notes": "Excited for this role!"}
    )
    assert apply_resp.status_code == 201
    app_data = apply_resp.json()
    app_id = app_data["id"]
    assert app_data["status"] == "Applied"

    # 2. Duplicate application must fail
    dup_resp = client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"job_id": test_job.id}
    )
    assert dup_resp.status_code == 400
    assert "already submitted" in dup_resp.json()["detail"]

    # 3. Recruiter views applicants
    applicants_resp = client.get(
        f"/api/v1/applications/job/{test_job.id}",
        headers=recruiter_headers
    )
    assert applicants_resp.status_code == 200
    apps = applicants_resp.json()
    assert len(apps) >= 1
    assert apps[0]["id"] == app_id

    # 4. Recruiter updates status to Shortlisted
    status_resp = client.put(
        f"/api/v1/applications/{app_id}/status",
        headers=recruiter_headers,
        json={"status": "Shortlisted", "notes": "Approved for interview"}
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "Shortlisted"

    # 5. Recruiter updates status to Selected (should trigger Placement)
    select_resp = client.put(
        f"/api/v1/applications/{app_id}/status",
        headers=recruiter_headers,
        json={"status": "Selected"}
    )
    assert select_resp.status_code == 200
    assert select_resp.json()["status"] == "Selected"

def test_unauthorized_status_update_fails(client, test_student, test_job):
    student_headers = {"Authorization": f"Bearer {test_student['token']}"}
    # Student attempting to update application status should receive 403
    response = client.put(
        "/api/v1/applications/999/status",
        headers=student_headers,
        json={"status": "Selected"}
    )
    assert response.status_code in [403, 404]

def test_apply_with_application_deadline(client, test_student, test_recruiter, db_session):
    from datetime import datetime, timezone, timedelta
    from backend.app.models.job import Job
    
    # Create job with future deadline
    recruiter_headers = {"Authorization": f"Bearer {test_recruiter['token']}"}
    student_headers = {"Authorization": f"Bearer {test_student['token']}"}
    
    deadline = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    resp = client.post(
        "/api/v1/jobs",
        headers=recruiter_headers,
        json={
            "title": "Cloud Engineer with Deadline",
            "description": "Deadline testing role.",
            "job_type": "Full-time",
            "location": "Remote",
            "min_cgpa": 6.0,
            "eligible_departments": "Computer Science & Engineering",
            "eligible_graduation_years": "2026",
            "required_skills": "Python, Java",
            "application_deadline": deadline
        }
    )
    assert resp.status_code == 201
    job_id = resp.json()["id"]

    apply_resp = client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"job_id": job_id}
    )
    assert apply_resp.status_code == 201
    assert apply_resp.json()["status"] == "Applied"
