"""
Simulation Schemas
===================

Pydantic models for simulation requests and responses.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GeneratorFailureRequest(BaseModel):
    """Request model for generator failure simulation."""
    gas_type_id: str = Field(..., description="Gas type to simulate (BFG, COG, LDG)")
    source_id: str = Field(..., description="Generation source ID to fail")
    failure_percentage: float = Field(..., ge=0, le=100, description="Failure percentage (0-100)")
    allocation_strategy: str = Field(
        default="proportional",
        description="Allocation strategy: priority, equal, proportional, custom"
    )
    scenario_name: Optional[str] = Field(
        default=None,
        description="Optional name to save the scenario"
    )


class ConsumerFailureRequest(BaseModel):
    """Request model for consumer failure/shutdown simulation."""
    gas_type_id: str = Field(..., description="Gas type to simulate (BFG, COG)")
    consumer_id: str = Field(..., description="Consumer ID to shut down")
    shutdown_percentage: float = Field(..., ge=0, le=100, description="Shutdown percentage (0-100)")
    scenario_name: Optional[str] = Field(
        default=None,
        description="Optional name to save the scenario"
    )


class AffectedConsumer(BaseModel):
    """Details of a consumer affected by a simulation."""
    consumer_id: str
    consumer_name: str
    consumer_type: str
    original_demand: float
    allocated_amount: float
    deficit: float
    impact_percentage: float  # How much demand is unmet


class SimulationResultResponse(BaseModel):
    """Response model for simulation results."""
    scenario_name: str
    scenario_type: str
    gas_type_id: str
    target_id: str
    target_name: str
    failure_percentage: float
    allocation_strategy: str

    # Generation metrics
    original_generation: float
    available_generation: float
    generation_loss: float

    # Demand metrics
    total_demand: float
    deficit: float
    surplus: float

    # Utilization
    original_utilization: Optional[float] = None
    new_utilization: Optional[float] = None

    # Consumer impact
    affected_consumers: list[AffectedConsumer]
    total_affected_count: int
    fully_supplied_count: int
    partially_supplied_count: int
    zero_supply_count: int


class ScenarioSummaryResponse(BaseModel):
    """Summary of a saved scenario."""
    id: int
    scenario_name: str
    scenario_type: str
    gas_type_id: str
    target_id: str
    failure_percentage: float
    allocation_strategy: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ScenarioComparisonRequest(BaseModel):
    """Request to compare two scenarios."""
    scenario_ids: list[int] = Field(..., min_length=2, max_length=5)
