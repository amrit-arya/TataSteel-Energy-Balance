"""
Simulation Router
==================

Endpoints for running simulations and managing scenarios.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.simulation_service import SimulationService
from backend.app.schemas.simulation import (
    GeneratorFailureRequest,
    ConsumerFailureRequest,
    SimulationResultResponse,
    ScenarioSummaryResponse,
)

router = APIRouter(prefix="/api", tags=["Simulation"])


@router.post("/simulation/generator", response_model=SimulationResultResponse)
def simulate_generator_failure(
    request: GeneratorFailureRequest,
    db: Session = Depends(get_db),
):
    """Simulate a generator failure scenario."""
    try:
        service = SimulationService(db)
        return service.simulate_generator_failure(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulation/consumer", response_model=SimulationResultResponse)
def simulate_consumer_failure(
    request: ConsumerFailureRequest,
    db: Session = Depends(get_db),
):
    """Simulate a consumer shutdown scenario."""
    try:
        service = SimulationService(db)
        return service.simulate_consumer_failure(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/simulation/scenarios", response_model=list[ScenarioSummaryResponse])
def get_all_scenarios(db: Session = Depends(get_db)):
    """Get all saved simulation scenarios."""
    service = SimulationService(db)
    return service.get_all_scenarios()


@router.get("/simulation/scenarios/{scenario_id}")
def get_scenario_detail(scenario_id: int, db: Session = Depends(get_db)):
    """Get a scenario with its results."""
    try:
        service = SimulationService(db)
        return service.get_scenario_detail(scenario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
