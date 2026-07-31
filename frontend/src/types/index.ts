export interface GasBalance {
  gas_id: string;
  gas_name: string;
  short_name: string;
  total_generation: number;
  total_consumption: number | null;
  balance: number | null;
  utilization_percentage: number | null;
  data_status: string;
}

export interface OverviewKPI {
  total_generation: number;
  total_consumption: number | null;
  net_balance: number | null;
  overall_utilization: number | null;
  total_sources: number;
  total_consumers: number;
  critical_alerts: number;
  warning_alerts: number;
  healthy_systems: number;
  gas_balances: GasBalance[];
}

export interface GenerationSource {
  id: string;
  gas_type_id: string;
  source_name: string;
  plant_area: string;
  generation_value: number;
  unit: string;
  is_active: boolean;
}

export interface GenerationByGas {
  gas_id: string;
  gas_name: string;
  short_name: string;
  total_generation: number;
  source_count: number;
  sources: GenerationSource[];
}

export interface Consumer {
  id: string;
  gas_type_id: string;
  consumer_name: string;
  consumer_type: 'Internal' | 'External';
  consumption_value: number | null;
  priority: number;
  unit: string;
  is_active: boolean;
}

export interface ConsumptionByGas {
  gas_id: string;
  gas_name: string;
  short_name: string;
  total_consumption: number | null;
  consumer_count: number;
  data_status: string;
  consumers: Consumer[];
}

export interface Utilization {
  gas_id: string;
  gas_name: string;
  short_name: string;
  total_generation: number;
  total_consumption: number | null;
  utilization_percentage: number | null;
  data_status: string;
  threshold_status: 'normal' | 'warning' | 'critical' | 'unavailable';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'generator' | 'pool' | 'consumer';
  gas_type_id: string;
  value: number | null;
  consumer_type?: string | null;
  metadata: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  value: number | null;
  gas_type_id: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface Alert {
  id: number;
  alert_type: string;
  severity: 'critical' | 'warning' | 'info';
  gas_type_id: string | null;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface AffectedConsumer {
  consumer_id: string;
  consumer_name: string;
  consumer_type: string;
  original_demand: number;
  allocated_amount: number;
  deficit: number;
  impact_percentage: number;
}

export interface SimulationResult {
  scenario_name: string;
  scenario_type: 'generator_failure' | 'consumer_failure';
  gas_type_id: string;
  target_id: string;
  target_name: string;
  failure_percentage: number;
  allocation_strategy: string;
  original_generation: number;
  available_generation: number;
  generation_loss: number;
  total_demand: number;
  deficit: number;
  surplus: number;
  original_utilization: number | null;
  new_utilization: number | null;
  affected_consumers: AffectedConsumer[];
  total_affected_count: number;
  fully_supplied_count: number;
  partially_supplied_count: number;
  zero_supply_count: number;
}

export interface ScenarioSummary {
  id: number;
  scenario_name: string;
  scenario_type: string;
  gas_type_id: string;
  target_id: string;
  failure_percentage: number;
  allocation_strategy: string;
  created_at: string;
}

export interface GeneratorFailureRequest {
  gas_type_id: string;
  source_id: string;
  failure_percentage: number;
  allocation_strategy: string;
  scenario_name?: string;
}

export interface ConsumerFailureRequest {
  gas_type_id: string;
  consumer_id: string;
  shutdown_percentage: number;
  scenario_name?: string;
}
