# Tata Steel — Fuel Gas Management Intelligence & Impact Simulation Dashboard

Enterprise-grade operational decision-support system built for Tata Steel to monitor, analyze, visualize, and simulate the complete by-product gas management system (Blast Furnace Gas, Coke Oven Gas, Linz-Donawitz Gas).

---

## Key Features

- **Operational Overview**: Real-time KPIs for total generation, total consumption, net balance, utilization %, and active risk alerts.
- **Gas Generation Intelligence**: Tracks 10 generation sources across Blast Furnaces, Coke Oven Batteries, and LD Converters with hierarchical treemap visualization.
- **Gas Consumption Intelligence**: Tracks 33 consumer units categorized into internal furnace self-consumption and external plant areas.
- **Gas Balance Matrix**: Surplus and deficit analysis highlighting the **-14,800 Nm³/hr Blast Furnace Gas deficit**.
- **Gas Utilization Monitoring**: Color-coded load factor gauges with risk ranges (Normal &le;90%, Warning 90-100%, Critical &gt;100%).
- **Interactive React Flow Network Topology**: Visual representation of the **Shared Gas Pool Header Model** (Generators &rarr; Shared Header Pool &rarr; Consumers) with animated flow edges and node inspector panel.
- **Impact Simulation Engine**: Interactive What-If simulation engine for generator failures (0-100%) and consumer shutdowns with multiple allocation strategies (*Proportional*, *Priority Order*, *Equal Share*).
- **Data Integrity Governance**: Strict protection against data fabrication. Displays **Data Unavailable** for LD Gas consumption rather than assuming zero.

---

## System Architecture

```
Raw Excel Workbook
       ↓
Analytics Processing Pipeline (inspect, process, validate, master data)
       ↓
SQLite Database (WAL Mode, FK Enforcement, SQLAlchemy ORM)
       ↓
FastAPI Backend (Async REST Service)
       ↓
Impact Simulation & Allocation Engine
       ↓
React + Vite Dashboard (TypeScript, TailwindCSS, ECharts, React Flow)
```

---

## Getting Started

### Option 1: Local Development

#### 1. Backend Setup (FastAPI & SQLite)
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run data processing & database seed
python -m analytics.process_data
python -m analytics.validate_data
python -m analytics.create_master_data
python -m analytics.seed_database

# Start FastAPI dev server
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup (React & Vite)
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Open browser at `http://localhost:5173`.

---

### Option 2: Docker Container Deployment

```bash
# Build and run containers
docker-compose up --build -d
```

- Frontend Dashboard: `http://localhost:3000`
- FastAPI Backend & Swagger Docs: `http://localhost:8000/docs`

---

## Documentation Links

- [Architecture & System Design](docs/ARCHITECTURE.md)
- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [REST API Documentation](docs/API_DOCUMENTATION.md)
- [Database ER Diagram](docs/ER_DIAGRAM.md)
- [User Manual](docs/USER_MANUAL.md)
