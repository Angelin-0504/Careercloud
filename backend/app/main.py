import os
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.config import settings
from backend.app.database import engine, Base, get_db
import backend.app.models  # Ensure all models are registered on Base.metadata

from backend.app.api.auth import router as auth_router
from backend.app.api.students import router as students_router
from backend.app.api.recruiters import router as recruiters_router
from backend.app.api.jobs import router as jobs_router
from backend.app.api.applications import router as applications_router
from backend.app.api.resumes import router as resumes_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.admin import router as admin_router

# Initialize database tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Backend REST API for CareerCloud - Cloud-Based Student Placement and Job Matching Portal",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for cloud load balancers and container monitors
@app.get("/health", tags=["Health & Monitoring"])
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "storage_mode": settings.STORAGE_TYPE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to CareerCloud API - Cloud-Based Student Placement and Job Matching Portal",
        "docs_url": "/docs",
        "health_check": "/health",
        "api_prefix": settings.API_V1_PREFIX
    }

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(students_router, prefix=settings.API_V1_PREFIX)
app.include_router(recruiters_router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
