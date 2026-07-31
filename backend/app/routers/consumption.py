"""
Consumption Router
===================

Endpoints for gas consumption data.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.consumption import ConsumptionByGasResponse

router = APIRouter(prefix="/api", tags=["Consumption"])


@router.get("/consumption", response_model=list[ConsumptionByGasResponse])
def get_all_consumption(db: Session = Depends(get_db)):
    """Get all consumption data grouped by gas type."""
    service = AnalyticsService(db)
    return service.get_all_consumption()


@router.get("/consumption/{gas_type_id}", response_model=ConsumptionByGasResponse)
def get_consumption_by_gas(gas_type_id: str, db: Session = Depends(get_db)):
    """Get consumption data for a specific gas type."""
    try:
        service = AnalyticsService(db)
        return service.get_consumption_by_gas(gas_type_id.upper())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
