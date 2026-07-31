# User Manual — Tata Steel Fuel Gas Management Intelligence & Impact Simulation Dashboard

## 1. Introduction
The **Fuel Gas Management Intelligence Dashboard** provides Tata Steel energy engineers and plant operators with real-time operational visibility and impact simulation capabilities across Blast Furnace Gas, Coke Oven Gas, and Linz-Donawitz Gas networks.

---

## 2. Navigation & Dashboard Modules

The system consists of 10 primary modules accessible via the left sidebar:

1. **Overview Dashboard**: High-level KPIs, overall balance, utilization gauges, and waterfall balance flow.
2. **Gas Generation**: Detailed generation metrics across 10 sources and treemap distribution.
3. **Gas Consumption**: Demand breakdown across 33 consumer units categorized into internal self-consumption and external plant demand.
4. **Gas Balance**: Net network balances and surplus/deficit analysis matrix.
5. **Gas Utilization**: Capacity load factors with color-coded risk ranges (Normal &le;90%, Warning 90-100%, Critical &gt;100%).
6. **Gas Network Topology**: Interactive React Flow diagram modeling gas flow from Generators &rarr; Shared Header Pool &rarr; Consumers.
7. **Impact Simulation Engine**: Interactive What-If engine for generator failures (0-100%) and consumer shutdowns.
8. **Saved Scenarios**: Scenario library for inspecting historical simulation runs.
9. **Alerts & Risk Center**: Notifications for network deficits, over-capacity, and missing data alerts.
10. **System Settings**: Configuration parameters and data integrity governance rules.

---

## 3. Running Impact Simulations

To run a Generator Failure Simulation:
1. Navigate to **Impact Simulation** in the sidebar.
2. Ensure **Generator Failure Simulation** mode is selected.
3. Select the target **Gas Type** (e.g. `BFG`) and **Failing Source** (e.g. `Furnace I`).
4. Adjust the **Failure Level** slider (e.g. `50%` or `100%`).
5. Choose an **Allocation Strategy**:
   - *Proportional Share*: All consumers share the reduction proportionally.
   - *Priority Order*: Priority 1 consumers get served first; lower priority units absorb shortages.
   - *Equal Share*: Gas is divided equally among consumers.
6. Click **Execute Failure Simulation**.
7. Inspect the **Consumer Allocation & Impact Analysis** table for individual consumer shortages.
