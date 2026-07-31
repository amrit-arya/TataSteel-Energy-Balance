"""
Database Engine & Session Management
=====================================

Configures SQLAlchemy engine and session factory.

Architecture Decision:
    Using SQLAlchemy 2.0 style with:
    - Declarative base for ORM models
    - Session factory with dependency injection for FastAPI
    - Engine configured for SQLite (auto-creates directory)
    - PostgreSQL-ready: change DATABASE_URL and it just works

    The session uses 'expire_on_commit=False' so that objects
    remain usable after commit (important for API responses).
"""

from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session

from backend.app.config import get_settings


# ---------------------------------------------------------------------------
# SQLAlchemy Base
# ---------------------------------------------------------------------------

Base = declarative_base()


# ---------------------------------------------------------------------------
# Engine Setup
# ---------------------------------------------------------------------------

def get_engine():
    """
    Create and configure the SQLAlchemy engine.

    For SQLite:
        - Enables WAL mode for better concurrent read performance
        - Enables foreign key enforcement (off by default in SQLite)
        - Creates the database directory if it doesn't exist

    For PostgreSQL:
        - Uses connection pooling with default settings
    """
    settings = get_settings()
    db_url = settings.DATABASE_URL

    # SQLite-specific configuration
    if db_url.startswith("sqlite"):
        # Ensure database directory exists
        db_path = db_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
            echo=settings.DEBUG,
        )

        # Enable SQLite foreign keys and WAL mode
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()

    else:
        # PostgreSQL or other databases
        engine = create_engine(
            db_url,
            echo=settings.DEBUG,
            pool_size=10,
            max_overflow=20,
        )

    return engine


# ---------------------------------------------------------------------------
# Session Factory
# ---------------------------------------------------------------------------

engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=engine,
)


# ---------------------------------------------------------------------------
# Dependency Injection for FastAPI
# ---------------------------------------------------------------------------

def get_db() -> Session:
    """
    FastAPI dependency that provides a database session.

    Usage in routes:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...

    The session is automatically closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Database Initialization
# ---------------------------------------------------------------------------

def init_db():
    """
    Create all database tables from ORM models.

    This is called at application startup. SQLAlchemy's create_all
    is idempotent - it won't modify existing tables.
    """
    # Import all models so they register with Base.metadata
    import backend.app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
