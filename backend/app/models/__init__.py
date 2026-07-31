"""
SQLAlchemy ORM Models
======================

This package registers all ORM models with SQLAlchemy's Base.metadata.
Importing this package ensures all models are available for table creation.
"""

from backend.app.models.gas_type import GasType
from backend.app.models.generation_source import GenerationSource
from backend.app.models.consumer import Consumer
from backend.app.models.simulation import SimulationScenario, SimulationResult
from backend.app.models.alert import Alert, AuditLog

__all__ = [
    "GasType",
    "GenerationSource",
    "Consumer",
    "SimulationScenario",
    "SimulationResult",
    "Alert",
    "AuditLog",
]
