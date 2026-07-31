"""
Simulation Service
===================

Business logic for generator failure and consumer failure simulations.

Architecture Decision:
    The simulation engine uses the shared gas pool model:
    - All generators feed into a single pool per gas type
    - All consumers draw from the same pool
    - When a generator fails, the pool shrinks
    - Allocation strategies determine who gets gas when supply < demand

    This is NOT a graph-based simulation with direct links.
    It's a pool-based allocation problem, which matches the real-world
    gas header system in integrated steel plants.
"""

from typing import Optional
from sqlalchemy.orm import Session

from backend.app.repositories.generation_repository import GenerationRepository
from backend.app.repositories.consumer_repository import ConsumerRepository
from backend.app.repositories.simulation_repository import SimulationRepository
from backend.app.repositories.gas_repository import GasRepository
from backend.app.models.simulation import SimulationScenario, SimulationResult
from backend.app.schemas.simulation import (
    GeneratorFailureRequest,
    ConsumerFailureRequest,
    SimulationResultResponse,
    AffectedConsumer,
    ScenarioSummaryResponse,
)


class SimulationService:
    """Service for running simulations and managing scenarios."""

    def __init__(self, db: Session):
        self.db = db
        self.gen_repo = GenerationRepository(db)
        self.con_repo = ConsumerRepository(db)
        self.sim_repo = SimulationRepository(db)
        self.gas_repo = GasRepository(db)

    # ── Generator Failure ──────────────────────────────────────

    def simulate_generator_failure(self, request: GeneratorFailureRequest) -> SimulationResultResponse:
        """
        Simulate a generator failure scenario.

        Algorithm:
            1. Get total generation for the gas type
            2. Reduce by source's generation * failure_percentage / 100
            3. Get total demand from all consumers
            4. If demand > available: run allocation engine
            5. Return impact analysis
        """
        # Validate inputs
        source = self.gen_repo.get_source_by_id(request.source_id)
        if not source:
            raise ValueError(f"Generation source '{request.source_id}' not found")
        if source.gas_type_id != request.gas_type_id:
            raise ValueError(f"Source '{request.source_id}' does not belong to gas type '{request.gas_type_id}'")

        gas_type = self.gas_repo.get_gas_type_by_id(request.gas_type_id)

        # Calculate generation impact
        original_gen = self.gen_repo.get_total_generation(request.gas_type_id)
        generation_loss = source.generation_value * (request.failure_percentage / 100.0)
        available_gen = original_gen - generation_loss

        # Get consumers and total demand
        consumers = self.con_repo.get_consumers_by_gas_type(request.gas_type_id)
        if not consumers:
            raise ValueError(f"No consumers found for gas type '{request.gas_type_id}'. "
                             "Cannot simulate without consumption data.")

        total_demand = sum(c.consumption_value for c in consumers if c.consumption_value is not None)
        deficit = max(0, total_demand - available_gen)
        surplus = max(0, available_gen - total_demand)

        # Run allocation
        affected = self._allocate_gas(
            consumers=consumers,
            available_gas=available_gen,
            strategy=request.allocation_strategy,
        )

        # Compute utilization
        original_util = (total_demand / original_gen * 100) if original_gen > 0 else None
        new_util = (total_demand / available_gen * 100) if available_gen > 0 else None

        # Count impact levels
        fully_supplied = sum(1 for a in affected if a.deficit == 0)
        partially_supplied = sum(1 for a in affected if 0 < a.deficit < a.original_demand)
        zero_supply = sum(1 for a in affected if a.allocated_amount == 0 and a.original_demand > 0)

        # Build response
        scenario_name = request.scenario_name or (
            f"{source.source_name} failure at {request.failure_percentage}%"
        )

        result = SimulationResultResponse(
            scenario_name=scenario_name,
            scenario_type="generator_failure",
            gas_type_id=request.gas_type_id,
            target_id=request.source_id,
            target_name=source.source_name,
            failure_percentage=request.failure_percentage,
            allocation_strategy=request.allocation_strategy,
            original_generation=original_gen,
            available_generation=available_gen,
            generation_loss=generation_loss,
            total_demand=total_demand,
            deficit=deficit,
            surplus=surplus,
            original_utilization=round(original_util, 2) if original_util is not None else None,
            new_utilization=round(new_util, 2) if new_util is not None else None,
            affected_consumers=affected,
            total_affected_count=len([a for a in affected if a.deficit > 0]),
            fully_supplied_count=fully_supplied,
            partially_supplied_count=partially_supplied,
            zero_supply_count=zero_supply,
        )

        # Save scenario if name provided
        if request.scenario_name:
            self._save_scenario(request, result)

        return result

    # ── Consumer Failure ───────────────────────────────────────

    def simulate_consumer_failure(self, request: ConsumerFailureRequest) -> SimulationResultResponse:
        """
        Simulate a consumer shutdown/failure scenario.

        Algorithm:
            1. Get total demand for the gas type
            2. Reduce by consumer's demand * shutdown_percentage / 100
            3. Calculate new surplus
            4. Show redistribution potential
        """
        # Validate inputs
        consumer = self.con_repo.get_consumer_by_id(request.consumer_id)
        if not consumer:
            raise ValueError(f"Consumer '{request.consumer_id}' not found")
        if consumer.gas_type_id != request.gas_type_id:
            raise ValueError(f"Consumer '{request.consumer_id}' does not belong to gas type '{request.gas_type_id}'")
        if consumer.consumption_value is None:
            raise ValueError(f"Consumer '{request.consumer_id}' has no consumption data")

        gas_type = self.gas_repo.get_gas_type_by_id(request.gas_type_id)

        # Calculate demand reduction
        total_gen = self.gen_repo.get_total_generation(request.gas_type_id)
        all_consumers = self.con_repo.get_consumers_by_gas_type(request.gas_type_id)
        original_demand = sum(c.consumption_value for c in all_consumers if c.consumption_value is not None)

        demand_reduction = consumer.consumption_value * (request.shutdown_percentage / 100.0)
        new_demand = original_demand - demand_reduction

        deficit = max(0, new_demand - total_gen)
        surplus = max(0, total_gen - new_demand)

        # Build affected consumers list (all get full allocation since demand decreased)
        affected = []
        for c in all_consumers:
            if c.consumption_value is None:
                continue

            if c.id == request.consumer_id:
                reduced_demand = c.consumption_value * (1 - request.shutdown_percentage / 100.0)
                affected.append(AffectedConsumer(
                    consumer_id=c.id,
                    consumer_name=c.consumer_name,
                    consumer_type=c.consumer_type,
                    original_demand=c.consumption_value,
                    allocated_amount=reduced_demand,
                    deficit=0,
                    impact_percentage=request.shutdown_percentage,
                ))
            else:
                affected.append(AffectedConsumer(
                    consumer_id=c.id,
                    consumer_name=c.consumer_name,
                    consumer_type=c.consumer_type,
                    original_demand=c.consumption_value,
                    allocated_amount=c.consumption_value,
                    deficit=0,
                    impact_percentage=0,
                ))

        # Utilization
        original_util = (original_demand / total_gen * 100) if total_gen > 0 else None
        new_util = (new_demand / total_gen * 100) if total_gen > 0 else None

        scenario_name = request.scenario_name or (
            f"{consumer.consumer_name} shutdown at {request.shutdown_percentage}%"
        )

        return SimulationResultResponse(
            scenario_name=scenario_name,
            scenario_type="consumer_failure",
            gas_type_id=request.gas_type_id,
            target_id=request.consumer_id,
            target_name=consumer.consumer_name,
            failure_percentage=request.shutdown_percentage,
            allocation_strategy="N/A",
            original_generation=total_gen,
            available_generation=total_gen,
            generation_loss=0,
            total_demand=new_demand,
            deficit=deficit,
            surplus=surplus,
            original_utilization=round(original_util, 2) if original_util is not None else None,
            new_utilization=round(new_util, 2) if new_util is not None else None,
            affected_consumers=affected,
            total_affected_count=1,
            fully_supplied_count=len(all_consumers) - 1,
            partially_supplied_count=1 if request.shutdown_percentage < 100 else 0,
            zero_supply_count=1 if request.shutdown_percentage >= 100 else 0,
        )

    # ── Allocation Engine ──────────────────────────────────────

    def _allocate_gas(
        self,
        consumers: list,
        available_gas: float,
        strategy: str = "proportional",
    ) -> list[AffectedConsumer]:
        """
        Allocate available gas to consumers using the specified strategy.

        Strategies:
            - proportional: Each consumer gets a proportional share
            - priority: Higher priority consumers get served first
            - equal: Equal share to all consumers (capped at demand)
        """
        valid_consumers = [c for c in consumers if c.consumption_value is not None and c.consumption_value > 0]
        total_demand = sum(c.consumption_value for c in valid_consumers)

        if total_demand == 0 or available_gas <= 0:
            return [
                AffectedConsumer(
                    consumer_id=c.id,
                    consumer_name=c.consumer_name,
                    consumer_type=c.consumer_type,
                    original_demand=c.consumption_value or 0,
                    allocated_amount=0,
                    deficit=c.consumption_value or 0,
                    impact_percentage=100.0,
                )
                for c in valid_consumers
            ]

        if strategy == "priority":
            return self._allocate_by_priority(valid_consumers, available_gas)
        elif strategy == "equal":
            return self._allocate_equally(valid_consumers, available_gas)
        else:  # proportional (default)
            return self._allocate_proportionally(valid_consumers, available_gas, total_demand)

    def _allocate_proportionally(self, consumers: list, available_gas: float, total_demand: float) -> list[AffectedConsumer]:
        """Proportional allocation: each consumer gets share based on their demand."""
        result = []
        for c in consumers:
            share = (c.consumption_value / total_demand) * available_gas
            allocated = min(share, c.consumption_value)  # Can't allocate more than demand
            deficit = max(0, c.consumption_value - allocated)
            impact = round((deficit / c.consumption_value * 100), 2) if c.consumption_value > 0 else 0

            result.append(AffectedConsumer(
                consumer_id=c.id,
                consumer_name=c.consumer_name,
                consumer_type=c.consumer_type,
                original_demand=c.consumption_value,
                allocated_amount=round(allocated, 2),
                deficit=round(deficit, 2),
                impact_percentage=impact,
            ))
        return result

    def _allocate_by_priority(self, consumers: list, available_gas: float) -> list[AffectedConsumer]:
        """Priority allocation: higher priority (lower number) gets served first."""
        sorted_consumers = sorted(consumers, key=lambda c: c.priority)
        remaining = available_gas
        result = []

        for c in sorted_consumers:
            allocated = min(remaining, c.consumption_value)
            remaining -= allocated
            deficit = max(0, c.consumption_value - allocated)
            impact = round((deficit / c.consumption_value * 100), 2) if c.consumption_value > 0 else 0

            result.append(AffectedConsumer(
                consumer_id=c.id,
                consumer_name=c.consumer_name,
                consumer_type=c.consumer_type,
                original_demand=c.consumption_value,
                allocated_amount=round(allocated, 2),
                deficit=round(deficit, 2),
                impact_percentage=impact,
            ))

        return result

    def _allocate_equally(self, consumers: list, available_gas: float) -> list[AffectedConsumer]:
        """Equal allocation: each consumer gets an equal share, capped at demand."""
        equal_share = available_gas / len(consumers) if consumers else 0
        result = []

        for c in consumers:
            allocated = min(equal_share, c.consumption_value)
            deficit = max(0, c.consumption_value - allocated)
            impact = round((deficit / c.consumption_value * 100), 2) if c.consumption_value > 0 else 0

            result.append(AffectedConsumer(
                consumer_id=c.id,
                consumer_name=c.consumer_name,
                consumer_type=c.consumer_type,
                original_demand=c.consumption_value,
                allocated_amount=round(allocated, 2),
                deficit=round(deficit, 2),
                impact_percentage=impact,
            ))

        return result

    # ── Scenario Management ────────────────────────────────────

    def _save_scenario(self, request, result: SimulationResultResponse) -> None:
        """Save a simulation scenario and its results to the database."""
        scenario = SimulationScenario(
            scenario_name=result.scenario_name,
            scenario_type=result.scenario_type,
            gas_type_id=result.gas_type_id,
            target_id=result.target_id,
            failure_percentage=result.failure_percentage,
            allocation_strategy=result.allocation_strategy,
        )
        saved_scenario = self.sim_repo.save_scenario(scenario)

        sim_result = SimulationResult(
            scenario_id=saved_scenario.id,
            original_generation=result.original_generation,
            available_generation=result.available_generation,
            total_demand=result.total_demand,
            deficit=result.deficit,
            surplus=result.surplus,
            affected_consumers=[ac.model_dump() for ac in result.affected_consumers],
            allocation_results=[],
            utilization_percentage=result.new_utilization,
        )
        self.sim_repo.save_result(sim_result)

    def get_all_scenarios(self) -> list[ScenarioSummaryResponse]:
        """Get all saved scenarios."""
        scenarios = self.sim_repo.get_all_scenarios()
        return [ScenarioSummaryResponse.model_validate(s) for s in scenarios]

    def get_scenario_detail(self, scenario_id: int) -> dict:
        """Get a scenario with its results."""
        scenario = self.sim_repo.get_scenario_by_id(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        results = self.sim_repo.get_results_by_scenario(scenario_id)
        return {
            "scenario": ScenarioSummaryResponse.model_validate(scenario),
            "results": [
                {
                    "id": r.id,
                    "original_generation": r.original_generation,
                    "available_generation": r.available_generation,
                    "total_demand": r.total_demand,
                    "deficit": r.deficit,
                    "surplus": r.surplus,
                    "affected_consumers": r.affected_consumers,
                    "utilization_percentage": r.utilization_percentage,
                }
                for r in results
            ],
        }
