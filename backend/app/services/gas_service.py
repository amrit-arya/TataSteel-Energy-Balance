"""
Gas Service
============

Business logic for gas types, alerts, and core data queries.
"""

from sqlalchemy.orm import Session

from backend.app.repositories.gas_repository import GasRepository
from backend.app.schemas.gas import (
    GasTypeResponse,
    AlertResponse,
)


class GasService:
    """Service for gas type operations and alerts."""

    def __init__(self, db: Session):
        self.repo = GasRepository(db)

    def get_all_gas_types(self) -> list[GasTypeResponse]:
        """Get all gas types as response models."""
        gas_types = self.repo.get_all_gas_types()
        return [GasTypeResponse.model_validate(gt) for gt in gas_types]

    def get_gas_type(self, gas_id: str) -> GasTypeResponse:
        """Get a single gas type."""
        gt = self.repo.get_gas_type_by_id(gas_id)
        if not gt:
            raise ValueError(f"Gas type '{gas_id}' not found")
        return GasTypeResponse.model_validate(gt)

    def get_all_alerts(self, include_resolved: bool = False) -> list[AlertResponse]:
        """Get all alerts."""
        alerts = self.repo.get_all_alerts(include_resolved)
        return [AlertResponse.model_validate(a) for a in alerts]

    def get_alert_counts(self) -> dict:
        """Get alert counts by severity."""
        return self.repo.get_alert_counts()
