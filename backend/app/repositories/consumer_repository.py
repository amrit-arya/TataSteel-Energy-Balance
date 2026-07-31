"""
Consumer Repository
====================

Data access for consumers.
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.consumer import Consumer


class ConsumerRepository:
    """Repository for consumer data operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_consumers(self) -> list[Consumer]:
        """Get all consumers."""
        return self.db.query(Consumer).all()

    def get_consumers_by_gas_type(self, gas_type_id: str) -> list[Consumer]:
        """Get consumers for a specific gas type."""
        return (
            self.db.query(Consumer)
            .filter(Consumer.gas_type_id == gas_type_id)
            .order_by(Consumer.priority)
            .all()
        )

    def get_consumer_by_id(self, consumer_id: str) -> Optional[Consumer]:
        """Get a single consumer by ID."""
        return (
            self.db.query(Consumer)
            .filter(Consumer.id == consumer_id)
            .first()
        )

    def get_total_consumption(self, gas_type_id: str = None) -> Optional[float]:
        """
        Get total consumption, optionally filtered by gas type.
        Returns None if no consumers exist for the gas type (LD Gas case).
        """
        query = self.db.query(func.sum(Consumer.consumption_value))
        if gas_type_id:
            query = query.filter(Consumer.gas_type_id == gas_type_id)
        result = query.scalar()
        return float(result) if result is not None else None

    def get_consumer_count(self, gas_type_id: str = None) -> int:
        """Get count of consumers, optionally filtered."""
        query = self.db.query(func.count(Consumer.id))
        if gas_type_id:
            query = query.filter(Consumer.gas_type_id == gas_type_id)
        return query.scalar() or 0

    def has_consumers(self, gas_type_id: str) -> bool:
        """Check if any consumers exist for a gas type."""
        return self.get_consumer_count(gas_type_id) > 0

    def get_consumption_by_gas_type(self) -> list[dict]:
        """Get total consumption grouped by gas type."""
        results = (
            self.db.query(
                Consumer.gas_type_id,
                func.count(Consumer.id).label("consumer_count"),
                func.sum(Consumer.consumption_value).label("total_consumption"),
            )
            .group_by(Consumer.gas_type_id)
            .all()
        )
        return [
            {
                "gas_type_id": r.gas_type_id,
                "consumer_count": r.consumer_count,
                "total_consumption": float(r.total_consumption) if r.total_consumption else None,
            }
            for r in results
        ]

    def get_consumers_by_type(self, gas_type_id: str) -> dict:
        """Get internal vs external consumer breakdown for a gas type."""
        consumers = self.get_consumers_by_gas_type(gas_type_id)
        internal = [c for c in consumers if c.consumer_type == "Internal"]
        external = [c for c in consumers if c.consumer_type == "External"]
        return {
            "internal": internal,
            "external": external,
            "internal_count": len(internal),
            "external_count": len(external),
            "internal_consumption": sum(c.consumption_value for c in internal if c.consumption_value is not None),
            "external_consumption": sum(c.consumption_value for c in external if c.consumption_value is not None),
        }
