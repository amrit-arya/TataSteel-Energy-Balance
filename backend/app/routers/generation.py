"""
Generation Router
==================

Endpoints for gas generation data.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.generation import GenerationByGasResponse

router = APIRouter(prefix="/api", tags=["Generation"])


@router.get("/generation", response_model=list[GenerationByGasResponse])
def get_all_generation(db: Session = Depends(get_db)):
    """Get all generation data grouped by gas type."""
    service = AnalyticsService(db)
    return service.get_all_generation()


@router.get("/generation/{gas_type_id}", response_model=GenerationByGasResponse)
def get_generation_by_gas(gas_type_id: str, db: Session = Depends(get_db)):
    """Get generation data for a specific gas type."""
    try:
        service = AnalyticsService(db)
        return service.get_generation_by_gas(gas_type_id.upper())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
