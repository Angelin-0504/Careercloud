# CareerCloud — Relational Database Architecture

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has profile"
    USERS ||--o| RECRUITER_PROFILES : "has profile"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ JOBS : "posts (as recruiter)"

    COMPANIES ||--o{ RECRUITER_PROFILES : "employs"
    COMPANIES ||--o{ JOBS : "publishes"
    COMPANIES ||--o{ PLACEMENTS : "hires into"

    STUDENT_PROFILES ||--o{ RESUMES : "owns"
    STUDENT_PROFILES ||--o{ APPLICATIONS : "submits"
    STUDENT_PROFILES ||--o{ SAVED_JOBS : "shortlists"
    STUDENT_PROFILES ||--o{ PLACEMENTS : "placed into"

    JOBS ||--o{ APPLICATIONS : "receives"
    JOBS ||--o{ SAVED_JOBS : "saved by"
    JOBS ||--o{ PLACEMENTS : "generates"

    USERS {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role
        boolean is_active
        boolean is_approved
        datetime created_at
    }

    STUDENT_PROFILES {
        int id PK
        int user_id FK, UK
        string phone
        string department
        string degree
        int graduation_year
        float cgpa
        text skills
        text certifications
        text projects
        text experience
        text bio
        int profile_completed_percentage
    }

    COMPANIES {
        int id PK
        string name UK
        string logo_url
        text description
        string industry
        string website
        string location
        boolean is_verified
        datetime created_at
    }

    RECRUITER_PROFILES {
        int id PK
        int user_id FK, UK
        int company_id FK
        string designation
        string phone
    }

    JOBS {
        int id PK
        int company_id FK
        int posted_by_user_id FK
        string title
        text description
        string job_type
        string location
        string salary_range
        float min_cgpa
        text eligible_departments
        text eligible_graduation_years
        text required_skills
        datetime application_deadline
        string status
        datetime created_at
    }

    APPLICATIONS {
        int id PK
        int student_id FK
        int job_id FK
        string status
        datetime applied_at
        datetime updated_at
        text notes
    }

    RESUMES {
        int id PK
        int student_id FK
        string file_name
        string storage_key UK
        string storage_type
        int file_size_bytes
        string content_type
        datetime uploaded_at
    }

    PLACEMENTS {
        int id PK
        int student_id FK
        int company_id FK
        int job_id FK
        float package_lpa
        datetime placed_date
        string academic_year
    }

    SAVED_JOBS {
        int id PK
        int student_id FK
        int job_id FK
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        string type
        boolean is_read
        string link
        datetime created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string resource_type
        string resource_id
        text details
        string ip_address
        datetime created_at
    }
```

---

## 2. Table Specifications & Constraints

### 1. `users`
* `id`: Integer primary key with autoincrement.
* `email`: VARCHAR(255), UNIQUE, INDEXED. Case-insensitive normalization applied at application level.
* `hashed_password`: VARCHAR(255) containing salted bcrypt cryptographic hash.
* `role`: VARCHAR(50) restricted to `'student'`, `'recruiter'`, or `'admin'`.
* `is_approved`: Boolean flag. Student accounts default to true; recruiter company accounts are reviewed by placement officers.

### 2. `student_profiles`
* `user_id`: Integer foreign key referencing `users.id` with `ON DELETE CASCADE`. Unique constraint enforces 1:1 mapping.
* `department`: VARCHAR(100), e.g., 'Computer Science & Engineering'.
* `cgpa`: Float with check constraint $0.0 \le \text{cgpa} \le 10.0$.
* `skills`: Comma-separated list of technical competencies evaluated by the matching service.

### 3. `jobs`
* `company_id`: Foreign key referencing `companies.id` with `ON DELETE CASCADE`.
* `min_cgpa`: Minimum eligibility requirement.
* `eligible_departments`: Comma-separated list of accepted majors.
* `eligible_graduation_years`: Comma-separated graduation cohorts.
* `status`: Active, closed, or flagged.

### 4. `applications`
* Composite uniqueness constraint: `UNIQUE (student_id, job_id)` prevents accidental or duplicate submissions.
* `status`: Enum string (`Applied`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`, `Withdrawn`).

### 5. `resumes`
* `storage_key`: UNIQUE UUID key preventing collisions and directory traversal.
* `storage_type`: `'local'` or `'s3'`.
* Resumes are protected by row-level application checks ensuring strict student and authorized recruiter access.

### 6. `placements`
* Records final accepted recruitment offers with package (LPA) and academic cohort for institutional accreditation statistics.
