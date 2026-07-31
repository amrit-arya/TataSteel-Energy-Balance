"""
Generation Schemas
===================

Pydantic models for generation source responses.
"""

from typing import Optional
from pydantic import BaseModel


class GenerationSourceResponse(BaseModel):
    """Response model for a single generation source."""
    id: str
    gas_type_id: str
    source_name: str
    plant_area: str
    generation_value: float
    unit: str
    is_active: bool

    model_config = {"from_attributes": True}


class GenerationByGasResponse(BaseModel):
    """Response model for generation grouped by gas type."""
    gas_id: str
    gas_name: str
    short_name: str
    total_generation: float
    source_count: int
    sources: list[GenerationSourceResponse]
