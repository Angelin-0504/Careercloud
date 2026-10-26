import os
import uuid
import boto3
from botocore.exceptions import ClientError
from typing import Tuple, Dict, Any, Optional
from backend.app.storage.base import StorageService
from backend.app.config import settings

class S3StorageService(StorageService):
    """Amazon S3 object storage provider for AWS cloud production deployment."""

    def __init__(self):
        self.bucket_name = settings.AWS_S3_BUCKET_NAME
        self.region = settings.AWS_REGION
        
        client_kwargs = {"region_name": self.region}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

        self.s3_client = boto3.client("s3", **client_kwargs)

    def upload_file(self, content: bytes, original_filename: str, content_type: str = "application/pdf") -> Dict[str, Any]:
        file_ext = os.path.splitext(original_filename)[1].lower() or ".pdf"
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        storage_key = f"resumes/{unique_filename}"

        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_key,
                Body=content,
                ContentType=content_type,
                ServerSideEncryption="AES256"
            )
        except ClientError as e:
            raise RuntimeError(f"AWS S3 upload failed: {str(e)}")

        return {
            "storage_key": storage_key,
            "storage_type": "s3",
            "file_size": len(content),
            "content_type": content_type
        }

    def get_file(self, storage_key: str) -> Tuple[bytes, str]:
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=storage_key)
            content = response["Body"].read()
            content_type = response.get("ContentType", "application/pdf")
            return content, content_type
        except ClientError as e:
            raise FileNotFoundError(f"S3 Object not found: {str(e)}")

    def delete_file(self, storage_key: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except ClientError:
            return False

    def get_download_url(self, storage_key: str, expires_in: int = 3600) -> Optional[str]:
        """Generate a secure, short-lived presigned URL for private S3 download."""
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket_name, "Key": storage_key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError:
            return None
