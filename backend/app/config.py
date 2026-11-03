from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerCloud API"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "careercloud-super-secret-production-key-change-in-env-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Supabase PostgreSQL / Cloud PostgreSQL / SQLite fallback)
    DATABASE_URL: str = "sqlite:///./careercloud.db"
    
    # Storage settings (local, s3, or supabase s3-compatible)
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    LOCAL_STORAGE_DIR: str = os.path.join(os.getcwd(), "uploads", "resumes")
    MAX_FILE_SIZE_MB: int = 5
    
    # S3 / Supabase Storage Settings (used when STORAGE_TYPE = "s3")
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "careercloud-resumes-bucket"
    AWS_ENDPOINT_URL: str = ""  # Set for Supabase S3 endpoint: https://<project-ref>.storage.supabase.co/v1/s3
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                import json
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [origin.strip() for origin in v_str.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
