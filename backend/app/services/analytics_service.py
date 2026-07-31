"""
Analytics Service
==================

Business logic for analytics computations:
    - Overview KPIs
    - Gas balance calculation
    - Utilization metrics
    - Network topology generation
    - Generation and consumption breakdowns

Architecture Decision:
    Analytics computations are done server-side rather than client-side because:
    1. Single source of truth for calculations
    2. Consistent results across all API consumers
    3. Complex queries benefit from SQL aggregation
    4. Future: heavy computations can be cached or pre-computed
"""

from typing import Optional
from sqlalchemy.orm import Session

from backend.app.repositories.gas_repository import GasRepository
from backend.app.repositories.generation_repository import GenerationRepository
from backend.app.repositories.consumer_repository import ConsumerRepository
from backend.app.schemas.gas import (
    GasBalanceResponse,
    OverviewKPI,
    UtilizationResponse,
    NetworkNodeResponse,
    NetworkEdgeResponse,
    NetworkResponse,
)
from backend.app.schemas.generation import (
    GenerationSourceResponse,
    GenerationByGasResponse,
)
from backend.app.schemas.consumption import (
    ConsumerResponse,
    ConsumptionByGasResponse,
    InternalExternalSummary,
)


DATA_STATUS_COMPLETE = "Complete"
DATA_STATUS_UNAVAILABLE = "Consumption Data Unavailable"


