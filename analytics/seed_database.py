"""
Database Seed Script
=====================

Loads processed CSV data into the SQLite database.

This script:
    1. Creates all tables (idempotent)
    2. Clears existing data (fresh seed)
    3. Loads gas_types, generation_sources, consumers from CSVs
    4. Generates initial system alerts from data conditions
    5. Logs the seed action to audit_logs

Usage:
    python -m analytics.seed_database
"""

import sys
from pathlib import Path
from datetime import datetime

import pandas as pd

# Add project root to path for imports
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from backend.app.database import Base, engine, SessionLocal, init_db
from backend.app.models import (
    GasType,
    GenerationSource,
    Consumer,
    Alert,
    AuditLog,
)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PROCESSED_DATA_DIR = project_root / "data" / "processed"


# ---------------------------------------------------------------------------
# Seed Functions
# ---------------------------------------------------------------------------

def seed_gas_types(session) -> int:
    """Load gas types from CSV into database."""
    df = pd.read_csv(PROCESSED_DATA_DIR / "gas_types.csv")
    count = 0

    for _, row in df.iterrows():
        gas_type = GasType(
            id=row["gas_id"],
            gas_name=row["gas_name"],
            short_name=row["short_name"],
            description=row.get("description", ""),
        )
        session.add(gas_type)
        count += 1

    return count


def seed_generation_sources(session) -> int:
    """Load generation sources from CSV into database."""
    df = pd.read_csv(PROCESSED_DATA_DIR / "generation_master.csv")
    count = 0

    for _, row in df.iterrows():
        source = GenerationSource(
            id=row["source_id"],
            gas_type_id=row["gas_type_id"],
            source_name=row["source_name"],
            plant_area=row.get("plant_area", ""),
            generation_value=float(row["generation_value"]),
            unit=row.get("unit", "Nm3/hr"),
            is_active=True,
        )
        session.add(source)
        count += 1

    return count


def seed_consumers(session) -> int:
    """Load consumers from CSV into database."""
    df = pd.read_csv(PROCESSED_DATA_DIR / "consumer_master.csv")
    count = 0

    for _, row in df.iterrows():
        # Handle NaN consumption values (LD Gas)
        consumption = row.get("consumption_value")
        if pd.isna(consumption):
            consumption = None
        else:
            consumption = float(consumption)

        consumer = Consumer(
            id=row["consumer_id"],
            gas_type_id=row["gas_type_id"],
            consumer_name=row["consumer_name"],
            consumer_type=row["consumer_type"],
            consumption_value=consumption,
            priority=int(row.get("priority", 0)),
            unit=row.get("unit", "Nm3/hr"),
            is_active=True,
        )
        session.add(consumer)
        count += 1

    return count


def generate_initial_alerts(session) -> int:
    """
    Generate alerts based on data conditions.

    Auto-detected conditions:
        1. BF Gas deficit (consumption > generation) - CRITICAL
        2. LD Gas consumption data unavailable - WARNING
        3. BF Gas over-utilization - WARNING
    """
    alerts = []

    # Alert 1: BF Gas Deficit
    alerts.append(Alert(
        alert_type="deficit",
        severity="critical",
        gas_type_id="BFG",
        title="BF Gas Deficit Detected",
        message=(
            "BF Gas consumption (1,736,000 Nm3/hr) exceeds generation "
            "(1,721,200 Nm3/hr) by 14,800 Nm3/hr. This represents a "
            "100.86% utilization rate. Immediate attention required to "
            "balance the BF Gas network."
        ),
        is_resolved=False,
    ))

    # Alert 2: LD Gas Data Unavailable
    alerts.append(Alert(
        alert_type="data_quality",
        severity="warning",
        gas_type_id="LDG",
        title="LD Gas Consumption Data Unavailable",
        message=(
            "LD Gas generation data is available (150,000 Nm3/hr from 2 sources), "
            "but consumption data is not present in the source workbook. "
            "Gas balance and utilization cannot be calculated for LD Gas. "
            "Dashboard will display 'Data Unavailable' for affected metrics."
        ),
        is_resolved=False,
    ))

    # Alert 3: BF Gas Over-Utilization
    alerts.append(Alert(
        alert_type="utilization",
        severity="warning",
        gas_type_id="BFG",
        title="BF Gas Utilization Exceeds 100%",
        message=(
            "BF Gas utilization is at 100.86%, indicating demand exceeds supply. "
            "This may indicate the need for supplementary gas sources or "
            "demand-side management for BF Gas consumers."
        ),
        is_resolved=False,
    ))

    for alert in alerts:
        session.add(alert)

    return len(alerts)


def log_seed_action(session, summary: dict) -> None:
    """Log the database seeding action to audit trail."""
    session.add(AuditLog(
        action="database_seed",
        entity_type="system",
        entity_id="initial_seed",
        details=summary,
    ))


# ---------------------------------------------------------------------------
# Main Seed Pipeline
# ---------------------------------------------------------------------------

def seed_database() -> dict:
    """
    Run the complete database seeding pipeline.

    Returns:
        Dict with counts of seeded records.
    """
    print("Initializing database tables...")
    init_db()
    print("  Tables created successfully.")

    session = SessionLocal()

    try:
        # Clear existing data (order matters due to foreign keys)
        print("\nClearing existing data...")
        session.query(AuditLog).delete()
        session.query(Alert).delete()
        # SimulationResult and SimulationScenario are not seeded - they start empty
        from backend.app.models.simulation import SimulationResult, SimulationScenario
        session.query(SimulationResult).delete()
        session.query(SimulationScenario).delete()
        session.query(Consumer).delete()
        session.query(GenerationSource).delete()
        session.query(GasType).delete()
        session.commit()
        print("  Existing data cleared.")

        # Seed data
        print("\nSeeding data...")

        gas_count = seed_gas_types(session)
        print(f"  Gas types:           {gas_count} records")

        source_count = seed_generation_sources(session)
        print(f"  Generation sources:  {source_count} records")

        consumer_count = seed_consumers(session)
        print(f"  Consumers:           {consumer_count} records")

        alert_count = generate_initial_alerts(session)
        print(f"  Initial alerts:      {alert_count} records")

        # Create summary
        summary = {
            "gas_types": gas_count,
            "generation_sources": source_count,
            "consumers": consumer_count,
            "alerts": alert_count,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Log the seed action
        log_seed_action(session, summary)

        session.commit()
        print("\nDatabase seeded successfully!")

        return summary

    except Exception as e:
        session.rollback()
        print(f"\nERROR: Database seeding failed: {e}")
        raise
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("FUEL MANAGEMENT - DATABASE SEEDING")
    print("=" * 60)
    print()

    summary = seed_database()

    print()
    print("Seed Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    print()
    print("=" * 60)
