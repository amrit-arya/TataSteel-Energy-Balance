"""
Gas Repository
===============

Data access for gas types, alerts, and audit logs.
"""

from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models.gas_type import GasType
from backend.app.models.alert import Alert, AuditLog


class GasRepository:
    """Repository for gas type and related data operations."""

    def __init__(self, db: Session):
        self.db = db

    # ── Gas Types ──────────────────────────────────────────────

    def get_all_gas_types(self) -> list[GasType]:
        """Get all gas types."""
        return self.db.query(GasType).all()

    def get_gas_type_by_id(self, gas_id: str) -> Optional[GasType]:
        """Get a single gas type by ID."""
        return self.db.query(GasType).filter(GasType.id == gas_id).first()

    # ── Alerts ─────────────────────────────────────────────────

    def get_all_alerts(self, include_resolved: bool = False) -> list[Alert]:
        """Get all alerts, optionally including resolved ones."""
        query = self.db.query(Alert)
        if not include_resolved:
            query = query.filter(Alert.is_resolved == False)
        return query.order_by(Alert.created_at.desc()).all()

    def get_alerts_by_severity(self, severity: str) -> list[Alert]:
        """Get alerts filtered by severity."""
        return (
            self.db.query(Alert)
            .filter(Alert.severity == severity, Alert.is_resolved == False)
            .order_by(Alert.created_at.desc())
            .all()
        )

    def get_alert_counts(self) -> dict:
        """Get counts of active alerts by severity."""
        alerts = self.get_all_alerts(include_resolved=False)
        counts = {"critical": 0, "warning": 0, "info": 0}
        for alert in alerts:
            if alert.severity in counts:
                counts[alert.severity] += 1
        return counts

    def create_alert(self, alert: Alert) -> Alert:
        """Create a new alert."""
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    # ── Audit Logs ─────────────────────────────────────────────

    def create_audit_log(self, log: AuditLog) -> AuditLog:
        """Create an audit log entry."""
        self.db.add(log)
        self.db.commit()
        return log