class AnalyticsService:
    """Service for analytics and computed metrics."""

    def __init__(self, db: Session):
        self.gas_repo = GasRepository(db)
        self.gen_repo = GenerationRepository(db)
        self.con_repo = ConsumerRepository(db)

    # ── Overview ───────────────────────────────────────────────

    def get_overview(self) -> OverviewKPI:
        """Compute all overview dashboard KPIs."""
        gas_types = self.gas_repo.get_all_gas_types()
        alert_counts = self.gas_repo.get_alert_counts()

        # Compute per-gas balances
        gas_balances = []
        total_gen = 0.0
        total_cons = 0.0
        has_consumption_data = False

        for gt in gas_types:
            balance = self._compute_gas_balance(gt.id, gt.gas_name, gt.short_name)
            gas_balances.append(balance)
            total_gen += balance.total_generation

            if balance.total_consumption is not None:
                total_cons += balance.total_consumption
                has_consumption_data = True

        # Overall utilization (only from gases with consumption data)
        overall_util = None
        if has_consumption_data and total_gen > 0:
            overall_util = round((total_cons / total_gen) * 100, 2)

        # Count healthy vs unhealthy systems
        healthy = sum(1 for b in gas_balances
                      if b.data_status == DATA_STATUS_COMPLETE
                      and b.utilization_percentage is not None
                      and b.utilization_percentage <= 100)

        return OverviewKPI(
            total_generation=total_gen,
            total_consumption=total_cons if has_consumption_data else None,
            net_balance=(total_gen - total_cons) if has_consumption_data else None,
            overall_utilization=overall_util,
            total_sources=self.gen_repo.get_source_count(),
            total_consumers=self.con_repo.get_consumer_count(),
            critical_alerts=alert_counts.get("critical", 0),
            warning_alerts=alert_counts.get("warning", 0),
            healthy_systems=healthy,
            gas_balances=gas_balances,
        )

    # ── Gas Balance ────────────────────────────────────────────

    def get_all_gas_balances(self) -> list[GasBalanceResponse]:
        """Get balance for all gas types."""
        gas_types = self.gas_repo.get_all_gas_types()
        return [
            self._compute_gas_balance(gt.id, gt.gas_name, gt.short_name)
            for gt in gas_types
        ]

    def get_gas_balance(self, gas_type_id: str) -> GasBalanceResponse:
        """Get balance for a specific gas type."""
        gt = self.gas_repo.get_gas_type_by_id(gas_type_id)
        if not gt:
            raise ValueError(f"Gas type '{gas_type_id}' not found")
        return self._compute_gas_balance(gt.id, gt.gas_name, gt.short_name)

    def _compute_gas_balance(self, gas_id: str, gas_name: str, short_name: str) -> GasBalanceResponse:
        """Internal: compute balance for a single gas type."""
        total_gen = self.gen_repo.get_total_generation(gas_id)
        has_consumers = self.con_repo.has_consumers(gas_id)

        if not has_consumers:
            return GasBalanceResponse(
                gas_id=gas_id,
                gas_name=gas_name,
                short_name=short_name,
                total_generation=total_gen,
                total_consumption=None,
                balance=None,
                utilization_percentage=None,
                data_status=DATA_STATUS_UNAVAILABLE,
            )

        total_cons = self.con_repo.get_total_consumption(gas_id)
        balance = total_gen - (total_cons or 0)
        utilization = round(((total_cons or 0) / total_gen * 100), 2) if total_gen > 0 else 0.0

        return GasBalanceResponse(
            gas_id=gas_id,
            gas_name=gas_name,
            short_name=short_name,
            total_generation=total_gen,
            total_consumption=total_cons,
            balance=balance,
            utilization_percentage=utilization,
            data_status=DATA_STATUS_COMPLETE,
        )

    # ── Utilization ────────────────────────────────────────────

    def get_utilization(self) -> list[UtilizationResponse]:
        """Get utilization metrics for all gas types."""
        balances = self.get_all_gas_balances()
        results = []

        for b in balances:
            if b.data_status == DATA_STATUS_UNAVAILABLE:
                threshold = "unavailable"
            elif b.utilization_percentage is not None:
                if b.utilization_percentage > 100:
                    threshold = "critical"
                elif b.utilization_percentage > 90:
                    threshold = "warning"
                else:
                    threshold = "normal"
            else:
                threshold = "unavailable"

            results.append(UtilizationResponse(
                gas_id=b.gas_id,
                gas_name=b.gas_name,
                short_name=b.short_name,
                total_generation=b.total_generation,
                total_consumption=b.total_consumption,
                utilization_percentage=b.utilization_percentage,
                data_status=b.data_status,
                threshold_status=threshold,
            ))

        return results

    # ── Generation ─────────────────────────────────────────────

    def get_all_generation(self) -> list[GenerationByGasResponse]:
        """Get generation data grouped by gas type."""
        gas_types = self.gas_repo.get_all_gas_types()
        results = []

        for gt in gas_types:
            sources = self.gen_repo.get_sources_by_gas_type(gt.id)
            total = sum(s.generation_value for s in sources)

            results.append(GenerationByGasResponse(
                gas_id=gt.id,
                gas_name=gt.gas_name,
                short_name=gt.short_name,
                total_generation=total,
                source_count=len(sources),
                sources=[GenerationSourceResponse.model_validate(s) for s in sources],
            ))

        return results

    def get_generation_by_gas(self, gas_type_id: str) -> GenerationByGasResponse:
        """Get generation data for a specific gas type."""
        gt = self.gas_repo.get_gas_type_by_id(gas_type_id)
        if not gt:
            raise ValueError(f"Gas type '{gas_type_id}' not found")

        sources = self.gen_repo.get_sources_by_gas_type(gas_type_id)
        total = sum(s.generation_value for s in sources)

        return GenerationByGasResponse(
            gas_id=gt.id,
            gas_name=gt.gas_name,
            short_name=gt.short_name,
            total_generation=total,
            source_count=len(sources),
            sources=[GenerationSourceResponse.model_validate(s) for s in sources],
        )

    # ── Consumption ────────────────────────────────────────────

    def get_all_consumption(self) -> list[ConsumptionByGasResponse]:
        """Get consumption data grouped by gas type."""
        gas_types = self.gas_repo.get_all_gas_types()
        results = []

        for gt in gas_types:
            consumers = self.con_repo.get_consumers_by_gas_type(gt.id)

            if not consumers:
                results.append(ConsumptionByGasResponse(
                    gas_id=gt.id,
                    gas_name=gt.gas_name,
                    short_name=gt.short_name,
                    total_consumption=None,
                    consumer_count=0,
                    data_status=DATA_STATUS_UNAVAILABLE,
                    consumers=[],
                ))
            else:
                total = sum(c.consumption_value for c in consumers if c.consumption_value is not None)
                results.append(ConsumptionByGasResponse(
                    gas_id=gt.id,
                    gas_name=gt.gas_name,
                    short_name=gt.short_name,
                    total_consumption=total,
                    consumer_count=len(consumers),
                    data_status=DATA_STATUS_COMPLETE,
                    consumers=[ConsumerResponse.model_validate(c) for c in consumers],
                ))

        return results

    def get_consumption_by_gas(self, gas_type_id: str) -> ConsumptionByGasResponse:
        """Get consumption data for a specific gas type."""
        gt = self.gas_repo.get_gas_type_by_id(gas_type_id)
        if not gt:
            raise ValueError(f"Gas type '{gas_type_id}' not found")

        consumers = self.con_repo.get_consumers_by_gas_type(gas_type_id)

        if not consumers:
            return ConsumptionByGasResponse(
                gas_id=gt.id,
                gas_name=gt.gas_name,
                short_name=gt.short_name,
                total_consumption=None,
                consumer_count=0,
                data_status=DATA_STATUS_UNAVAILABLE,
                consumers=[],
            )

        total = sum(c.consumption_value for c in consumers if c.consumption_value is not None)
        return ConsumptionByGasResponse(
            gas_id=gt.id,
            gas_name=gt.gas_name,
            short_name=gt.short_name,
            total_consumption=total,
            consumer_count=len(consumers),
            data_status=DATA_STATUS_COMPLETE,
            consumers=[ConsumerResponse.model_validate(c) for c in consumers],
        )

    # ── Network Topology ──────────────────────────────────────

    def get_network(self, gas_type_id: str = None) -> NetworkResponse:
        """
        Build the network topology for gas flow visualization.

        Uses the shared gas pool model:
            Generators -> [Gas Pool] -> Consumers

        Each gas type has its own pool node.
        """
        nodes = []
        edges = []

        gas_types = self.gas_repo.get_all_gas_types()
        if gas_type_id:
            gas_types = [gt for gt in gas_types if gt.id == gas_type_id]

        for gt in gas_types:
            # Pool node for this gas type
            total_gen = self.gen_repo.get_total_generation(gt.id)
            total_cons = self.con_repo.get_total_consumption(gt.id)

            pool_node = NetworkNodeResponse(
                id=f"pool-{gt.id}",
                label=f"{gt.short_name} Pool",
                type="pool",
                gas_type_id=gt.id,
                value=total_gen,
                metadata={
                    "total_generation": total_gen,
                    "total_consumption": total_cons,
                    "balance": (total_gen - total_cons) if total_cons is not None else None,
                },
            )
            nodes.append(pool_node)

            # Generator nodes
            sources = self.gen_repo.get_sources_by_gas_type(gt.id)
            for src in sources:
                nodes.append(NetworkNodeResponse(
                    id=src.id,
                    label=src.source_name,
                    type="generator",
                    gas_type_id=gt.id,
                    value=src.generation_value,
                    metadata={"plant_area": src.plant_area},
                ))
                edges.append(NetworkEdgeResponse(
                    id=f"edge-{src.id}-to-pool",
                    source=src.id,
                    target=f"pool-{gt.id}",
                    value=src.generation_value,
                    gas_type_id=gt.id,
                ))

            # Consumer nodes
            consumers = self.con_repo.get_consumers_by_gas_type(gt.id)
            for con in consumers:
                nodes.append(NetworkNodeResponse(
                    id=con.id,
                    label=con.consumer_name,
                    type="consumer",
                    gas_type_id=gt.id,
                    value=con.consumption_value,
                    consumer_type=con.consumer_type,
                    metadata={"priority": con.priority},
                ))
                edges.append(NetworkEdgeResponse(
                    id=f"edge-pool-to-{con.id}",
                    source=f"pool-{gt.id}",
                    target=con.id,
                    value=con.consumption_value,
                    gas_type_id=gt.id,
                ))

        return NetworkResponse(nodes=nodes, edges=edges)
