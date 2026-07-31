"""
Data Validation Module
======================

Purpose:
    Validate processed data for quality, integrity, and consistency.
    Ensures no fabricated data, no duplicates, no negative values,
    and all totals match the original Excel formulas.

Architecture Decision:
    Validation is a separate step from processing because:
    1. It can be re-run independently without re-processing
    2. Validation rules can be extended without modifying extraction logic
    3. It provides a clear quality gate before data enters the database

Validation Rules:
    1. No duplicate IDs (source_id, consumer_id)
    2. No missing required values (gas_type_id, names, generation values)
    3. No negative generation or consumption values
    4. Valid gas_type_id references (must be BFG, COG, or LDG)
    5. BF Gas totals match Excel formulas
    6. CO Gas totals match Excel formulas
    7. LD Gas totals match Excel formulas
    8. LD Gas has NO consumers (consumption data unavailable)
    9. Consumer types are only 'Internal' or 'External'
    10. Cross-referential integrity between DataFrames

Usage:
    python -m analytics.validate_data
"""

import sys
from pathlib import Path
from dataclasses import dataclass, field

import pandas as pd


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PROCESSED_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"

VALID_GAS_IDS = {"BFG", "COG", "LDG"}
VALID_CONSUMER_TYPES = {"Internal", "External"}

# Expected totals from Excel formula verification
EXPECTED_TOTALS = {
    "BFG": {
        "total_generation": 1721200.0,
        "total_internal_consumption": 536000.0,
        "total_external_consumption": 1200000.0,
        "total_consumption": 1736000.0,
    },
    "COG": {
        "total_generation": 142000.0,
        "total_consumption": 134600.0,
    },
    "LDG": {
        "total_generation": 150000.0,
        # No consumption data available
    },
}


# ---------------------------------------------------------------------------
# Validation Result
# ---------------------------------------------------------------------------

@dataclass
class ValidationResult:
    """Holds the results of a validation check."""
    check_name: str
    passed: bool
    message: str
    severity: str = "ERROR"  # ERROR, WARNING, INFO


@dataclass
class ValidationReport:
    """Aggregated validation report."""
    results: list[ValidationResult] = field(default_factory=list)

    def add(self, result: ValidationResult) -> None:
        self.results.append(result)

    @property
    def total_checks(self) -> int:
        return len(self.results)

    @property
    def passed_checks(self) -> int:
        return sum(1 for r in self.results if r.passed)

    @property
    def failed_checks(self) -> int:
        return sum(1 for r in self.results if not r.passed)

    @property
    def has_errors(self) -> bool:
        return any(not r.passed and r.severity == "ERROR" for r in self.results)

    @property
    def has_warnings(self) -> bool:
        return any(not r.passed and r.severity == "WARNING" for r in self.results)

    def print_report(self) -> None:
        """Print formatted validation report."""
        print("=" * 60)
        print("DATA VALIDATION REPORT")
        print("=" * 60)
        print()

        for result in self.results:
            icon = "[PASS]" if result.passed else "[FAIL]"
            severity_tag = f"[{result.severity}]" if not result.passed else ""
            print(f"  {icon} {result.check_name} {severity_tag}")
            if not result.passed:
                print(f"    -> {result.message}")

        print()
        print(f"  Total Checks: {self.total_checks}")
        print(f"  Passed:       {self.passed_checks}")
        print(f"  Failed:       {self.failed_checks}")
        print()

        if self.has_errors:
            print("  [FAIL] VALIDATION FAILED - Errors detected")
        elif self.has_warnings:
            print("  [WARN] VALIDATION PASSED WITH WARNINGS")
        else:
            print("  [PASS] ALL VALIDATIONS PASSED")
        print()


# ---------------------------------------------------------------------------
# Validation Functions
# ---------------------------------------------------------------------------

