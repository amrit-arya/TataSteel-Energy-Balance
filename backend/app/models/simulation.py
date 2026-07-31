"""
Simulation ORM Models
======================

Two related models for the simulation engine:

SimulationScenario:
    Stores the input parameters for a simulation run
    (which generator/consumer failed, by how much, which allocation strategy)

SimulationResult:
    Stores the computed output of a simulation run
    (available gas, deficit, affected consumers, allocations)

Design Note:
    affected_consumers and allocation_results are stored as JSON columns
    because their structure varies per simulation and doesn't warrant
    separate tables. SQLite supports JSON natively.
"""

from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.app.database import Base


class SimulationScenario(Base):
    """ORM model for simulation input parameters."""

    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_name = Column(String(200), nullable=False)
    scenario_type = Column(String(20), nullable=False)  # 'generator_failure' or 'consumer_failure'
    gas_type_id = Column(
        String(10),
        ForeignKey("gas_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_id = Column(String(20), nullable=False)  # Source ID or Consumer ID
    failure_percentage = Column(Float, nullable=False)  # 0 to 100
    allocation_strategy = Column(String(20), default="proportional")  # 'priority'/'equal'/'weighted'/'custom'
    parameters = Column(JSON, default=dict)  # Additional custom parameters
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    gas_type = relationship("GasType", back_populates="simulation_scenarios")
    results = relationship(
        "SimulationResult",
        back_populates="scenario",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<SimulationScenario(id={self.id}, "
            f"name='{self.scenario_name}', "
            f"type='{self.scenario_type}')>"
        )


class SimulationResult(Base):
    """ORM model for simulation computed results."""

    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_id = Column(
        Integer,
        ForeignKey("simulation_scenarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_generation = Column(Float, nullable=True)
    available_generation = Column(Float, nullable=True)
    total_demand = Column(Float, nullable=True)
    deficit = Column(Float, nullable=True)
    surplus = Column(Float, nullable=True)
    affected_consumers = Column(JSON, default=list)  # List of impacted consumer details
    allocation_results = Column(JSON, default=list)  # Per-consumer allocation breakdown
    utilization_percentage = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scenario = relationship("SimulationScenario", back_populates="results")

    def __repr__(self) -> str:
        return (
            f"<SimulationResult(id={self.id}, "
            f"scenario_id={self.scenario_id}, "
            f"deficit={self.deficit}, "
            f"surplus={self.surplus})>"
        )
