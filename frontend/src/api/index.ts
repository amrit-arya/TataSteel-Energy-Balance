import {
  OverviewKPI,
  GasBalance,
  GenerationByGas,
  ConsumptionByGas,
  Utilization,
  NetworkData,
  Alert,
  GeneratorFailureRequest,
  ConsumerFailureRequest,
  SimulationResult,
  ScenarioSummary
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
  }

  return response.json();
}

export const api = {
  getOverview: (): Promise<OverviewKPI> => fetchJson<OverviewKPI>('/overview'),
  
  getGasBalances: (): Promise<GasBalance[]> => fetchJson<GasBalance[]>('/gas-balance'),
  getGasBalanceById: (gasId: string): Promise<GasBalance> => fetchJson<GasBalance>(`/gas-balance/${gasId}`),
  
  getGeneration: (): Promise<GenerationByGas[]> => fetchJson<GenerationByGas[]>('/generation'),
  getGenerationByGas: (gasId: string): Promise<GenerationByGas> => fetchJson<GenerationByGas>(`/generation/${gasId}`),
  
  getConsumption: (): Promise<ConsumptionByGas[]> => fetchJson<ConsumptionByGas[]>('/consumption'),
  getConsumptionByGas: (gasId: string): Promise<ConsumptionByGas> => fetchJson<ConsumptionByGas>(`/consumption/${gasId}`),
  
  getUtilization: (): Promise<Utilization[]> => fetchJson<Utilization[]>('/utilization'),
  
  getNetwork: (gasTypeId?: string): Promise<NetworkData> => {
    const query = gasTypeId ? `?gas_type_id=${gasTypeId}` : '';
    return fetchJson<NetworkData>(`/network${query}`);
  },
  
  getAlerts: (includeResolved = false): Promise<Alert[]> => {
    return fetchJson<Alert[]>(`/alerts?include_resolved=${includeResolved}`);
  },
  
  simulateGeneratorFailure: (request: GeneratorFailureRequest): Promise<SimulationResult> => {
    return fetchJson<SimulationResult>('/simulation/generator', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  simulateConsumerFailure: (request: ConsumerFailureRequest): Promise<SimulationResult> => {
    return fetchJson<SimulationResult>('/simulation/consumer', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  getScenarios: (): Promise<ScenarioSummary[]> => fetchJson<ScenarioSummary[]>('/simulation/scenarios'),
  getScenarioDetail: (id: number): Promise<any> => fetchJson<any>(`/simulation/scenarios/${id}`),
};