def validate_no_duplicate_ids(df: pd.DataFrame, id_column: str, dataset_name: str) -> ValidationResult:
    """Check that all IDs in the specified column are unique."""
    duplicates = df[df.duplicated(subset=[id_column], keep=False)]
    if len(duplicates) > 0:
        dup_ids = duplicates[id_column].tolist()
        return ValidationResult(
            check_name=f"No duplicate {id_column} in {dataset_name}",
            passed=False,
            message=f"Found {len(duplicates)} duplicate IDs: {dup_ids}",
        )
    return ValidationResult(
        check_name=f"No duplicate {id_column} in {dataset_name}",
        passed=True,
        message="",
    )


def validate_no_missing_values(
    df: pd.DataFrame, columns: list[str], dataset_name: str
) -> ValidationResult:
    """Check that required columns have no missing values."""
    missing = {}
    for col in columns:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            missing[col] = int(null_count)

    if missing:
        return ValidationResult(
            check_name=f"No missing required values in {dataset_name}",
            passed=False,
            message=f"Missing values found: {missing}",
        )
    return ValidationResult(
        check_name=f"No missing required values in {dataset_name}",
        passed=True,
        message="",
    )


def validate_no_negative_values(
    df: pd.DataFrame, columns: list[str], dataset_name: str
) -> ValidationResult:
    """Check that numeric columns have no negative values."""
    negatives = {}
    for col in columns:
        # Skip NaN values (they represent unavailable data, not negative values)
        negative_mask = df[col].dropna() < 0
        neg_count = negative_mask.sum()
        if neg_count > 0:
            negatives[col] = int(neg_count)

    if negatives:
        return ValidationResult(
            check_name=f"No negative values in {dataset_name}",
            passed=False,
            message=f"Negative values found: {negatives}",
        )
    return ValidationResult(
        check_name=f"No negative values in {dataset_name}",
        passed=True,
        message="",
    )


def validate_valid_gas_ids(df: pd.DataFrame, column: str, dataset_name: str) -> ValidationResult:
    """Check that all gas IDs reference valid gas types."""
    invalid_ids = set(df[column].unique()) - VALID_GAS_IDS
    if invalid_ids:
        return ValidationResult(
            check_name=f"Valid gas IDs in {dataset_name}",
            passed=False,
            message=f"Invalid gas IDs found: {invalid_ids}",
        )
    return ValidationResult(
        check_name=f"Valid gas IDs in {dataset_name}",
        passed=True,
        message="",
    )


def validate_consumer_types(df: pd.DataFrame) -> ValidationResult:
    """Check that consumer types are only 'Internal' or 'External'."""
    invalid_types = set(df["consumer_type"].unique()) - VALID_CONSUMER_TYPES
    if invalid_types:
        return ValidationResult(
            check_name="Valid consumer types",
            passed=False,
            message=f"Invalid consumer types found: {invalid_types}",
        )
    return ValidationResult(
        check_name="Valid consumer types",
        passed=True,
        message="",
    )


def validate_bf_gas_totals(df_sources: pd.DataFrame, df_consumers: pd.DataFrame) -> list[ValidationResult]:
    """Validate BF Gas totals match expected values from Excel formulas."""
    results = []
    expected = EXPECTED_TOTALS["BFG"]

    # Total BF generation
    bf_gen = df_sources[df_sources["gas_type_id"] == "BFG"]["generation_value"].sum()
    results.append(ValidationResult(
        check_name="BF Gas total generation matches Excel",
        passed=abs(bf_gen - expected["total_generation"]) < 0.01,
        message=f"Expected {expected['total_generation']}, got {bf_gen}",
    ))

    # BF internal consumption
    bf_int_cons = df_consumers[
        (df_consumers["gas_type_id"] == "BFG") &
        (df_consumers["consumer_type"] == "Internal")
    ]["consumption_value"].sum()
    results.append(ValidationResult(
        check_name="BF Gas internal consumption matches Excel",
        passed=abs(bf_int_cons - expected["total_internal_consumption"]) < 0.01,
        message=f"Expected {expected['total_internal_consumption']}, got {bf_int_cons}",
    ))

    # BF external consumption
    bf_ext_cons = df_consumers[
        (df_consumers["gas_type_id"] == "BFG") &
        (df_consumers["consumer_type"] == "External")
    ]["consumption_value"].sum()
    results.append(ValidationResult(
        check_name="BF Gas external consumption matches Excel",
        passed=abs(bf_ext_cons - expected["total_external_consumption"]) < 0.01,
        message=f"Expected {expected['total_external_consumption']}, got {bf_ext_cons}",
    ))

    # BF total consumption
    bf_total_cons = bf_int_cons + bf_ext_cons
    results.append(ValidationResult(
        check_name="BF Gas total consumption matches Excel",
        passed=abs(bf_total_cons - expected["total_consumption"]) < 0.01,
        message=f"Expected {expected['total_consumption']}, got {bf_total_cons}",
    ))

    return results


