"""
Consumer ORM Model
===================

Represents a gas consumer (e.g., HSM Mill, Coke Plant, Pellet Plant).

Key Design Decisions:
    1. consumption_value is NULLABLE - for LD Gas where data is unavailable.
       This is NOT the same as zero. The application must distinguish between
       "consumes zero gas" and "consumption data is unknown".

    2. consumer_type is either 'Internal' or 'External':
       - Internal: The generator itself consumes some gas (BF Gas only)
       - External: A separate plant area consumes the gas

    3. priority is used by the simulation allocation engine to determine
       which consumers get gas first when supply is insufficient.
       Lower number = higher priority.
"""

from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.app.database import Base


class Consumer(Base):
    """ORM model for the consumers table."""

    __tablename__ = "consumers"

    id = Column(String(20), primary_key=True, index=True)
    gas_type_id = Column(
        String(10),
        ForeignKey("gas_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    consumer_name = Column(String(100), nullable=False)
    consumer_type = Column(String(20), nullable=False)  # 'Internal' or 'External'
    consumption_value = Column(Float, nullable=True)  # NULL = Data Unavailable
    priority = Column(Integer, default=0)
    unit = Column(String(20), default="Nm3/hr")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    gas_type = relationship("GasType", back_populates="consumers")

    def __repr__(self) -> str:
        return (
            f"<Consumer(id='{self.id}', "
            f"name='{self.consumer_name}', "
            f"type='{self.consumer_type}', "
            f"gas='{self.gas_type_id}', "
            f"value={self.consumption_value})>"
        )
