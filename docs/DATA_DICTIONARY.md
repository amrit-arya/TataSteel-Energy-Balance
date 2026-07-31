# Fuel Gas Management Dashboard - Data Dictionary

## 1. Project Data Overview

The Fuel Gas Management Intelligence Dashboard uses by-product gas generation and consumption data from Tata Steel's integrated steel plant. The data covers three types of by-product gases:

| Gas ID | Full Name | Short Name | Source Process |
|--------|-----------|------------|----------------|
| BFG | Blast Furnace Gas | BF Gas | Iron-making in blast furnaces |
| COG | Coke Oven Gas | CO Gas | Coke production in coke oven batteries |
| LDG | Linz-Donawitz Gas | LD Gas | Steelmaking in LD converters |

**Source**: `Fuel_Management_Project_Data.xlsx` (4 sheets, 19 formulas, 137 data cells)

---

## 2. Dataset Catalog

### 2.1 Gas Types (`gas_types.csv`)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| gas_id | VARCHAR(10) | No | Primary key. Unique gas identifier (BFG, COG, LDG) |
| gas_name | VARCHAR(100) | No | Full descriptive name of the gas |
| short_name | VARCHAR(50) | No | Abbreviated display name |
| description | TEXT | Yes | Description of the gas source process |

**Records**: 3

---

### 2.2 Generation Sources (`generation_sources.csv` / `generation_master.csv`)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| source_id | VARCHAR(20) | No | Primary key. Pattern: `{GAS}-GEN-{NNN}` |
| gas_type_id | VARCHAR(10) | No | Foreign key to gas_types.gas_id |
| source_name | VARCHAR(100) | No | Name of the generation source (from workbook) |
| plant_area | VARCHAR(100) | Yes | Plant area or battery group |
| generation_value | FLOAT | No | Gas generation rate (always >= 0) |
| unit | VARCHAR(20) | No | Measurement unit (default: Nm3/hr) |
| is_active | BOOLEAN | No | Whether the source is currently active |
| percentage_of_total | FLOAT | No | Source's share of its gas type's total generation |

**Records**: 10 (6 BFG + 2 COG + 2 LDG)

#### Generation Sources Inventory

| Source ID | Gas | Source Name | Plant Area | Generation | % of Total |
|-----------|-----|------------|------------|-----------|-----------|
| BFG-GEN-001 | BFG | Furnace I | Blast Furnace | 465,000 | 27.02% |
| BFG-GEN-002 | BFG | Furnace H | Blast Furnace | 450,000 | 26.14% |
| BFG-GEN-003 | BFG | Furnace G | Blast Furnace | 322,000 | 18.71% |
| BFG-GEN-004 | BFG | Furnace F | Blast Furnace | 240,000 | 13.94% |
| BFG-GEN-005 | BFG | Furnace E | Blast Furnace | 82,200 | 4.78% |
| BFG-GEN-006 | BFG | Furnace C | Blast Furnace | 162,000 | 9.41% |
| COG-GEN-001 | COG | Old BPP | Batt 8, Batt 9 | 62,000 | 43.66% |
| COG-GEN-002 | COG | New BPP | Batt 10, Batt 11 | 80,000 | 56.34% |
| LDG-GEN-001 | LDG | LD-1 & LD-3 | LD Converter | 85,000 | 56.67% |
| LDG-GEN-002 | LDG | LD-2 | LD Converter | 65,000 | 43.33% |

---

### 2.3 Consumers (`consumers.csv` / `consumer_master.csv`)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| consumer_id | VARCHAR(20) | No | Primary key. Pattern: `{GAS}-CON-{TYPE}-{NNN}` |
| gas_type_id | VARCHAR(10) | No | Foreign key to gas_types.gas_id |
| consumer_name | VARCHAR(100) | No | Name of the consumer (from workbook) |
| consumer_type | VARCHAR(20) | No | 'Internal' or 'External' |
| consumption_value | FLOAT | **Yes** | Gas consumption rate. NULL if data unavailable |
| priority | INTEGER | No | Allocation priority (lower = higher priority) |
| unit | VARCHAR(20) | No | Measurement unit (default: Nm3/hr) |
| is_active | BOOLEAN | No | Whether the consumer is currently active |
| percentage_of_total | FLOAT | Yes | Consumer's share of its gas type's total consumption |

**Records**: 33 (15 BFG + 18 COG + 0 LDG)

> **IMPORTANT**: `consumption_value` is nullable. For LD Gas, there are zero consumer records because the workbook contains no LD Gas consumption data. This is NOT treated as zero consumption.

#### BF Gas Consumers (15 records)

