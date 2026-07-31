# REST API Documentation — Tata Steel Fuel Gas Management Intelligence

## Base URL
`/api`

Swagger Documentation available at `http://localhost:8000/docs` or `http://localhost:8000/redoc`.

---

## Endpoints Summary

### 1. Overview & KPIs
`GET /api/overview`
- **Description**: Returns all top-level KPIs including total generation, total consumption, net balance, utilization %, source & consumer counts, active alert counts, and per-gas summary cards.

### 2. Gas Balance
`GET /api/gas-balance`
- **Description**: Returns gas generation, consumption, balance, utilization %, and data status for BFG, COG, and LDG.

`GET /api/gas-balance/{gas_type_id}`
- **Description**: Returns balance metrics for a specific gas type (e.g., `BFG`, `COG`, `LDG`).

### 3. Gas Generation
`GET /api/generation`
- **Description**: Returns generation sources grouped by gas type.

`GET /api/generation/{gas_type_id}`
- **Description**: Returns generation sources for a specific gas.

### 4. Gas Consumption
`GET /api/consumption`
- **Description**: Returns consumer units grouped by gas type, including internal vs external categorization.

`GET /api/consumption/{gas_type_id}`
- **Description**: Returns consumer units for a specific gas.

### 5. Gas Utilization
`GET /api/utilization`
- **Description**: Returns utilization percentages and risk threshold statuses (`normal`, `warning`, `critical`, `unavailable`).

### 6. Network Topology
`GET /api/network`
- **Query Params**: `gas_type_id` (optional)
- **Description**: Returns React Flow nodes and edges representing the Shared Gas Pool network.

### 7. Simulation Engine
`POST /api/simulation/generator`
- **Body**: `{ "gas_type_id": "BFG", "source_id": "BFG-GEN-001", "failure_percentage": 50, "allocation_strategy": "proportional" }`
- **Description**: Simulates generator failure and calculates gas redistribution and affected consumer shortages.

`POST /api/simulation/consumer`
- **Body**: `{ "gas_type_id": "BFG", "consumer_id": "BFG-CON-EXT-005", "shutdown_percentage": 100 }`
- **Description**: Simulates consumer shutdown and calculates excess gas surplus.

`GET /api/simulation/scenarios`
- **Description**: Returns list of saved simulation scenarios.
