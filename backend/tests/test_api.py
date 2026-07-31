"""
API Endpoint Integration Tests
================================

Automated tests for FastAPI REST endpoints using TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_overview():
    """Test overview KPIs endpoint."""
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_generation"] == 2013200.0
    assert data["total_consumption"] == 1870600.0
    assert data["total_sources"] == 10
    assert data["total_consumers"] == 33
    assert len(data["gas_balances"]) == 3


def test_get_gas_balance():
    """Test gas balance summary endpoint."""
    response = client.get("/api/gas-balance")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    # Verify BFG deficit
    bfg = next(g for g in data if g["gas_id"] == "BFG")
    assert bfg["total_generation"] == 1721200.0
    assert bfg["total_consumption"] == 1736000.0
    assert bfg["balance"] == -14800.0
    assert bfg["utilization_percentage"] == 100.86

    # Verify LDG unavailable consumption
    ldg = next(g for g in data if g["gas_id"] == "LDG")
    assert ldg["total_generation"] == 150000.0
    assert ldg["total_consumption"] is None
    assert ldg["data_status"] == "Consumption Data Unavailable"


def test_get_generation():
    """Test generation endpoint."""
    response = client.get("/api/generation")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    bfg = next(g for g in data if g["gas_id"] == "BFG")
    assert bfg["source_count"] == 6


def test_get_consumption():
    """Test consumption endpoint."""
    response = client.get("/api/consumption")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    cog = next(g for g in data if g["gas_id"] == "COG")
    assert cog["consumer_count"] == 18


def test_get_network():
    """Test network topology endpoint for React Flow."""
    response = client.get("/api/network?gas_type_id=BFG")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0
    assert len(data["edges"]) > 0


def test_get_alerts():
    """Test active alerts endpoint."""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    critical_alerts = [a for a in data if a["severity"] == "critical"]
    assert len(critical_alerts) >= 1
