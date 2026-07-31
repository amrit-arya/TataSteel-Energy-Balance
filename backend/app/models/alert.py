"""
Alert & AuditLog ORM Models
=============================

Alert:
    System-generated or simulation-triggered alerts.
    Types: deficit, surplus, utilization, simulation, data_quality
    Severities: critical, warning, info

AuditLog:
    Tracks all significant system actions for traceability.
    Required for industrial systems where audit trails are mandatory.
"""

from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.app.database import Base


class Alert(Base):
    """ORM model for system alerts."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(50), nullable=False)  # 'deficit'/'surplus'/'utilization'/'simulation'/'data_quality'
    severity = Column(String(20), nullable=False)  # 'critical'/'warning'/'info'
    gas_type_id = Column(
        String(10),
        ForeignKey("gas_types.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    gas_type = relationship("GasType", back_populates="alerts")

    def __repr__(self) -> str:
        return (
            f"<Alert(id={self.id}, "
            f"type='{self.alert_type}', "
            f"severity='{self.severity}', "
            f"title='{self.title}')>"
        )


class AuditLog(Base):
    """ORM model for system audit trail."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), default="")
    entity_id = Column(String(50), default="")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return (
            f"<AuditLog(id={self.id}, "
            f"action='{self.action}', "
            f"entity='{self.entity_type}:{self.entity_id}')>"
        )