| Consumer ID | Type | Consumer Name | Consumption | % of Total |
|------------|------|--------------|------------|-----------|
| BFG-CON-INT-001 | Internal | Furnace I | 194,000 | 11.18% |
| BFG-CON-INT-002 | Internal | Furnace H | 115,000 | 6.62% |
| BFG-CON-INT-003 | Internal | Furnace G | 90,000 | 5.18% |
| BFG-CON-INT-004 | Internal | Furnace F | 80,000 | 4.61% |
| BFG-CON-INT-005 | Internal | Furnace E | 25,000 | 1.44% |
| BFG-CON-INT-006 | Internal | Furnace C | 32,000 | 1.84% |
| BFG-CON-EXT-001 | External | HSM Mill | 75,000 | 4.32% |
| BFG-CON-EXT-002 | External | Pellet Plant | 60,000 | 3.46% |
| BFG-CON-EXT-003 | External | TSCR | 10,000 | 0.58% |
| BFG-CON-EXT-004 | External | LCP | 15,000 | 0.86% |
| BFG-CON-EXT-005 | External | Coke Plant | 270,000 | 15.55% |
| BFG-CON-EXT-006 | External | PH #3 | 190,000 | 10.94% |
| BFG-CON-EXT-007 | External | PH #4 | 150,000 | 8.64% |
| BFG-CON-EXT-008 | External | PH #5 | 130,000 | 7.49% |
| BFG-CON-EXT-009 | External | PH #6 | 300,000 | 17.28% |

#### CO Gas Consumers (18 records)

| Consumer ID | Consumer Name | Consumption | % of Total |
|------------|--------------|------------|-----------|
| COG-CON-EXT-001 | Mergemill (1-7) | 3,000 | 2.23% |
| COG-CON-EXT-002 | Mergemill (8-9) | 8,000 | 5.94% |
| COG-CON-EXT-003 | CRM (Cold Rolling Mill) | 7,000 | 5.20% |
| COG-CON-EXT-004 | MM (Merchant Mill) | 4,000 | 2.97% |
| COG-CON-EXT-005 | WRM | 3,000 | 2.23% |
| COG-CON-EXT-006 | HSM | 30,000 | 22.29% |
| COG-CON-EXT-007 | TsCR | 8,000 | 5.94% |
| COG-CON-EXT-008 | SP (1-4) | 1,200 | 0.89% |
| COG-CON-EXT-009 | Pellet Plant | 18,000 | 13.37% |
| COG-CON-EXT-010 | TPL | 7,000 | 5.20% |
| COG-CON-EXT-011 | CAPL | 6,000 | 4.46% |
| COG-CON-EXT-012 | Tube Divsn. | 1,500 | 1.11% |
| COG-CON-EXT-013 | PH 3 | 1,100 | 0.82% |
| COG-CON-EXT-014 | PH 4 | 22,000 | 16.34% |
| COG-CON-EXT-015 | PH 5 | 2,000 | 1.49% |
| COG-CON-EXT-016 | PH 6 | 3,000 | 2.23% |
| COG-CON-EXT-017 | PH 7 | 5,000 | 3.71% |
| COG-CON-EXT-018 | BF Total (800 x 6) | 4,800 | 3.57% |

#### LD Gas Consumers

**No consumer records exist.** The source workbook does not contain LD Gas consumption data. The dashboard displays "Data Unavailable" for LD Gas consumption fields.

---

### 2.4 Gas Balance Summary (`gas_balance_summary.csv`)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| gas_id | VARCHAR(10) | No | Gas type identifier |
| total_generation | FLOAT | No | Sum of all generation sources for this gas |
| total_consumption | FLOAT | **Yes** | Sum of all consumers. NULL for LD Gas |
| balance | FLOAT | **Yes** | Generation minus consumption. NULL for LD Gas |
| utilization_percentage | FLOAT | **Yes** | (Consumption / Generation) x 100. NULL for LD Gas |
| data_status | VARCHAR(50) | No | 'Complete' or 'Consumption Data Unavailable' |

**Records**: 3

| Gas ID | Generation | Consumption | Balance | Utilization | Status |
|--------|-----------|-------------|---------|-------------|--------|
| BFG | 1,721,200 | 1,736,000 | -14,800 | 100.86% | Complete |
| COG | 142,000 | 134,600 | +7,400 | 94.79% | Complete |
| LDG | 150,000 | NULL | NULL | NULL | Consumption Data Unavailable |

---

### 2.5 Final Gas Summary (`final_gas_summary.csv`)

Joins gas type metadata with balance data for comprehensive per-gas-type view.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| gas_id | VARCHAR(10) | No | Gas type identifier |
| gas_name | VARCHAR(100) | No | Full gas name |
| short_name | VARCHAR(50) | No | Short display name |
| description | TEXT | Yes | Gas description |
| total_generation | FLOAT | No | Total generation |
| total_consumption | FLOAT | Yes | Total consumption (NULL for LDG) |
| balance | FLOAT | Yes | Net balance (NULL for LDG) |
| utilization_percentage | FLOAT | Yes | Utilization % (NULL for LDG) |
| data_status | VARCHAR(50) | No | Data availability status |

