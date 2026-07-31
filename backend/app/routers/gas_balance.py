"""
Gas Balance Router
===================

Endpoints for gas balance analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.gas import GasBalanceResponse

router = APIRouter(prefix="/api", tags=["Gas Balance"])


@router.get("/gas-balance", response_model=list[GasBalanceResponse])
def get_all_gas_balances(db: Session = Depends(get_db)):
    """Get gas balance summary for all gas types."""
    service = AnalyticsService(db)
    return service.get_all_gas_balances()


@router.get("/gas-balance/{gas_type_id}", response_model=GasBalanceResponse)
def get_gas_balance(gas_type_id: str, db: Session = Depends(get_db)):
    """Get gas balance for a specific gas type."""
    try:
        service = AnalyticsService(db)
        return service.get_gas_balance(gas_type_id.upper())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
