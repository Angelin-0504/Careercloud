from backend.app.config import settings
from backend.app.storage.base import StorageService
from backend.app.storage.local_storage import LocalStorageService
from backend.app.storage.s3_storage import S3StorageService

def get_storage() -> StorageService:
    """Return storage service based on environment configuration."""
    if settings.STORAGE_TYPE.lower() == "s3":
        return S3StorageService()
    return LocalStorageService()