def validate_co_gas_totals(df_sources: pd.DataFrame, df_consumers: pd.DataFrame) -> list[ValidationResult]:
    """Validate CO Gas totals match expected values from Excel formulas."""
    results = []
    expected = EXPECTED_TOTALS["COG"]

    # Total CO generation
    co_gen = df_sources[df_sources["gas_type_id"] == "COG"]["generation_value"].sum()
    results.append(ValidationResult(
        check_name="CO Gas total generation matches Excel",
        passed=abs(co_gen - expected["total_generation"]) < 0.01,
        message=f"Expected {expected['total_generation']}, got {co_gen}",
    ))

    # Total CO consumption
    co_cons = df_consumers[df_consumers["gas_type_id"] == "COG"]["consumption_value"].sum()
    results.append(ValidationResult(
        check_name="CO Gas total consumption matches Excel",
        passed=abs(co_cons - expected["total_consumption"]) < 0.01,
        message=f"Expected {expected['total_consumption']}, got {co_cons}",
    ))

    return results


def validate_ld_gas_totals(df_sources: pd.DataFrame, df_consumers: pd.DataFrame) -> list[ValidationResult]:
    """Validate LD Gas totals and confirm NO consumption data."""
    results = []
    expected = EXPECTED_TOTALS["LDG"]

    # Total LD generation
    ld_gen = df_sources[df_sources["gas_type_id"] == "LDG"]["generation_value"].sum()
    results.append(ValidationResult(
        check_name="LD Gas total generation matches Excel",
        passed=abs(ld_gen - expected["total_generation"]) < 0.01,
        message=f"Expected {expected['total_generation']}, got {ld_gen}",
    ))

    # LD Gas must have NO consumers
    ld_consumers = df_consumers[df_consumers["gas_type_id"] == "LDG"]
    results.append(ValidationResult(
        check_name="LD Gas has NO consumption data (as per workbook)",
        passed=len(ld_consumers) == 0,
        message=f"Expected 0 LD consumers, found {len(ld_consumers)}. "
                "The workbook does not contain LD Gas consumption data.",
    ))

    return results


def validate_record_counts(df_sources: pd.DataFrame, df_consumers: pd.DataFrame) -> list[ValidationResult]:
    """Validate expected record counts from the workbook."""
    results = []

    # BF Gas sources: 6 furnaces
    bf_sources = len(df_sources[df_sources["gas_type_id"] == "BFG"])
    results.append(ValidationResult(
        check_name="BF Gas has 6 generation sources",
        passed=bf_sources == 6,
        message=f"Expected 6, got {bf_sources}",
    ))

    # CO Gas sources: 2 plants
    co_sources = len(df_sources[df_sources["gas_type_id"] == "COG"])
    results.append(ValidationResult(
        check_name="CO Gas has 2 generation sources",
        passed=co_sources == 2,
        message=f"Expected 2, got {co_sources}",
    ))

    # LD Gas sources: 2 plants
    ld_sources = len(df_sources[df_sources["gas_type_id"] == "LDG"])
    results.append(ValidationResult(
        check_name="LD Gas has 2 generation sources",
        passed=ld_sources == 2,
        message=f"Expected 2, got {ld_sources}",
    ))

    # BF Gas consumers: 6 internal + 9 external = 15
    bf_consumers = len(df_consumers[df_consumers["gas_type_id"] == "BFG"])
    results.append(ValidationResult(
        check_name="BF Gas has 15 consumers (6 internal + 9 external)",
        passed=bf_consumers == 15,
        message=f"Expected 15, got {bf_consumers}",
    ))

    # CO Gas consumers: 18 external
    co_consumers = len(df_consumers[df_consumers["gas_type_id"] == "COG"])
    results.append(ValidationResult(
        check_name="CO Gas has 18 consumers",
        passed=co_consumers == 18,
        message=f"Expected 18, got {co_consumers}",
    ))

    return results


