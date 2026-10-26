# CareerCloud — REST API Reference Guide

The backend REST API follows OpenAPI 3.1 specifications. When the backend is running locally, access interactive Swagger UI documentation at:
* **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

All endpoints are prefixed with `/api/v1`.

---

## 1. Authentication Header

Protected endpoints require the `Authorization` header containing a valid signed JWT bearer token:

```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 2. API Endpoints Catalog

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Register new student or recruiter account | Public |
| `POST` | `/auth/login` | Authenticate user credentials and issue JWT token | Public |
| `GET` | `/auth/me` | Retrieve profile metadata of authenticated user | Bearer Token |

#### Sample Login Request:
```json
POST /api/v1/auth/login
{
  "email": "alex.student@university.edu",
  "password": "Password@123"
}
```

#### Sample Login Response (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 4,
    "email": "alex.student@university.edu",
    "full_name": "Alex Morgan",
    "role": "student",
    "is_active": true,
    "is_approved": true,
    "student_id": 1,
    "company_id": null
  }
}
```

---

### Student Services (`/api/v1/students`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/students/me` | Get student academic profile, skills, and resumes | `student` |
| `PUT` | `/students/me` | Update student profile and recalculate completion % | `student` |
| `GET` | `/students/dashboard` | Get student KPIs (applied, shortlisted, offers) | `student` |

---

### Job Openings & Matching Engine (`/api/v1/jobs`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/jobs` | Search & filter jobs (by skills, location, min CGPA) | Public / Optional |
| `GET` | `/jobs/recommendations` | Get explainable rule-based job recommendations | `student` |
| `GET` | `/jobs/{id}` | Retrieve comprehensive job opening details | Public / Optional |
| `POST` | `/jobs` | Publish new campus recruitment opening | `recruiter` |
| `PUT` | `/jobs/{id}` | Edit opening criteria or status | `recruiter` / `admin` |
| `DELETE` | `/jobs/{id}` | Delete or close job posting | `recruiter` / `admin` |

#### Sample Job Recommendation Object:
```json
{
  "id": 1,
  "title": "Associate Cloud Platform Engineer",
  "company_id": 1,
  "job_type": "Full-time",
  "location": "Bangalore, Karnataka (Hybrid)",
  "salary_range": "₹9,50,000 - ₹12,50,000 / year",
  "min_cgpa": 7.5,
  "required_skills": "Python, AWS, Docker, Linux, FastAPI",
  "match_details": {
    "match_score": 95.0,
    "is_eligible": true,
    "matched_skills": ["Python", "AWS", "Docker", "FastAPI"],
    "missing_skills": ["Linux"],
    "ineligibility_reasons": [],
    "skills_score": 40.0,
    "dept_score": 20.0,
    "cgpa_score": 15.0,
    "grad_score": 15.0,
    "explanation": "You meet all mandatory eligibility criteria (CGPA & Graduation Batch). Skills matched: 4 of 5 (Python, AWS, Docker...)."
  }
}
```

---

### Application Lifecycle (`/api/v1/applications`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/applications` | Apply for job (checks duplicates & eligibility) | `student` |
| `GET` | `/applications/my` | View personal applications and status history | `student` |
| `GET` | `/applications/job/{job_id}` | View all applicants for recruiter's job | `recruiter` / `admin` |
| `PUT` | `/applications/{id}/status` | Update applicant stage (Shortlisted, Selected) | `recruiter` / `admin` |
| `POST` | `/applications/save-job/{job_id}` | Shortlist job bookmark | `student` |
| `DELETE` | `/applications/save-job/{job_id}` | Remove shortlisted bookmark | `student` |
| `GET` | `/applications/saved` | List student's saved bookmarks | `student` |

---

### Private Resume Vault (`/api/v1/resumes`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/resumes/upload` | Upload PDF resume (validates signature & size) | `student` |
| `GET` | `/resumes/{id}/download` | Authorized secure PDF download | Owner / Recruiter / Admin |
| `DELETE` | `/resumes/{id}` | Delete uploaded resume | `student` |

---

### Administration & Reporting (`/api/v1/admin`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/admin/dashboard` | Institutional metrics, placement rate, charts data | `admin` |
| `GET` | `/admin/students` | Search and filter campus student directory | `admin` |
| `GET` | `/admin/recruiters` | List recruiters and corporate hiring partners | `admin` |
| `PUT` | `/admin/companies/{id}/verify`| Approve or revoke company partner verification | `admin` |
| `PUT` | `/admin/jobs/{id}/flag` | Moderate and flag/unflag inappropriate job | `admin` |
| `GET` | `/admin/audit-logs` | Immutable security audit trail | `admin` |
| `GET` | `/admin/export/placements-csv`| Download official placements CSV report | `admin` |
| `GET` | `/admin/export/students-csv` | Download complete students directory CSV | `admin` |
