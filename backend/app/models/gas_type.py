"""
GasType ORM Model
==================

Represents the three by-product gas types in the system:
    - BFG (Blast Furnace Gas)
    - COG (Coke Oven Gas)
    - LDG (Linz-Donawitz Gas)

This is the root entity. Generation sources and consumers
reference a gas type via foreign key.
"""

from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship

from backend.app.database import Base


class GasType(Base):
    """ORM model for the gas_types table."""

    __tablename__ = "gas_types"

    id = Column(String(10), primary_key=True, index=True)
    gas_name = Column(String(100), nullable=False, unique=True)
    short_name = Column(String(50), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    generation_sources = relationship(
        "GenerationSource",
        back_populates="gas_type",
        cascade="all, delete-orphan",
    )
    consumers = relationship(
        "Consumer",
        back_populates="gas_type",
        cascade="all, delete-orphan",
    )
    simulation_scenarios = relationship(
        "SimulationScenario",
        back_populates="gas_type",
        cascade="all, delete-orphan",
    )
    alerts = relationship(
        "Alert",
        back_populates="gas_type",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<GasType(id='{self.id}', name='{self.gas_name}')>"
