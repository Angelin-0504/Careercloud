import os
import uuid
from typing import Tuple, Dict, Any, Optional
from backend.app.storage.base import StorageService
from backend.app.config import settings

class LocalStorageService(StorageService):
    """Local filesystem storage provider for development."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or settings.LOCAL_STORAGE_DIR
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_absolute_path(self, storage_key: str) -> str:
        # Prevent directory traversal
        clean_key = os.path.basename(storage_key)
        return os.path.join(self.base_dir, clean_key)

    def upload_file(self, content: bytes, original_filename: str, content_type: str = "application/pdf") -> Dict[str, Any]:
        file_ext = os.path.splitext(original_filename)[1].lower() or ".pdf"
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        storage_key = f"resumes/{unique_filename}"
        
        file_path = self._get_absolute_path(unique_filename)
        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "storage_key": storage_key,
            "storage_type": "local",
            "file_size": len(content),
            "content_type": content_type
        }

    def get_file(self, storage_key: str) -> Tuple[bytes, str]:
        unique_filename = os.path.basename(storage_key)
        file_path = self._get_absolute_path(unique_filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {storage_key}")
        
        with open(file_path, "rb") as f:
            content = f.read()
        return content, "application/pdf"

    def delete_file(self, storage_key: str) -> bool:
        unique_filename = os.path.basename(storage_key)
        file_path = self._get_absolute_path(unique_filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def get_download_url(self, storage_key: str, expires_in: int = 3600) -> Optional[str]:
        # For local dev, frontend will hit authorized API endpoint
        return None
