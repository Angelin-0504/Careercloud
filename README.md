# CareerCloud — Cloud-Based Student Placement and Job Matching Portal

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![AWS](https://img.shields.io/badge/Cloud-AWS_App_Runner_+_RDS_+_S3-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![Tests](https://img.shields.io/badge/Tests-17_Passed_100%25-brightgreen.svg)]()

> **Final-Year / Capstone Project for Cloud Computing**  
> An enterprise-grade, cloud-native placement platform connecting **Students**, **Corporate Recruiters**, and **College Placement Officers** with explainable rule-based skills matching, role-based access control (RBAC), encrypted private resume storage, and automated institutional analytics.

---

## 1. Project Overview

**CareerCloud** modernizes university recruitment by eliminating manual spreadsheets, opaque applicant tracking, and unverified resume sharing. It provides:
1. **Explainable Job Matching**: A deterministic algorithm calculating compatibility scores (0–100%) based on Skills (50%), Department (20%), CGPA (15%), and Graduation Batch (15%) with hard eligibility constraint enforcement.
2. **Private Resume Vault**: Secure PDF storage using UUID keys, server-side MIME verification, and short-lived presigned download access.
3. **Role-Based Portals**: Tailored interfaces for Students, Corporate Recruiters, and Placement Officers.
4. **Institutional Governance**: Real-time placement analytics, department performance charts, and one-click CSV export reports for university accreditation.
5. **AWS Cloud Architecture**: Ready to deploy on AWS App Runner, Amazon RDS PostgreSQL, and Amazon S3.

---

## 2. User Roles & Capabilities

### 🎓 A. University Student
* Register and log in securely via JWT authentication.
* Manage academic profile: Department, Degree, Graduation Batch, CGPA, and technical skills tags.
* Upload, preview, and replace PDF resumes (up to 5 MB) stored privately.
* Browse campus jobs with live keyword search and multi-facet filters.
* Review job compatibility score breakdown and readable explanation of match reasons.
* Submit 1-click applications with automated duplicate prevention.
* Track application pipeline status: *Applied → Shortlisted → Interview Scheduled → Selected / Offer Extended*.
* Save positions to a personal shortlist.
* Receive real-time in-app notifications on status changes.

### 🏢 B. Corporate Recruiter
* Register and update company profile (legal name, industry, logo, location, website).
* Publish new campus openings with customized minimum CGPA cutoffs, required skills, and eligible departments.
* Edit, activate, or close job postings.
* Screen applicants, review verified student profiles, and download authorized PDF resumes.
* Update applicant status stages with custom recruiter notes.
* Monitor recruitment analytics: active jobs, applicant pipeline, and conversion rates.

### 🏛️ C. Placement Officer / Admin
* Access executive dashboard displaying institutional metrics (Placement Rate %, Total Placements, Department breakdown).
* Interactive Recharts visualizations: Department Placement Performance & Monthly Application Trends.
* Search and filter student directory by department, graduation cohort, and placement status.
* Review and approve corporate recruiter partner accounts.
* Moderate campus job listings (flag/restore non-compliant listings).
* Track and export CSV reports: **Placements Accreditation Report** and **Students Directory**.
* Audit immutable security trail of all administrative and status update events.

---

## 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, React Router v7 |
| **Backend API**| Python 3.11 / 3.14, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn, Bcrypt, PyJWT |
| **Database** | PostgreSQL 16 (Local & Amazon RDS compatible; instant SQLite fallback for local dev) |
| **Storage** | Abstract Storage Adapter: Local filesystem for development; Amazon S3 for cloud deployment |
| **Cloud (AWS)**| AWS App Runner (Compute), Amazon RDS (PostgreSQL), Amazon S3 (Resumes), CloudFront / Amplify |
| **Testing** | Pytest, HTTPX, FastAPI TestClient (17 automated tests, 100% pass rate) |

---

## 4. Pre-Configured Demo Accounts (Ready to Test!)

The database includes a pre-seeded dataset with realistic jobs, candidates, and placement records.

| Role | Email | Password | Person / Entity |
| :--- | :--- | :--- | :--- |
| **Placement Director** | `admin@careercloud.edu` | `Password@123` | Prof. Robert Vance |
| **Lead Recruiter** | `sarah.recruiter@cloudscale.io` | `Password@123` | Sarah Jenkins (CloudScale Technologies) |
| **Technical Recruiter**| `arjun.recruiter@datanex.com` | `Password@123` | Arjun Sharma (DataNex Analytics) |
| **Student (CSE, 8.85)**| `alex.student@university.edu` | `Password@123` | Alex Morgan (Cloud Engineer Aspirant) |
| **Student (IT, 9.10)** | `sneha.student@university.edu` | `Password@123` | Sneha Patel (Java / AWS Developer) |
| **Student (Data, 7.80)**| `kiran.student@university.edu` | `Password@123` | Kiran Kumar (Data Analytics Intern) |

> 💡 **Quick Fill:** The Login page features 1-click demo buttons that pre-populate these credentials instantly!

---

## 5. Local Quickstart Guide (Step-by-Step)

### Prerequisites
* **Python**: Python 3.11+ installed.
* **Node.js**: Node 18+ and npm installed.

### Step 1: Clone and Enter Workspace
```powershell
cd c:\cloud_based_job_portal
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
*(By default, `DATABASE_URL` uses SQLite `./careercloud.db` so you can run the entire system instantly without installing database servers! When connecting to PostgreSQL or AWS RDS, update `DATABASE_URL` in `.env`)*.

### Step 3: Run Database Seed Script
Populate demo accounts, companies, openings, applications, and placement data:
```powershell
.\venv\Scripts\python.exe backend\seed.py
```

### Step 4: Start Backend API Server
```powershell
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```
* Backend API: [http://localhost:8000](http://localhost:8000)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check Endpoint: [http://localhost:8000/health](http://localhost:8000/health)

### Step 5: Start Frontend Development Server
Open a second terminal window and run:
```powershell
cd c:\cloud_based_job_portal\frontend
npm.cmd run dev
```
* Web Portal UI: **[http://localhost:5173](http://localhost:5173)**

---

## 6. Running Automated Tests

Run the comprehensive pytest suite covering authentication, role authorization, matching algorithms, duplicate prevention, and resume security:

```powershell
.\venv\Scripts\python.exe -m pytest backend\app\tests -v
```

**Test Coverage Summary:**
```
backend/app/tests/test_auth.py::test_student_registration PASSED
backend/app/tests/test_auth.py::test_recruiter_registration PASSED
backend/app/tests/test_auth.py::test_duplicate_registration_fails PASSED
backend/app/tests/test_auth.py::test_login_success PASSED
backend/app/tests/test_auth.py::test_login_invalid_password_fails PASSED
backend/app/tests/test_auth.py::test_get_current_user_me PASSED
backend/app/tests/test_jobs_applications.py::test_create_and_list_jobs PASSED
backend/app/tests/test_jobs_applications.py::test_application_workflow_and_duplicate_prevention PASSED
backend/app/tests/test_jobs_applications.py::test_unauthorized_status_update_fails PASSED
backend/app/tests/test_matching.py::test_matching_perfect_candidate PASSED
backend/app/tests/test_matching.py::test_matching_ineligible_due_to_cgpa PASSED
backend/app/tests/test_matching.py::test_matching_ineligible_due_to_graduation_year PASSED
backend/app/tests/test_matching.py::test_matching_partial_skills PASSED
backend/app/tests/test_matching.py::test_recommendations_endpoint PASSED
backend/app/tests/test_resumes.py::test_resume_upload_non_pdf_fails PASSED
backend/app/tests/test_resumes.py::test_resume_upload_valid_pdf_succeeds PASSED
backend/app/tests/test_resumes.py::test_resume_download_authorization PASSED
======================== 17 passed in 8.20s ========================
```

---

## 7. Project Folder Structure

```
careercloud/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, students, recruiters, jobs, resumes, admin)
│   │   ├── core/            # Security (bcrypt, JWT), dependencies, and RBAC
│   │   ├── models/          # SQLAlchemy ORM models (User, Job, Application, Placement, etc.)
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── services/        # Matching engine, notifications, audit logging
│   │   ├── storage/         # Storage abstraction (Local disk vs AWS S3 presigned URLs)
│   │   ├── tests/           # 17 automated Pytest test cases
│   │   ├── config.py        # Settings & environment variable configuration
│   │   ├── database.py      # SQLAlchemy session & multi-database engine
│   │   └── main.py          # FastAPI application entrypoint with CORS and healthcheck
│   ├── seed.py              # Development seed script for all 3 roles
│   ├── Dockerfile           # Hardened production container specification
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # JobCard, MatchScoreBadge, StatCard, Navbar, Footer
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── pages/           # LandingPage, JobDiscovery, Dashboards, Profiles, Admin
│   │   ├── services/        # Centralized REST API client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Client-side routing with protected route guards
│   │   └── main.tsx         # React root
│   ├── index.html           # SEO-optimized HTML entrypoint
│   └── vite.config.ts       # Vite bundler configuration
├── docs/
│   ├── architecture.md      # 3-Tier Cloud Architecture & mathematical algorithm
│   ├── cloud-deployment.md  # Step-by-step AWS deployment and cost-saving teardown guide
│   ├── database-design.md   # Entity-Relationship diagram and table constraints
│   ├── api-guide.md         # OpenAPI / Swagger request & response catalog
│   └── project-report-outline.md # Complete Capstone Project report structure
├── docker-compose.yml       # Multi-container local development with PostgreSQL
├── .env.example             # Environment variable template
└── README.md                # Project documentation
```

---

## 8. AWS Cloud Deployment & Architecture

Detailed deployment instructions and architecture diagrams are provided in:
* **Cloud Architecture**: [docs/architecture.md](file:///c:/cloud_based_job_portal/docs/architecture.md)
* **AWS Deployment Guide**: [docs/cloud-deployment.md](file:///c:/cloud_based_job_portal/docs/cloud-deployment.md)
* **Database Design**: [docs/database-design.md](file:///c:/cloud_based_job_portal/docs/database-design.md)
* **REST API Reference**: [docs/api-guide.md](file:///c:/cloud_based_job_portal/docs/api-guide.md)
* **Project Report Outline**: [docs/project-report-outline.md](file:///c:/cloud_based_job_portal/docs/project-report-outline.md)

---

## 9. Common Troubleshooting

* **Script Execution Disabled in Windows PowerShell:**  
  Run commands using `npm.cmd` or run PowerShell with ExecutionPolicy Bypass:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
* **PostgreSQL Service Not Installed Locally:**  
  The application automatically falls back to SQLite (`sqlite:///./careercloud.db`) if PostgreSQL is not active. This guarantees immediate zero-friction local execution.
* **Resume Upload Size Error:**  
  Resumes must be `.pdf` format and under 5 MB.
