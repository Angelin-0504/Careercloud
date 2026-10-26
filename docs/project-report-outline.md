# Final-Year Capstone Project Report Outline
## "Cloud-Based Student Placement and Job Matching Portal" (CareerCloud)

This comprehensive report outline follows standard university engineering accreditation guidelines (e.g. ABET, NBA, IEEE) for a final-year/capstone project in Computer Science & Engineering / Cloud Computing.

---

### CHAPTER 1: ABSTRACT & INTRODUCTION
1.1 **Abstract**
* Problem summary: Fragmented, manual campus placement processes.
* Proposed solution: A 3-tier, cloud-native placement platform on AWS.
* Core innovations: Deterministic explainable rule-based matching, role-based access control (RBAC), and private object storage with presigned URLs.
* Results achieved: 100% automated matching transparency, zero-trust resume privacy, and instant CSV accreditation report generation.

1.2 **Introduction & Background**
* Importance of career services in higher education institutions.
* Shift from legacy spreadsheet-based coordination to centralized cloud platforms.
* Scope and applicability of the project.

1.3 **Problem Statement**
* Limitations of traditional placement cells: manual resume collection, spreadsheet tracking, delayed status updates, and lack of candidate-job compatibility scoring.

1.4 **Project Objectives**
* Primary and secondary engineering objectives.

---

### CHAPTER 2: LITERATURE SURVEY & EXISTING SYSTEMS
2.1 **Overview of Existing Recruitment Platforms** (e.g. LinkedIn, Handshake, Superset).
2.2 **Comparative Analysis Matrix**:
* Existing systems vs CareerCloud (Feature comparison, transparency, privacy, cloud cost).
2.3 **Identified Research & Implementation Gaps**.

---

### CHAPTER 3: PROPOSED SYSTEM & METHODOLOGY
3.1 **System Philosophy**: Transparency, privacy, and cloud scalability.
3.2 **Stakeholder Personas & User Roles**:
* University Student
* Corporate Recruiter
* College Placement Officer
3.3 **Key Architectural Highlights**:
* Decoupled Frontend (React 19) and Backend (FastAPI).
* Relational Persistence (Amazon RDS PostgreSQL).
* Secure Object Storage (Amazon S3).

---

### CHAPTER 4: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
4.1 **Functional Requirements**:
* Authentication & JWT Authorization.
* Student Academic Profile & Resume Vault.
* Recruiter Job Publishing & Candidate Screening.
* Rule-Based Compatibility Engine.
* Placement Cell Governance & Reporting.
4.2 **Non-Functional Requirements (NFRs)**:
* Security (OWASP Top 10, Bcrypt, Least-Privilege IAM).
* Scalability & High Availability (Multi-AZ RDS, Stateless Containers).
* Usability & Responsiveness (Tailwind CSS, Inter typography).
* Maintainability & Clean Code Standards.

---

### CHAPTER 5: SYSTEM DESIGN & CLOUD ARCHITECTURE
5.1 **Architectural Topology** (3-Tier Cloud Topology Diagram).
5.2 **Data Flow Diagrams (DFD)**:
* Level 0 Context Diagram.
* Level 1 Process Diagram (Matching & Application Lifecycle).
5.3 **Relational Database Design**:
* Entity-Relationship (ER) Diagram.
* Normalization analysis up to Third Normal Form (3NF).
* Data dictionary & constraints specification.
5.4 **Explainable Matching Algorithm Mathematical Formulation**:
* Mathematical model: Skills match (50%), Department (20%), CGPA (15%), Graduation Batch (15%).
* Hard constraint enforcement logic for eligibility screening.

---

### CHAPTER 6: IMPLEMENTATION DETAILS
6.1 **Backend Implementation (FastAPI)**:
* Modular structure (`api`, `core`, `models`, `schemas`, `services`, `storage`).
* Storage abstraction implementation (Local vs S3 adapter).
* Asynchronous request processing and database pooling.
6.2 **Frontend Implementation (React + TypeScript + Vite)**:
* Design system tokens and Tailwind CSS integration.
* Reusable components (`JobCard`, `MatchScoreBadge`, `StatCard`, `NotificationDropdown`).
* Centralized state and API communication.
6.3 **Security Implementation**:
* Salted password hashing with bcrypt.
* JWT bearer token validation.
* File upload validation (magic bytes, size check, sanitized storage keys).

---

### CHAPTER 7: TESTING & QUALITY ASSURANCE
7.1 **Automated Unit & Integration Testing**:
* Pytest test suite results (17 automated tests, 100% pass rate).
* Authentication tests, role authorization tests, matching algorithm tests, duplicate application prevention, and resume access authorization tests.
7.2 **Manual Workflow Verification Checklist**:
* End-to-end student, recruiter, and administrator workflow verification.
7.3 **Security & Negative Test Scenarios**:
* Unauthorized resume access attempts (HTTP 403).
* Corrupted file upload rejection.
* Duplicate application prevention.

---

### CHAPTER 8: AWS CLOUD DEPLOYMENT & DEVOPS
8.1 **Cloud Deployment Architecture on AWS**:
* Frontend hosting via AWS Amplify / CloudFront S3.
* Containerized backend on AWS App Runner.
* Managed PostgreSQL on Amazon RDS.
* Private object storage on Amazon S3.
8.2 **Continuous Deployment & Docker Containerization**.
8.3 **Cloud Monitoring & Observability** (Amazon CloudWatch).
8.4 **Free Tier Cost Optimization & Resource Teardown Protocol**.

---

### CHAPTER 9: RESULTS, EVALUATION & DISCUSSION
9.1 **Feature Delivery & Screenshots**:
* Public Landing Page.
* Student Dashboard & Recommended Jobs.
* Recruiter Job Posting & Applicant Management.
* Placement Officer Analytics Dashboard & CSV Exports.
9.2 **Performance Evaluation**:
* Matching algorithm execution latency (&lt;10ms per job evaluation).
* Sub-second page load times.

---

### CHAPTER 10: LIMITATIONS, FUTURE SCOPE & CONCLUSION
10.1 **Current System Limitations**:
* Text-based PDF resume parsing rather than OCR for scanned documents.
* Single-institution tenancy.
10.2 **Future Scope**:
* Real-time WebSocket messaging between recruiter and candidate.
* Machine learning natural language processing (NLP) for contextual resume parsing.
* AI-driven mock interview simulations.
10.3 **Conclusion**:
* Summary of learning outcomes, engineering contributions, and cloud computing principles mastered.

---

### REFERENCES & BIBLIOGRAPHY
* AWS Well-Architected Framework Documentation.
* FastAPI and Pydantic v2 Documentation.
* React and Vite Framework Documentation.
* IEEE Research Papers on Campus Recruitment Management Systems.
