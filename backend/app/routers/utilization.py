"""
Utilization & Network & Alerts Routers
=======================================
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.gas_service import GasService
from backend.app.schemas.gas import UtilizationResponse, NetworkResponse, AlertResponse

router = APIRouter(prefix="/api", tags=["Utilization & Network"])


@router.get("/utilization", response_model=list[UtilizationResponse])
def get_utilization(db: Session = Depends(get_db)):
    """Get utilization metrics for all gas types."""
    service = AnalyticsService(db)
    return service.get_utilization()


@router.get("/network", response_model=NetworkResponse)
def get_network(gas_type_id: str = Query(None, description="Filter by gas type"), db: Session = Depends(get_db)):
    """Get gas network topology for visualization."""
    service = AnalyticsService(db)
    return service.get_network(gas_type_id.upper() if gas_type_id else None)


@router.get("/alerts", response_model=list[AlertResponse])
def get_alerts(
    include_resolved: bool = Query(False, description="Include resolved alerts"),
    db: Session = Depends(get_db),
):
    """Get all active alerts."""
    service = GasService(db)
    return service.get_all_alerts(include_resolved)
