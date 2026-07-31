"""
Simulation Engine Unit Tests
=============================

Automated tests for generator failure and consumer shutdown simulation logic.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_generator_failure_simulation():
    """Test 50% failure simulation on Furnace I (BFG-GEN-001)."""
    payload = {
        "gas_type_id": "BFG",
        "source_id": "BFG-GEN-001",
        "failure_percentage": 50.0,
        "allocation_strategy": "proportional",
        "scenario_name": "Test Furnace I 50% Failure",
    }

    response = client.post("/api/simulation/generator", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["gas_type_id"] == "BFG"
    assert data["target_id"] == "BFG-GEN-001"
    assert data["generation_loss"] == 232500.0  # 50% of 465,000
    assert data["available_generation"] == 1488700.0
    assert data["deficit"] == 247300.0
    assert len(data["affected_consumers"]) == 15


def test_consumer_shutdown_simulation():
    """Test 100% shutdown simulation on Coke Plant (BFG-CON-EXT-005)."""
    payload = {
        "gas_type_id": "BFG",
        "consumer_id": "BFG-CON-EXT-005",
        "shutdown_percentage": 100.0,
        "scenario_name": "Test Coke Plant Shutdown",
    }

    response = client.post("/api/simulation/consumer", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["gas_type_id"] == "BFG"
    assert data["target_id"] == "BFG-CON-EXT-005"
    assert data["total_demand"] == 1466000.0  # 1,736,000 - 270,000
    assert data["surplus"] == 255200.0  # 1,721,200 - 1,466,000
