"""
Application Configuration
=========================

Centralized configuration using Pydantic Settings.
Supports environment variables and .env files.

Architecture Decision:
    Using Pydantic Settings for type-safe configuration that:
    1. Validates config at startup (fail fast)
    2. Supports environment variable overrides for Docker
    3. Provides default values for local development
    4. Makes PostgreSQL migration a single env var change
"""

import os
from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application
    APP_NAME: str = "Fuel Gas Management Intelligence Dashboard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    # SQLite for development. Change to postgresql:// for production.
    DATABASE_URL: str = ""

    # CORS - allowed origins for frontend
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # API
    API_PREFIX: str = "/api"

    # Data paths
    DATA_DIR: str = ""
    RAW_DATA_DIR: str = ""
    PROCESSED_DATA_DIR: str = ""
    DATABASE_DIR: str = ""

    # Gas constants
    DEFAULT_UNIT: str = "Nm3/hr"
    DATA_UNAVAILABLE_LABEL: str = "Data Unavailable"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Compute paths relative to project root
        project_root = Path(__file__).resolve().parent.parent.parent

        if not self.DATA_DIR:
            self.DATA_DIR = str(project_root / "data")
        if not self.RAW_DATA_DIR:
            self.RAW_DATA_DIR = str(Path(self.DATA_DIR) / "raw")
        if not self.PROCESSED_DATA_DIR:
            self.PROCESSED_DATA_DIR = str(Path(self.DATA_DIR) / "processed")
        if not self.DATABASE_DIR:
            self.DATABASE_DIR = str(Path(self.DATA_DIR) / "database")

        # Set default SQLite path if not provided
        if not self.DATABASE_URL:
            db_path = Path(self.DATABASE_DIR) / "fuel_gas.db"
            self.DATABASE_URL = f"sqlite:///{db_path}"


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings (singleton pattern)."""
    return Settings()
