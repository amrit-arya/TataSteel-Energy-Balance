"""
Overview Router
================

Endpoint: GET /api/overview

Returns the dashboard overview KPIs including:
    - Total generation, consumption, balance
    - Utilization percentage
    - Source and consumer counts
    - Alert counts
    - Per-gas balance breakdown
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.gas import OverviewKPI

router = APIRouter(prefix="/api", tags=["Overview"])


@router.get("/overview", response_model=OverviewKPI)
def get_overview(db: Session = Depends(get_db)):
    """Get dashboard overview KPIs."""
    service = AnalyticsService(db)
    return service.get_overview()