# ---------------------------------------------------------------------------
# Main Validation Pipeline
# ---------------------------------------------------------------------------

def load_processed_data() -> dict[str, pd.DataFrame]:
    """Load processed CSVs into DataFrames."""
    files = {
        "gas_types": PROCESSED_DATA_DIR / "gas_types.csv",
        "generation_sources": PROCESSED_DATA_DIR / "generation_sources.csv",
        "consumers": PROCESSED_DATA_DIR / "consumers.csv",
    }

    dataframes = {}
    for name, filepath in files.items():
        if not filepath.exists():
            print(f"ERROR: Required file not found: {filepath}")
            sys.exit(1)
        dataframes[name] = pd.read_csv(filepath)
        print(f"  Loaded: {filepath} ({len(dataframes[name])} rows)")

    return dataframes


def run_validation(dataframes: dict[str, pd.DataFrame] = None) -> ValidationReport:
    """
    Run the complete validation pipeline.

    Args:
        dataframes: Optional dict of DataFrames. If None, loads from CSV files.

    Returns:
        ValidationReport with all check results.
    """
    if dataframes is None:
        print("Loading processed data...")
        dataframes = load_processed_data()
        print()

    df_gas_types = dataframes["gas_types"]
    df_sources = dataframes["generation_sources"]
    df_consumers = dataframes["consumers"]

    report = ValidationReport()

    # -- Structural Validations ------------------------------------------

    # Duplicate ID checks
    report.add(validate_no_duplicate_ids(df_sources, "source_id", "generation_sources"))
    report.add(validate_no_duplicate_ids(df_consumers, "consumer_id", "consumers"))
    report.add(validate_no_duplicate_ids(df_gas_types, "gas_id", "gas_types"))

    # Missing value checks
    report.add(validate_no_missing_values(
        df_sources,
        ["source_id", "gas_type_id", "source_name", "generation_value"],
        "generation_sources",
    ))
    report.add(validate_no_missing_values(
        df_consumers,
        ["consumer_id", "gas_type_id", "consumer_name", "consumer_type"],
        "consumers",
    ))
    # Note: consumption_value is NOT required - it's NULL for unavailable data

    # Negative value checks
    report.add(validate_no_negative_values(df_sources, ["generation_value"], "generation_sources"))
    report.add(validate_no_negative_values(df_consumers, ["consumption_value"], "consumers"))

    # Referential integrity
    report.add(validate_valid_gas_ids(df_sources, "gas_type_id", "generation_sources"))
    report.add(validate_valid_gas_ids(df_consumers, "gas_type_id", "consumers"))
    report.add(validate_consumer_types(df_consumers))

    # -- Record Count Validations ----------------------------------------

    for result in validate_record_counts(df_sources, df_consumers):
        report.add(result)

    # -- Total Value Validations -----------------------------------------

    for result in validate_bf_gas_totals(df_sources, df_consumers):
        report.add(result)

    for result in validate_co_gas_totals(df_sources, df_consumers):
        report.add(result)

    for result in validate_ld_gas_totals(df_sources, df_consumers):
        report.add(result)

    return report


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("FUEL MANAGEMENT - DATA VALIDATION")
    print("=" * 60)
    print()

    report = run_validation()
    report.print_report()

    if report.has_errors:
        sys.exit(1)
