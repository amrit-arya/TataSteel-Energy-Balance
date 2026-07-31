"""
Gas Type Schemas
=================

Pydantic models for gas type responses and the overview dashboard.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class GasTypeResponse(BaseModel):
    """Response model for a gas type."""
    id: str
    gas_name: str
    short_name: str
    description: str = ""

    model_config = {"from_attributes": True}


class GasBalanceResponse(BaseModel):
    """Response model for gas balance per type."""
    gas_id: str
    gas_name: str
    short_name: str
    total_generation: float
    total_consumption: Optional[float] = None
    balance: Optional[float] = None
    utilization_percentage: Optional[float] = None
    data_status: str  # 'Complete' or 'Consumption Data Unavailable'


class OverviewKPI(BaseModel):
    """Response model for the overview dashboard KPIs."""
    total_generation: float
    total_consumption: Optional[float] = None
    net_balance: Optional[float] = None
    overall_utilization: Optional[float] = None
    total_sources: int
    total_consumers: int
    critical_alerts: int
    warning_alerts: int
    healthy_systems: int
    gas_balances: list[GasBalanceResponse]


class UtilizationResponse(BaseModel):
    """Response model for gas utilization metrics."""
    gas_id: str
    gas_name: str
    short_name: str
    total_generation: float
    total_consumption: Optional[float] = None
    utilization_percentage: Optional[float] = None
    data_status: str
    threshold_status: str  # 'normal', 'warning', 'critical', 'unavailable'


class NetworkNodeResponse(BaseModel):
    """A node in the gas network visualization."""
    id: str
    label: str
    type: str  # 'generator', 'pool', 'consumer'
    gas_type_id: str
    value: Optional[float] = None
    consumer_type: Optional[str] = None
    metadata: dict = {}


class NetworkEdgeResponse(BaseModel):
    """An edge in the gas network visualization."""
    id: str
    source: str
    target: str
    value: Optional[float] = None
    gas_type_id: str


class NetworkResponse(BaseModel):
    """Complete gas network topology for visualization."""
    nodes: list[NetworkNodeResponse]
    edges: list[NetworkEdgeResponse]


class AlertResponse(BaseModel):
    """Response model for an alert."""
    id: int
    alert_type: str
    severity: str
    gas_type_id: Optional[str] = None
    title: str
    message: str
    is_resolved: bool
    created_at: datetime

    model_config = {"from_attributes": True}
