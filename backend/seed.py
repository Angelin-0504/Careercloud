import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure python path includes root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import engine, SessionLocal, Base
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.company import Company, RecruiterProfile
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job
from backend.app.models.application import Application, SavedJob, Placement
from backend.app.models.resume import Resume
from backend.app.models.notification import Notification
from backend.app.models.audit import AuditLog
from backend.app.storage.local_storage import LocalStorageService

def seed_database(reset: bool = False):
    print("Initializing database tables...")
    if reset:
        print("Resetting existing tables...")
        Base.metadata.drop_all(bind=engine)
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded with real-world companies
        existing_aws = db.query(Company).filter(Company.name.like("%Amazon%")).first()
        if existing_aws and not reset:
            print("Database already seeded with real-world enterprise employers. Skipping.")
            return

        # If old mock data exists without reset, clear and recreate
        existing_admin = db.query(User).filter(User.email == "admin@careercloud.edu").first()
        if existing_admin and not reset:
            print("Refreshing database with real-world enterprise companies (AWS, Microsoft, Google, TCS, Infosys, Accenture)...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        print("Seeding genuine enterprise employers, real-world campus jobs, and student profiles...")
        default_pwd = get_password_hash("Password@123")

        # 1. Admin / Placement Director
        admin_user = User(
            email="admin@careercloud.edu",
            hashed_password=default_pwd,
            full_name="Prof. Robert Vance (Director of Campus Placements)",
            role="admin",
            is_active=True,
            is_approved=True
        )
        db.add(admin_user)
        db.flush()

        # 2. Real-World Enterprise Companies
        company_aws = Company(
            name="Amazon Web Services (AWS)",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
            description="The world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.",
            industry="Cloud Computing & Enterprise Infrastructure",
            website="https://aws.amazon.com",
            location="Bangalore / Hyderabad / Chennai",
            is_verified=True
        )
        company_msft = Company(
            name="Microsoft",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
            description="Global technology leader powering enterprise productivity, Azure cloud infrastructure, developer tools, and cutting-edge artificial intelligence.",
            industry="Enterprise Software & Cloud Platforms",
            website="https://microsoft.com",
            location="Bangalore / Hyderabad / Noida (Hybrid)",
            is_verified=True
        )
        company_google = Company(
            name="Google Cloud",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
            description="Leading hyperscale cloud platform providing scalable compute, advanced data analytics, Kubernetes container orchestration, and Gemini AI APIs.",
            industry="Hyperscale Cloud & Artificial Intelligence",
            website="https://cloud.google.com",
            location="Bangalore / Hyderabad",
            is_verified=True
        )
        company_tcs = Company(
            name="Tata Consultancy Services (TCS)",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
            description="India's flagship IT services, consulting and business solutions organization partnering with the world's largest businesses in their transformation journeys.",
            industry="IT Services & Digital Consulting",
            website="https://tcs.com",
            location="Pan-India (Bangalore, Chennai, Mumbai, Pune, Hyderabad)",
            is_verified=True
        )
        company_infosys = Company(
            name="Infosys",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
            description="Global leader in next-generation digital services and consulting, enabling enterprise clients across 56 countries to navigate cloud-driven digital transformation.",
            industry="Digital Transformation & Cloud Services",
            website="https://infosys.com",
            location="Bangalore / Mysore / Pune / Hyderabad",
            is_verified=True
        )
        company_accenture = Company(
            name="Accenture",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
            description="Global professional services company with leading capabilities in digital, cloud, and security, delivering 360-degree value across multiple industries.",
            industry="Technology Consulting & Cloud Solutions",
            website="https://accenture.com",
            location="Bangalore / Hyderabad / Gurgaon / Chennai",
            is_verified=True
        )
        company_cisco = Company(
            name="Cisco Systems",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
            description="Worldwide technology leader in enterprise networking, secure hybrid work, cloud connectivity, zero-trust cybersecurity, and IoT telecommunications.",
            industry="Cloud Networking & Cybersecurity",
            website="https://cisco.com",
            location="Bangalore, Karnataka",
            is_verified=True
        )
        company_oracle = Company(
            name="Oracle",
            logo_url="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
            description="Provider of integrated cloud applications and Oracle Cloud Infrastructure (OCI) with autonomous databases, modern developer tools, and enterprise security.",
            industry="Cloud Databases & Enterprise Infrastructure",
            website="https://oracle.com",
            location="Bangalore / Hyderabad",
            is_verified=True
        )
        db.add_all([company_aws, company_msft, company_google, company_tcs, company_infosys, company_accenture, company_cisco, company_oracle])
        db.flush()

        # 3. Recruiters for Real-World Companies
        recruiter_aws = User(
            email="sarah.jenkins@aws.com",
            hashed_password=default_pwd,
            full_name="Sarah Jenkins (AWS University Talent)",
            role="recruiter",
            is_active=True,
            is_approved=True
        )
        recruiter_msft = User(
            email="priya.nair@microsoft.com",
            hashed_password=default_pwd,
            full_name="Priya Nair (Microsoft Campus Recruiter)",
            role="recruiter",
            is_active=True,
            is_approved=True
        )
        recruiter_tcs = User(
            email="arjun.sharma@tcs.com",
            hashed_password=default_pwd,
            full_name="Arjun Sharma (TCS Digital Campus Lead)",
            role="recruiter",
            is_active=True,
            is_approved=True
        )
        db.add_all([recruiter_aws, recruiter_msft, recruiter_tcs])
        db.flush()

        prof_aws = RecruiterProfile(
            user_id=recruiter_aws.id,
            company_id=company_aws.id,
            designation="University Talent Acquisition Lead",
            phone="+91 98765 43210"
        )
        prof_msft = RecruiterProfile(
            user_id=recruiter_msft.id,
            company_id=company_msft.id,
            designation="Senior Technical Recruiter - Azure Engineering",
            phone="+91 98765 43211"
        )
        prof_tcs = RecruiterProfile(
            user_id=recruiter_tcs.id,
            company_id=company_tcs.id,
            designation="Regional Head - Early Career & Campus Hiring",
            phone="+91 98765 43212"
        )
        db.add_all([prof_aws, prof_msft, prof_tcs])
        db.flush()

        # 4. Students
        student_user_alex = User(
            email="alex.student@university.edu",
            hashed_password=default_pwd,
            full_name="Alex Morgan",
            role="student",
            is_active=True,
            is_approved=True
        )
        student_user_sneha = User(
            email="sneha.student@university.edu",
            hashed_password=default_pwd,
            full_name="Sneha Patel",
            role="student",
            is_active=True,
            is_approved=True
        )
        student_user_kiran = User(
            email="kiran.student@university.edu",
            hashed_password=default_pwd,
            full_name="Kiran Kumar",
            role="student",
            is_active=True,
            is_approved=True
        )
        student_user_rohit = User(
            email="rohit.student@university.edu",
            hashed_password=default_pwd,
            full_name="Rohit Verma",
            role="student",
            is_active=True,
            is_approved=True
        )
        db.add_all([student_user_alex, student_user_sneha, student_user_kiran, student_user_rohit])
        db.flush()

        student_prof_alex = StudentProfile(
            user_id=student_user_alex.id,
            phone="+91 91234 56789",
            department="Computer Science & Engineering",
            degree="B.Tech",
            graduation_year=2026,
            cgpa=8.85,
            skills="Python, Java, SQL, React, AWS, Docker, Linux",
            certifications="AWS Certified Cloud Practitioner, HashiCorp Terraform Associate",
            projects="Cloud-Based Placement Portal, Microservices Distributed Task Queue",
            experience="Cloud Engineering Intern at TechVenture (Summer 2025)",
            bio="Aspiring Cloud Solutions Architect with hands-on skills in Python, Java, SQL, React, and AWS cloud services.",
            profile_completed_percentage=100
        )
        student_prof_sneha = StudentProfile(
            user_id=student_user_sneha.id,
            phone="+91 91234 56790",
            department="Information Technology",
            degree="B.Tech",
            graduation_year=2025,
            cgpa=8.20,
            skills="Java, Python, SQL, React, Spring Boot, REST APIs",
            certifications="Oracle Certified Java Associate",
            projects="Full-Stack Student Management Portal, E-Commerce API",
            profile_completed_percentage=85
        )
        student_prof_kiran = StudentProfile(
            user_id=student_user_kiran.id,
            phone="+91 91234 56791",
            department="Data Science",
            degree="B.Tech",
            graduation_year=2026,
            cgpa=7.80,
            skills="Python, SQL, Machine Learning, AWS, Pandas, Scikit-Learn",
            certifications="Google Data Analytics Professional Certificate",
            projects="Predictive Placement Analytics Model, Customer Churn Pipeline",
            profile_completed_percentage=75
        )
        student_prof_rohit = StudentProfile(
            user_id=student_user_rohit.id,
            phone="+91 91234 56792",
            department="Electronics & Communication",
            degree="B.Tech",
            graduation_year=2027,
            cgpa=7.20,
            skills="Python, Linux, C++, Embedded Systems, IoT, SQL",
            projects="Smart Campus Sensor Network on ESP32",
            profile_completed_percentage=65
        )
        db.add_all([student_prof_alex, student_prof_sneha, student_prof_kiran, student_prof_rohit])
        db.flush()

        # 5. Create Sample Resumes for Students
        storage = LocalStorageService()
        dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
        
        up_alex = storage.upload_file(dummy_pdf_content, "Alex_Morgan_Resume.pdf", "application/pdf")
        resume_alex = Resume(
            student_id=student_prof_alex.id,
            file_name="Alex_Morgan_Resume.pdf",
            storage_key=up_alex["storage_key"],
            storage_type="local",
            file_size_bytes=up_alex["file_size"],
            content_type="application/pdf"
        )
        up_sneha = storage.upload_file(dummy_pdf_content, "Sneha_Patel_Resume.pdf", "application/pdf")
        resume_sneha = Resume(
            student_id=student_prof_sneha.id,
            file_name="Sneha_Patel_Resume.pdf",
            storage_key=up_sneha["storage_key"],
            storage_type="local",
            file_size_bytes=up_sneha["file_size"],
            content_type="application/pdf"
        )
        db.add_all([resume_alex, resume_sneha])
        db.flush()

        # 6. Real-World Campus Jobs (All batches 2024-2028 eligible, featuring Python, Java, SQL, React)
        deadline_far = datetime.now(timezone.utc) + timedelta(days=60)
        open_batches = "2024, 2025, 2026, 2027, 2028"
        broad_depts = "Computer Science & Engineering, Information Technology, Data Science, Electronics & Communication, All Engineering Branches"

        job_aws_support = Job(
            company_id=company_aws.id,
            posted_by_user_id=recruiter_aws.id,
            title="Cloud Support Associate (AWS Infrastructure)",
            description="Join Amazon Web Services (AWS) as a Cloud Support Associate. You will solve complex architecture problems, troubleshoot distributed cloud workloads, automate deployment tasks using Python, and support global enterprise customers running on Amazon EC2, S3, RDS, and VPC.",
            job_type="Full-time",
            location="Bangalore / Hyderabad / Chennai",
            salary_range="₹12,00,000 - ₹15,50,000 / year",
            min_cgpa=6.5,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Python, Linux, SQL, AWS, Networking",
            application_deadline=deadline_far,
            status="active"
        )

        job_aws_sde = Job(
            company_id=company_aws.id,
            posted_by_user_id=recruiter_aws.id,
            title="Graduate Software Development Engineer (SDE I)",
            description="Build hyper-scale cloud microservices at Amazon Web Services. As an SDE I, you will design resilient backend services, implement high-performance APIs with Java and Python, optimize relational and NoSQL databases, and contribute to services powering millions of global customers.",
            job_type="Full-time",
            location="Bangalore, Karnataka",
            salary_range="₹18,00,000 - ₹24,00,000 / year",
            min_cgpa=7.0,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Java, Python, SQL, AWS, Data Structures",
            application_deadline=deadline_far,
            status="active"
        )

        job_msft_azure = Job(
            company_id=company_msft.id,
            posted_by_user_id=recruiter_msft.id,
            title="Software Engineer - Azure Cloud & Modern Web",
            description="Work at Microsoft on next-generation cloud services and enterprise developer tools. You will engineer responsive React frontends, high-throughput cloud microservices with Python and TypeScript, and scalable SQL database backends hosted on Microsoft Azure.",
            job_type="Full-time",
            location="Bangalore / Hyderabad / Noida (Hybrid)",
            salary_range="₹16,00,000 - ₹22,00,000 / year",
            min_cgpa=6.5,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="React, Python, SQL, TypeScript, Azure",
            application_deadline=deadline_far,
            status="active"
        )

        job_google_cloud = Job(
            company_id=company_google.id,
            posted_by_user_id=admin_user.id,
            title="Associate Cloud Engineer (Campus Graduate)",
            description="Join Google Cloud's Engineering & Solutions pod. You will design and deploy scalable cloud solutions, automate containerized microservices using Docker and Kubernetes, write clean backend code in Python and Java, and query enterprise data lakes with SQL.",
            job_type="Full-time",
            location="Bangalore / Hyderabad",
            salary_range="₹18,00,000 - ₹25,00,000 / year",
            min_cgpa=7.0,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Python, Java, SQL, Linux, Cloud Computing",
            application_deadline=deadline_far,
            status="active"
        )

        job_tcs_digital = Job(
            company_id=company_tcs.id,
            posted_by_user_id=recruiter_tcs.id,
            title="TCS Digital - Cloud & Full-Stack Developer",
            description="TCS Digital is the premier elite engineering cadre at Tata Consultancy Services. You will build cutting-edge web platforms using React, architect high-concurrency microservices using Java and Python, manage SQL databases, and deploy to hybrid cloud environments.",
            job_type="Full-time",
            location="Pan-India (Bangalore, Chennai, Mumbai, Pune, Hyderabad)",
            salary_range="₹7,20,000 - ₹9,50,000 / year",
            min_cgpa=6.0,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Java, Python, SQL, React, Web Development",
            application_deadline=deadline_far,
            status="active"
        )

        job_infosys_ses = Job(
            company_id=company_infosys.id,
            posted_by_user_id=admin_user.id,
            title="Specialist Programmer (SES) - Cloud & Modern Web",
            description="Infosys Specialist Programmer (SES) is our high-impact technical development track. You will tackle complex algorithmic challenges, build full-stack web applications with React and Python/Java, maintain relational SQL databases, and integrate cloud native services.",
            job_type="Full-time",
            location="Bangalore / Mysore / Pune / Hyderabad",
            salary_range="₹6,50,000 - ₹9,50,000 / year",
            min_cgpa=6.0,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Python, Java, React, SQL, Git",
            application_deadline=deadline_far,
            status="active"
        )

        job_accenture = Job(
            company_id=company_accenture.id,
            posted_by_user_id=admin_user.id,
            title="Advanced Application Engineering Analyst (Cloud First)",
            description="Be part of Accenture's Cloud First innovation team. You will engineer scalable enterprise software using Java, Python, and SQL, develop intuitive user interfaces in React, and implement continuous delivery pipelines on top cloud platforms.",
            job_type="Full-time",
            location="Bangalore / Hyderabad / Gurgaon / Chennai",
            salary_range="₹6,50,000 - ₹8,80,000 / year",
            min_cgpa=6.0,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Java, SQL, Python, React, Spring Boot",
            application_deadline=deadline_far,
            status="active"
        )

        job_cisco = Job(
            company_id=company_cisco.id,
            posted_by_user_id=admin_user.id,
            title="Cloud Systems & Software Engineer",
            description="Architect software for next-generation cloud infrastructure, enterprise telemetry, and zero-trust cybersecurity networks at Cisco. Requires hands-on proficiency in Python, Linux, Docker containers, and SQL databases.",
            job_type="Full-time",
            location="Bangalore, Karnataka",
            salary_range="₹13,50,000 - ₹17,50,000 / year",
            min_cgpa=6.5,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="Python, Linux, Docker, SQL, Java",
            application_deadline=deadline_far,
            status="active"
        )

        job_oracle = Job(
            company_id=company_oracle.id,
            posted_by_user_id=admin_user.id,
            title="Cloud Database & Infrastructure Engineer (OCI)",
            description="Develop mission-critical cloud database services and automated infrastructure tools at Oracle Cloud Infrastructure (OCI). Requires strong foundational expertise in SQL, Java, Python, and Linux systems programming.",
            job_type="Full-time",
            location="Bangalore / Hyderabad",
            salary_range="₹12,50,000 - ₹16,50,000 / year",
            min_cgpa=6.5,
            eligible_departments=broad_depts,
            eligible_graduation_years=open_batches,
            required_skills="SQL, Java, Python, Linux, Cloud Infrastructure",
            application_deadline=deadline_far,
            status="active"
        )

        db.add_all([
            job_aws_support, job_aws_sde, job_msft_azure, job_google_cloud,
            job_tcs_digital, job_infosys_ses, job_accenture, job_cisco, job_oracle
        ])
        db.flush()

        # 7. Applications for Demo Candidates
        app_1 = Application(
            student_id=student_prof_alex.id,
            job_id=job_aws_support.id,
            status="Selected",
            notes="Exceptional technical evaluation in AWS architectures and live coding round."
        )
        app_2 = Application(
            student_id=student_prof_alex.id,
            job_id=job_msft_azure.id,
            status="Interview Scheduled",
            notes="Shortlisted for technical round 2."
        )
        app_3 = Application(
            student_id=student_prof_sneha.id,
            job_id=job_tcs_digital.id,
            status="Shortlisted",
            notes="Strong score in TCS National Qualifier and full-stack coding interview."
        )
        app_4 = Application(
            student_id=student_prof_kiran.id,
            job_id=job_google_cloud.id,
            status="Applied",
            notes="Applied for Associate Cloud Engineer."
        )
        db.add_all([app_1, app_2, app_3, app_4])
        db.flush()

        # 8. Placement Record for Alex
        placement_alex = Placement(
            student_id=student_prof_alex.id,
            company_id=company_aws.id,
            job_id=job_aws_support.id,
            package_lpa=15.5,
            placed_date=datetime.now(timezone.utc) - timedelta(days=5),
            academic_year="2025-2026"
        )
        db.add(placement_alex)

        # 9. Saved Job for Alex
        saved_alex = SavedJob(
            student_id=student_prof_alex.id,
            job_id=job_google_cloud.id
        )
        db.add(saved_alex)

        # 10. Audit Logs
        log1 = AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_INITIALIZED",
            resource_type="System",
            resource_id="1",
            details="Seeded real-world enterprise employers (AWS, Microsoft, Google Cloud, TCS, Infosys, Accenture, Cisco, Oracle) and campus job opportunities."
        )
        log2 = AuditLog(
            user_id=admin_user.id,
            action="COMPANY_VERIFIED",
            resource_type="Company",
            resource_id=str(company_aws.id),
            details="Verified official recruiter credentials for Amazon Web Services."
        )
        log3 = AuditLog(
            user_id=recruiter_aws.id,
            action="APPLICATION_STATUS_UPDATED",
            resource_type="Application",
            resource_id=str(app_1.id),
            details="Candidate Alex Morgan selected for Cloud Support Associate (AWS Infrastructure)."
        )
        db.add_all([log1, log2, log3])

        # 11. Notifications
        n1 = Notification(
            user_id=student_user_alex.id,
            title="Selection & Offer Letter Notification!",
            message="Congratulations! You have been selected by Amazon Web Services (AWS) for the Cloud Support Associate role (₹15.5 LPA).",
            type="application_status",
            link="/student/applications",
            is_read=False
        )
        n2 = Notification(
            user_id=student_user_alex.id,
            title="High Compatibility Job Alert",
            message="New real-world job posted: 'Software Engineer - Azure Cloud & Modern Web' at Microsoft matches 95% of your skills (Python, SQL, React).",
            type="recommendation",
            link="/explore-jobs",
            is_read=True
        )
        db.add_all([n1, n2])

        db.commit()
        print("Database seeded successfully with genuine real-world companies and jobs!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    force_reset = "--reset" in sys.argv
    seed_database(reset=force_reset)
