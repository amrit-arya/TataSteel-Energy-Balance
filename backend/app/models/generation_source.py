"""
GenerationSource ORM Model
============================

Represents a gas generation source (e.g., Furnace I, Old BPP, LD-1 & LD-3).

Each source belongs to exactly one gas type and contributes to the
shared gas pool for that type.

Design Note:
    generation_value is FLOAT not INTEGER because future data may include
    decimal precision. All current values happen to be integers.
"""

from datetime import datetime

from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.database import Base


class GenerationSource(Base):
    """ORM model for the generation_sources table."""

    __tablename__ = "generation_sources"

    id = Column(String(20), primary_key=True, index=True)
    gas_type_id = Column(
        String(10),
        ForeignKey("gas_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_name = Column(String(100), nullable=False)
    plant_area = Column(String(100), default="")
    generation_value = Column(Float, nullable=False)
    unit = Column(String(20), default="Nm3/hr")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    gas_type = relationship("GasType", back_populates="generation_sources")

    def __repr__(self) -> str:
        return (
            f"<GenerationSource(id='{self.id}', "
            f"name='{self.source_name}', "
            f"gas='{self.gas_type_id}', "
            f"value={self.generation_value})>"
        )
