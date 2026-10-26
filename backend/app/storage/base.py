from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any, Optional

class StorageService(ABC):
    """Abstract Base Class for file storage (Local vs AWS S3)."""

    @abstractmethod
    def upload_file(self, content: bytes, original_filename: str, content_type: str = "application/pdf") -> Dict[str, Any]:
        """
        Upload file content and return metadata dictionary:
        {
            "storage_key": str,
            "storage_type": str,
            "file_size": int,
            "content_type": str
        }
        """
        pass

    @abstractmethod
    def get_file(self, storage_key: str) -> Tuple[bytes, str]:
        """
        Retrieve file binary content and its mime content-type.
        Returns: (content_bytes, content_type)
        """
        pass

    @abstractmethod
    def delete_file(self, storage_key: str) -> bool:
        """Delete file by storage key."""
        pass

    @abstractmethod
    def get_download_url(self, storage_key: str, expires_in: int = 3600) -> Optional[str]:
        """
        Get an accessible download URL. For S3, generates a temporary presigned URL.
        For local storage, returns an internal API endpoint URL.
        """
        pass
