"""
Simulation Repository
======================

Data access for simulation scenarios and results.
"""

from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models.simulation import SimulationScenario, SimulationResult


class SimulationRepository:
    """Repository for simulation data operations."""

    def __init__(self, db: Session):
        self.db = db

    def save_scenario(self, scenario: SimulationScenario) -> SimulationScenario:
        """Save a simulation scenario."""
        self.db.add(scenario)
        self.db.commit()
        self.db.refresh(scenario)
        return scenario

    def save_result(self, result: SimulationResult) -> SimulationResult:
        """Save a simulation result."""
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def get_all_scenarios(self) -> list[SimulationScenario]:
        """Get all saved scenarios."""
        return (
            self.db.query(SimulationScenario)
            .order_by(SimulationScenario.created_at.desc())
            .all()
        )

    def get_scenario_by_id(self, scenario_id: int) -> Optional[SimulationScenario]:
        """Get a scenario by ID with its results."""
        return (
            self.db.query(SimulationScenario)
            .filter(SimulationScenario.id == scenario_id)
            .first()
        )

    def get_results_by_scenario(self, scenario_id: int) -> list[SimulationResult]:
        """Get all results for a scenario."""
        return (
            self.db.query(SimulationResult)
            .filter(SimulationResult.scenario_id == scenario_id)
            .all()
        )

    def delete_scenario(self, scenario_id: int) -> bool:
        """Delete a scenario and its results."""
        scenario = self.get_scenario_by_id(scenario_id)
        if scenario:
            self.db.delete(scenario)
            self.db.commit()
            return True
        return False
