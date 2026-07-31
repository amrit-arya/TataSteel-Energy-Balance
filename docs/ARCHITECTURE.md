# Architecture & System Design Document — Tata Steel Fuel Gas Management Intelligence

## 1. System Overview
The **Fuel Gas Management Intelligence & Impact Simulation Dashboard** is an enterprise-grade operational decision-support system designed for Tata Steel's integrated steelworks (Jamshedpur Works).

The system monitors, analyzes, visualizes, and simulates the network balance of by-product gases:
- **Blast Furnace Gas (BFG)**
- **Coke Oven Gas (COG)**
- **Linz-Donawitz Converter Gas (LDG)**

---

## 2. End-to-End Architectural Pipeline

```
Raw Excel Workbook (4 Sheets)
       ↓
Analytics Processing Pipeline (inspect, process, validate, master data)
       ↓
Master Datasets (8 Processed CSVs)
       ↓
SQLite Database (WAL Mode, FK Enforcement, SQLAlchemy ORM)
       ↓
FastAPI Backend (Async REST Service, Repository-Service Pattern)
       ↓
Simulation & Allocation Engine (Proportional, Priority, Equal Allocation)
       ↓
React + Vite Frontend (TypeScript, TailwindCSS, ECharts, React Flow)
```

---

## 3. Key Design Decisions

### 3.1 Shared Gas Pool Architecture
The source workbook specifies generation sources and consumer demands for each gas type, but does **not** specify direct generator-to-consumer pipes. The system models gas distribution using a **Shared Gas Pool (Header)** model:

```
[ Generators ] ──> ( Shared Gas Header Pool ) ──> [ Consumers ]
```

This prevents fabricating non-existent connection topologies while accurately reflecting how industrial gas header systems distribute pressure and flow.

### 3.2 Data Integrity & No Data Fabrication Rules
1. **LD Gas Consumption Data Integrity**: The Excel workbook contains generation data for LD Gas (150,000 Nm³/hr across LD-1 & LD-3 and LD-2) but **no** consumption data. The system explicitly displays **Data Unavailable** for LD Gas consumption, balance, and utilization, rather than assuming zero.
2. **Plant Name Preservation**: Entities like `HSM Mill` (BF Gas consumer) and `HSM` (CO Gas consumer) are preserved as distinct entities as presented in the source workbook without forced auto-merging.
3. **Over-Capacity Deficit Handling**: Blast Furnace Gas operates at **100.86% utilization** (-14,800 Nm³/hr deficit). The dashboard highlights this as a critical operational risk.

---

## 4. Technology Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (WAL mode, PostgreSQL ready).
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Apache ECharts (`echarts-for-react`), React Flow (`reactflow`), TanStack React Query, Lucide Icons.
- **Deployment**: Docker, Docker Compose, Nginx.
