"""
Analytics Pipeline for Fuel Gas Management Dashboard.

This package contains the data processing pipeline that transforms
the raw Excel workbook into validated, structured datasets.

Pipeline steps:
    1. inspect_workbook  — Parse and inspect the raw Excel data
    2. process_data      — Extract and structure raw data into DataFrames
    3. validate_data     — Validate data quality and integrity
    4. create_master_data — Generate master CSVs and summary datasets
    5. seed_database     — Load processed data into SQLite database
"""
