"""
Generation Repository
======================

Data access for generation sources.
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.generation_source import GenerationSource


class GenerationRepository:
    """Repository for generation source data operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all_sources(self) -> list[GenerationSource]:
        """Get all generation sources."""
        return self.db.query(GenerationSource).all()

    def get_sources_by_gas_type(self, gas_type_id: str) -> list[GenerationSource]:
        """Get generation sources for a specific gas type."""
        return (
            self.db.query(GenerationSource)
            .filter(GenerationSource.gas_type_id == gas_type_id)
            .all()
        )

    def get_source_by_id(self, source_id: str) -> Optional[GenerationSource]:
        """Get a single generation source by ID."""
        return (
            self.db.query(GenerationSource)
            .filter(GenerationSource.id == source_id)
            .first()
        )

    def get_total_generation(self, gas_type_id: str = None) -> float:
        """Get total generation, optionally filtered by gas type."""
        query = self.db.query(func.sum(GenerationSource.generation_value))
        if gas_type_id:
            query = query.filter(GenerationSource.gas_type_id == gas_type_id)
        result = query.scalar()
        return float(result) if result else 0.0

    def get_source_count(self, gas_type_id: str = None) -> int:
        """Get count of generation sources, optionally filtered."""
        query = self.db.query(func.count(GenerationSource.id))
        if gas_type_id:
            query = query.filter(GenerationSource.gas_type_id == gas_type_id)
        return query.scalar() or 0

    def get_generation_by_gas_type(self) -> list[dict]:
        """Get total generation grouped by gas type."""
        results = (
            self.db.query(
                GenerationSource.gas_type_id,
                func.count(GenerationSource.id).label("source_count"),
                func.sum(GenerationSource.generation_value).label("total_generation"),
            )
            .group_by(GenerationSource.gas_type_id)
            .all()
        )
        return [
            {
                "gas_type_id": r.gas_type_id,
                "source_count": r.source_count,
                "total_generation": float(r.total_generation) if r.total_generation else 0.0,
            }
            for r in results
        ]
