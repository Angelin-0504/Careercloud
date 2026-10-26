from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.models.audit import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[int] = None,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            details=details,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @staticmethod
    def get_logs(db: Session, limit: int = 100, action: Optional[str] = None) -> List[AuditLog]:
        query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
        if action:
            query = query.filter(AuditLog.action == action)
        return query.limit(limit).all()

audit_service = AuditService()
