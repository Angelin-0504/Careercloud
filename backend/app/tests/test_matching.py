from backend.app.services.matching_service import matching_service
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job

def test_matching_perfect_candidate():
    student = StudentProfile(
        department="Computer Science & Engineering",
        graduation_year=2026,
        cgpa=9.0,
        skills="Python, AWS, Docker"
    )
    job = Job(
        title="Cloud Engineer",
        description="AWS DevOps",
        min_cgpa=7.5,
        eligible_departments="Computer Science & Engineering",
        eligible_graduation_years="2026",
        required_skills="Python, AWS, Docker"
    )

    result = matching_service.calculate_match(student, job)
    assert result["is_eligible"] is True
    assert result["match_score"] == 100.0
    assert result["skills_score"] == 50.0
    assert result["dept_score"] == 20.0
    assert result["cgpa_score"] == 15.0
    assert result["grad_score"] == 15.0
    assert len(result["missing_skills"]) == 0
    assert len(result["matched_skills"]) == 3

def test_matching_ineligible_due_to_cgpa():
    student = StudentProfile(
        department="Computer Science & Engineering",
        graduation_year=2026,
        cgpa=6.8,  # Below min 7.5
        skills="Python, AWS, Docker"
    )
    job = Job(
        title="Cloud Engineer",
        description="AWS DevOps",
        min_cgpa=7.5,
        eligible_departments="Computer Science & Engineering",
        eligible_graduation_years="2026",
        required_skills="Python, AWS, Docker"
    )

    result = matching_service.calculate_match(student, job)
    assert result["is_eligible"] is False
    assert any("CGPA" in reason for reason in result["ineligibility_reasons"])
    assert result["cgpa_score"] == 0.0

def test_matching_ineligible_due_to_graduation_year():
    student = StudentProfile(
        department="Computer Science & Engineering",
        graduation_year=2024,  # Wrong batch
        cgpa=8.5,
        skills="Python, AWS"
    )
    job = Job(
        title="Cloud Engineer",
        description="AWS DevOps",
        min_cgpa=7.0,
        eligible_departments="Computer Science & Engineering",
        eligible_graduation_years="2026, 2025",
        required_skills="Python, AWS"
    )

    result = matching_service.calculate_match(student, job)
    assert result["is_eligible"] is False
    assert any("Graduation year" in reason for reason in result["ineligibility_reasons"])
    assert result["grad_score"] == 0.0

def test_matching_partial_skills():
    student = StudentProfile(
        department="Computer Science & Engineering",
        graduation_year=2026,
        cgpa=8.0,
        skills="Python, React"  # Has Python, missing AWS & Docker
    )
    job = Job(
        title="Cloud Engineer",
        description="AWS DevOps",
        min_cgpa=7.0,
        eligible_departments="Computer Science & Engineering",
        eligible_graduation_years="2026",
        required_skills="Python, AWS, Docker"
    )

    result = matching_service.calculate_match(student, job)
    assert result["is_eligible"] is True
    assert "Python" in result["matched_skills"]
    assert "AWS" in result["missing_skills"]
    # 1 of 3 skills matched = 1/3 * 50 = ~16.7
    assert result["skills_score"] == 16.7
    # Dept (20) + CGPA (15) + Grad (15) = 50 + 16.7 = 66.7
    assert result["match_score"] == 66.7

def test_recommendations_endpoint(client, test_student, test_job):
    headers = {"Authorization": f"Bearer {test_student['token']}"}
    response = client.get("/api/v1/jobs/recommendations", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    rec = data[0]
    assert "match_details" in rec
    assert rec["match_details"]["is_eligible"] is True
    assert rec["match_details"]["match_score"] >= 90.0

def test_matching_skill_aliases():
    """Verify that Python, Java, SQL, React match jobs requesting PostgreSQL, React.js, Python 3, Spring Boot."""
    student = StudentProfile(
        department="Computer Science & Engineering",
        graduation_year=2026,
        cgpa=8.5,
        skills="python, java, sql, react"
    )
    job = Job(
        title="Full-Stack Cloud Developer",
        description="Modern web application role",
        min_cgpa=7.0,
        eligible_departments="Computer Science & Engineering, Information Technology",
        eligible_graduation_years="2024, 2025, 2026, 2027, 2028",
        required_skills="React.js, PostgreSQL, Python 3, Java"
    )

    result = matching_service.calculate_match(student, job)
    assert result["is_eligible"] is True
    assert len(result["matched_skills"]) == 4  # All 4 skills match via alias/normalization!
    assert result["skills_score"] == 50.0
    assert result["match_score"] == 100.0

