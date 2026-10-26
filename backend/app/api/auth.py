from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.student import StudentProfile
from backend.app.models.company import Company, RecruiterProfile
from backend.app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from backend.app.services.audit_service import audit_service
from backend.app.services.notification_service import notification_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Validate role (no public admin registration)
    role = user_in.role.lower().strip()
    if role not in ["student", "recruiter"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration is only permitted for 'student' or 'recruiter' roles.",
        )

    # Create User
    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=role,
        is_active=True,
        is_approved=True if role == "student" else False  # Recruiters start unapproved/verified pending review
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create role-specific profiles
    company_id = None
    student_id = None

    if role == "student":
        student_profile = StudentProfile(
            user_id=new_user.id,
            phone=user_in.phone.strip() if user_in.phone else None,
            department=user_in.department.strip() if user_in.department else "Computer Science & Engineering",
            degree=user_in.degree.strip() if user_in.degree else "B.Tech",
            graduation_year=user_in.graduation_year or 2026,
            cgpa=user_in.cgpa if user_in.cgpa is not None else 7.5,
            skills=user_in.skills.strip() if user_in.skills else "Python, Java, SQL, React",
            profile_completed_percentage=75 if user_in.skills else 40
        )
        db.add(student_profile)
        db.commit()
        db.refresh(student_profile)
        student_id = student_profile.id

        notification_service.create_notification(
            db=db,
            user_id=new_user.id,
            title="Welcome to CareerCloud!",
            message="Your student account has been created. Complete your academic details and upload your PDF resume to unlock personalized job recommendations.",
            notif_type="system",
            link="/student/profile"
        )
    elif role == "recruiter":
        # Check or create company
        company = None
        if user_in.company_name:
            company = db.query(Company).filter(Company.name.ilike(user_in.company_name.strip())).first()
            if not company:
                company = Company(
                    name=user_in.company_name.strip(),
                    industry=user_in.company_industry.strip() if user_in.company_industry else "Technology & Services",
                    location=user_in.company_location.strip() if user_in.company_location else "Remote / Flexible",
                    website=user_in.company_website.strip() if user_in.company_website else None,
                    is_verified=False
                )
                db.add(company)
                db.commit()
                db.refresh(company)
            company_id = company.id

        recruiter_profile = RecruiterProfile(
            user_id=new_user.id,
            company_id=company_id,
            designation=user_in.designation.strip() if user_in.designation else "Technical Recruiter"
        )
        db.add(recruiter_profile)
        db.commit()
        db.refresh(recruiter_profile)

        notification_service.create_notification(
            db=db,
            user_id=new_user.id,
            title="Recruiter Account Created",
            message="Welcome to CareerCloud! You can now publish campus placement openings and discover qualified student talent.",
            notif_type="system",
            link="/recruiter/dashboard"
        )

    # Audit log
    audit_service.log_action(
        db=db,
        user_id=new_user.id,
        action="USER_REGISTER",
        resource_type="User",
        resource_id=str(new_user.id),
        details=f"New {role} registered: {new_user.email}"
    )

    # Generate token
    token = create_access_token(
        data={"sub": str(new_user.id), "role": new_user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        is_approved=new_user.is_approved,
        created_at=new_user.created_at,
        company_id=company_id,
        student_id=student_id
    )

    return Token(access_token=token, token_type="bearer", user=user_response)

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the placement cell.",
        )

    company_id = None
    student_id = None
    if user.role == "recruiter" and user.recruiter_profile:
        company_id = user.recruiter_profile.company_id
    elif user.role == "student" and user.student_profile:
        student_id = user.student_profile.id

    token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    audit_service.log_action(
        db=db,
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="User",
        resource_id=str(user.id),
        details=f"User logged in: {user.email} (Role: {user.role})"
    )

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_approved=user.is_approved,
        created_at=user.created_at,
        company_id=company_id,
        student_id=student_id
    )

    return Token(access_token=token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    company_id = None
    student_id = None
    if current_user.role == "recruiter" and current_user.recruiter_profile:
        company_id = current_user.recruiter_profile.company_id
    elif current_user.role == "student" and current_user.student_profile:
        student_id = current_user.student_profile.id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_approved=current_user.is_approved,
        created_at=current_user.created_at,
        company_id=company_id,
        student_id=student_id
    )
