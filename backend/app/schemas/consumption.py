"""
Consumption Schemas
====================

Pydantic models for consumer responses.
"""

from typing import Optional
from pydantic import BaseModel


class ConsumerResponse(BaseModel):
    """Response model for a single consumer."""
    id: str
    gas_type_id: str
    consumer_name: str
    consumer_type: str
    consumption_value: Optional[float] = None
    priority: int
    unit: str
    is_active: bool

    model_config = {"from_attributes": True}


class ConsumptionByGasResponse(BaseModel):
    """Response model for consumption grouped by gas type."""
    gas_id: str
    gas_name: str
    short_name: str
    total_consumption: Optional[float] = None
    consumer_count: int
    data_status: str  # 'Complete' or 'Consumption Data Unavailable'
    consumers: list[ConsumerResponse]


class InternalExternalSummary(BaseModel):
    """Summary of internal vs external consumption."""
    gas_id: str
    internal_count: int
    internal_consumption: float
    external_count: int
    external_consumption: float
