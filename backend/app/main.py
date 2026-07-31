"""
FastAPI Application Entry Point
=================================

Fuel Gas Management Intelligence Dashboard - Backend API

This module creates and configures the FastAPI application with:
    - CORS middleware for frontend communication
    - All API routers registered under /api prefix
    - Database initialization at startup
    - Health check endpoint
    - Swagger/ReDoc auto-documentation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import get_settings
from backend.app.database import init_db

# Import routers
from backend.app.routers.overview import router as overview_router
from backend.app.routers.generation import router as generation_router
from backend.app.routers.consumption import router as consumption_router
from backend.app.routers.gas_balance import router as gas_balance_router
from backend.app.routers.utilization import router as utilization_router
from backend.app.routers.simulation import router as simulation_router


def create_app() -> FastAPI:
    """
    Application factory pattern.

    Creates and configures the FastAPI instance with all middleware,
    routers, and event handlers.
    """
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Fuel Gas Management Intelligence & Impact Simulation Dashboard API. "
            "Provides endpoints for gas generation, consumption, balance analysis, "
            "utilization monitoring, network visualization, and failure simulation."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS Middleware ────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Event Handlers ─────────────────────────────────────────

    @app.on_event("startup")
    async def startup_event():
        """Initialize database tables on startup."""
        init_db()

    # ── Health Check ───────────────────────────────────────────

    @app.get("/health", tags=["System"])
    def health_check():
        """Health check endpoint for monitoring."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    # ── Register Routers ───────────────────────────────────────

    app.include_router(overview_router)
    app.include_router(generation_router)
    app.include_router(consumption_router)
    app.include_router(gas_balance_router)
    app.include_router(utilization_router)
    app.include_router(simulation_router)

    return app


# Create the application instance
app = create_app()
