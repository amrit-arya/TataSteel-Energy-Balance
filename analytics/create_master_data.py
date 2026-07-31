"""
Master Data Creation Module
============================

Purpose:
    Generate the final master datasets including gas balance summary,
    utilization calculations, and the comprehensive final summary.

Architecture Decision:
    This module runs AFTER validation passes. It computes derived metrics
    (balance, utilization) and creates the final CSV datasets that will
    seed the database.

    For LD Gas, where consumption data is unavailable:
    - balance is NULL (not zero)
    - utilization is NULL (not zero)
    - data_status is "Consumption Data Unavailable"
    - The dashboard must display "Data Unavailable" for these fields

Usage:
    python -m analytics.create_master_data
"""

import sys
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PROCESSED_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

DATA_STATUS_COMPLETE = "Complete"
DATA_STATUS_UNAVAILABLE = "Consumption Data Unavailable"


# ---------------------------------------------------------------------------
# Master Data Generation
# ---------------------------------------------------------------------------

def create_generation_master(df_sources: pd.DataFrame) -> pd.DataFrame:
    """
    Create the generation master dataset with enriched columns.

    Adds:
        - is_active: Boolean, default True
        - percentage_of_total: Each source's share of its gas type's total generation
    """
    df = df_sources.copy()
    df["is_active"] = True

    # Calculate percentage of total per gas type
    gas_totals = df.groupby("gas_type_id")["generation_value"].transform("sum")
    df["percentage_of_total"] = (df["generation_value"] / gas_totals * 100).round(2)

    return df


def create_consumer_master(df_consumers: pd.DataFrame) -> pd.DataFrame:
    """
    Create the consumer master dataset with enriched columns.

    Adds:
        - is_active: Boolean, default True
        - percentage_of_total: Each consumer's share of its gas type's total consumption
    """
    df = df_consumers.copy()
    df["is_active"] = True

    # Calculate percentage of total per gas type
    # Only for rows where consumption_value is not null
    for gas_id in df["gas_type_id"].unique():
        mask = df["gas_type_id"] == gas_id
        gas_total = df.loc[mask, "consumption_value"].sum()
        if gas_total > 0:
            df.loc[mask, "percentage_of_total"] = (
                df.loc[mask, "consumption_value"] / gas_total * 100
            ).round(2)
        else:
            df.loc[mask, "percentage_of_total"] = np.nan

    return df


def create_gas_balance_summary(
    df_gas_types: pd.DataFrame,
    df_sources: pd.DataFrame,
    df_consumers: pd.DataFrame,
) -> pd.DataFrame:
    """
    Create the gas balance summary with generation, consumption, balance,
    and utilization for each gas type.

    Rules:
        - LD Gas: consumption, balance, utilization are all NULL
        - BF Gas: May show deficit (consumption > generation) — this is real data
        - Utilization = (consumption / generation) × 100
    """
    rows = []

    for _, gas_type in df_gas_types.iterrows():
        gas_id = gas_type["gas_id"]

        # Total generation for this gas type
        total_generation = df_sources[
            df_sources["gas_type_id"] == gas_id
        ]["generation_value"].sum()

        # Total consumption for this gas type
        gas_consumers = df_consumers[df_consumers["gas_type_id"] == gas_id]

        if len(gas_consumers) == 0:
            # No consumption data available (LD Gas case)
            total_consumption = None
            balance = None
            utilization = None
            data_status = DATA_STATUS_UNAVAILABLE
        else:
            total_consumption = gas_consumers["consumption_value"].sum()
            balance = total_generation - total_consumption
            utilization = round((total_consumption / total_generation) * 100, 2) if total_generation > 0 else 0.0
            data_status = DATA_STATUS_COMPLETE

        rows.append({
            "gas_id": gas_id,
            "total_generation": total_generation,
            "total_consumption": total_consumption,
            "balance": balance,
            "utilization_percentage": utilization,
            "data_status": data_status,
        })

    return pd.DataFrame(rows)


def create_final_gas_summary(
    df_gas_types: pd.DataFrame,
    df_balance: pd.DataFrame,
) -> pd.DataFrame:
    """
    Create the comprehensive final gas summary joining gas types with balance data.
    """
    df = df_gas_types.merge(df_balance, on="gas_id", how="left")
    return df