---

### 2.6 Internal vs External Summary (`internal_external_summary.csv`)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| gas_type_id | VARCHAR(10) | No | Gas type identifier |
| consumer_type | VARCHAR(20) | No | 'Internal' or 'External' |
| consumer_count | INTEGER | No | Number of consumers in this category |
| total_consumption | FLOAT | No | Sum of consumption for this category |

---

## 3. ID Naming Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| `{GAS}-GEN-{NNN}` | BFG-GEN-001 | Generation source ID |
| `{GAS}-CON-INT-{NNN}` | BFG-CON-INT-001 | Internal consumer ID |
| `{GAS}-CON-EXT-{NNN}` | BFG-CON-EXT-003 | External consumer ID |

IDs are deterministic - re-running the pipeline produces identical IDs.

---

## 4. Data Quality Rules

The processing pipeline validates all of the following (23 checks total):

| # | Rule | Scope |
|---|------|-------|
| 1 | No duplicate source IDs | generation_sources |
| 2 | No duplicate consumer IDs | consumers |
| 3 | No duplicate gas IDs | gas_types |
| 4 | No missing required generation fields | generation_sources |
| 5 | No missing required consumer fields | consumers |
| 6 | No negative generation values | generation_sources |
| 7 | No negative consumption values | consumers |
| 8 | Valid gas type references (sources) | generation_sources |
| 9 | Valid gas type references (consumers) | consumers |
| 10 | Valid consumer types | consumers |
| 11 | BF Gas has exactly 6 sources | record counts |
| 12 | CO Gas has exactly 2 sources | record counts |
| 13 | LD Gas has exactly 2 sources | record counts |
| 14 | BF Gas has exactly 15 consumers | record counts |
| 15 | CO Gas has exactly 18 consumers | record counts |
| 16 | BF total generation = 1,721,200 | Excel cross-check |
| 17 | BF internal consumption = 536,000 | Excel cross-check |
| 18 | BF external consumption = 1,200,000 | Excel cross-check |
| 19 | BF total consumption = 1,736,000 | Excel cross-check |
| 20 | CO total generation = 142,000 | Excel cross-check |
| 21 | CO total consumption = 134,600 | Excel cross-check |
| 22 | LD total generation = 150,000 | Excel cross-check |
| 23 | LD has NO consumption data | data integrity |

---

## 5. Data Limitations

### 5.1 LD Gas Consumption
LD Gas generation data is available (150,000 Nm3/hr total from 2 sources), but **consumption data is not present** in the source workbook.

- LD Gas consumption is treated as unavailable (NULL)
- LD Gas balance is not calculated
- LD Gas utilization is not calculated
- The dashboard displays "Data Unavailable" - never zero

### 5.2 Source-to-Consumer Connectivity
The workbook does not define direct connections between individual generators and consumers. The system uses a **shared gas pool model**:

```
Generators --> [Shared Gas Pool/Header] --> Consumers
```

This accurately reflects how steel plant gas distribution works via gas headers.

### 5.3 Historical Data
The workbook contains static operational values without timestamps. The system focuses on:
- Operational analytics and balance analysis
- Failure impact simulation
- Scenario comparison and decision support

Time-series forecasting is outside the initial scope.

### 5.4 Similar Plant Names
The following names appear similar across gas types but are **preserved as-is** from the workbook:

| BF Gas Consumer | CO Gas Consumer | Possible Same Plant? |
|----------------|----------------|---------------------|
| HSM Mill | HSM | Unconfirmed |
| TSCR | TsCR | Unconfirmed |
| PH #3 | PH 3 | Unconfirmed |
| PH #4 | PH 4 | Unconfirmed |
| PH #5 | PH 5 | Unconfirmed |
| PH #6 | PH 6 | Unconfirmed |
| Pellet Plant (BFG) | Pellet Plant (COG) | Unconfirmed |

These are NOT automatically merged. Each consumes a different gas type and is tracked independently.

---

## 6. Network Model

The gas distribution is modeled as:

```
Generation Sources
       |
       v
  [Gas Pool]  <-- One pool per gas type (BFG Pool, COG Pool, LDG Pool)
       |
       v
   Consumers
```

- There is NO direct generator-to-consumer mapping
- Each gas type has its own independent pool
- Simulations operate on the pool level
- Consumer allocation uses priority-based, equal, weighted, or custom strategies

---

## 7. Measurement Units

All generation and consumption values are assumed to be in **Nm3/hr** (Normal cubic meters per hour), which is the standard unit for by-product gas measurement in integrated steel plants.

The workbook does not explicitly state units, but this convention is consistent with Tata Steel's operational reporting standards.