def create_internal_vs_external_summary(df_consumers: pd.DataFrame) -> pd.DataFrame:
    """
    Create a summary of internal vs external consumption per gas type.

    This is useful for BF Gas which has both internal and external consumers.
    """
    summary = df_consumers.groupby(
        ["gas_type_id", "consumer_type"]
    ).agg(
        consumer_count=("consumer_id", "count"),
        total_consumption=("consumption_value", "sum"),
    ).reset_index()

    return summary


# ---------------------------------------------------------------------------
# Save Master Data
# ---------------------------------------------------------------------------

def save_master_data(datasets: dict[str, pd.DataFrame]) -> None:
    """Save all master datasets to CSV files."""
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

    for name, df in datasets.items():
        filepath = PROCESSED_DATA_DIR / f"{name}.csv"
        df.to_csv(filepath, index=False)
        print(f"  Saved: {filepath} ({len(df)} rows)")


# ---------------------------------------------------------------------------
# Main Pipeline
# ---------------------------------------------------------------------------

def create_master_datasets(dataframes: dict[str, pd.DataFrame] = None) -> dict[str, pd.DataFrame]:
    """
    Create all master datasets from processed data.

    Args:
        dataframes: Optional dict of base DataFrames. If None, loads from CSV.

    Returns:
        Dict of master dataset DataFrames.
    """
    if dataframes is None:
        print("Loading processed data...")
        dataframes = {
            "gas_types": pd.read_csv(PROCESSED_DATA_DIR / "gas_types.csv"),
            "generation_sources": pd.read_csv(PROCESSED_DATA_DIR / "generation_sources.csv"),
            "consumers": pd.read_csv(PROCESSED_DATA_DIR / "consumers.csv"),
        }
        print()

    df_gas_types = dataframes["gas_types"]
    df_sources = dataframes["generation_sources"]
    df_consumers = dataframes["consumers"]

    # Create enriched master datasets
    print("Creating master datasets...")

    generation_master = create_generation_master(df_sources)
    print(f"  Generation master: {len(generation_master)} records")

    consumer_master = create_consumer_master(df_consumers)
    print(f"  Consumer master: {len(consumer_master)} records")

    gas_balance_summary = create_gas_balance_summary(df_gas_types, df_sources, df_consumers)
    print(f"  Gas balance summary: {len(gas_balance_summary)} records")

    final_gas_summary = create_final_gas_summary(df_gas_types, gas_balance_summary)
    print(f"  Final gas summary: {len(final_gas_summary)} records")

    internal_external_summary = create_internal_vs_external_summary(df_consumers)
    print(f"  Internal vs external summary: {len(internal_external_summary)} records")

    # Print summary table
    print()
    print("  Gas Balance Summary:")
    print("  " + "-" * 85)
    print(f"  {'Gas ID':<8} {'Generation':>15} {'Consumption':>15} {'Balance':>15} {'Utilization':>12} {'Status'}")
    print("  " + "-" * 85)
    for _, row in gas_balance_summary.iterrows():
        gen = f"{row['total_generation']:,.0f}" if pd.notna(row['total_generation']) else "N/A"
        cons = f"{row['total_consumption']:,.0f}" if pd.notna(row['total_consumption']) else "Data Unavailable"
        bal = f"{row['balance']:,.0f}" if pd.notna(row['balance']) else "Data Unavailable"
        util = f"{row['utilization_percentage']:.2f}%" if pd.notna(row['utilization_percentage']) else "Data Unavailable"
        status = row['data_status']
        print(f"  {row['gas_id']:<8} {gen:>15} {cons:>15} {bal:>15} {util:>12} {status}")
    print("  " + "-" * 85)
    print()

    return {
        "generation_master": generation_master,
        "consumer_master": consumer_master,
        "gas_balance_summary": gas_balance_summary,
        "final_gas_summary": final_gas_summary,
        "internal_external_summary": internal_external_summary,
    }


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("FUEL MANAGEMENT - MASTER DATA CREATION")
    print("=" * 60)
    print()

    master_datasets = create_master_datasets()

    print("Saving master datasets...")
    save_master_data(master_datasets)

    print()
    print("Master data creation complete.")
    print("=" * 60)
