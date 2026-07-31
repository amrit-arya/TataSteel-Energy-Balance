import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import {
  Cpu,
  AlertTriangle,
  Play,
  CheckCircle2,
  Users,
  Flame,
  Factory,
  Save,
  RotateCcw
} from 'lucide-react';
import { SimulationResult, GeneratorFailureRequest, ConsumerFailureRequest } from '../types';

export const SimulationPage: React.FC = () => {
  const [simType, setSimType] = useState<'generator' | 'consumer'>('generator');

  // Generator failure form state
  const [genGas, setGenGas] = useState<string>('BFG');
  const [genSourceId, setGenSourceId] = useState<string>('BFG-GEN-001');
  const [genFailurePct, setGenFailurePct] = useState<number>(50);
  const [genStrategy, setGenStrategy] = useState<string>('proportional');

  // Consumer failure form state
  const [conGas, setConGas] = useState<string>('BFG');
  const [conConsumerId, setConConsumerId] = useState<string>('BFG-CON-EXT-005');
  const [conShutdownPct, setConShutdownPct] = useState<number>(100);

  const [result, setResult] = useState<SimulationResult | null>(null);

  // Queries for dropdown options
  const { data: generationData } = useQuery({
    queryKey: ['generation'],
    queryFn: api.getGeneration,
  });

  const { data: consumptionData } = useQuery({
    queryKey: ['consumption'],
    queryFn: api.getConsumption,
  });

  // Generator simulation mutation
  const genMutation = useMutation({
    mutationFn: api.simulateGeneratorFailure,
    onSuccess: (data) => setResult(data),
  });

  // Consumer simulation mutation
  const conMutation = useMutation({
    mutationFn: api.simulateConsumerFailure,
    onSuccess: (data) => setResult(data),
  });

  // Source options for selected gas
  const currentGasSources = generationData?.find((g) => g.gas_id === genGas)?.sources || [];
  const currentGasConsumers = consumptionData?.find((g) => g.gas_id === conGas)?.consumers || [];

  const handleRunGeneratorSim = (e: React.FormEvent) => {
    e.preventDefault();
    const req: GeneratorFailureRequest = {
      gas_type_id: genGas,
      source_id: genSourceId,
      failure_percentage: genFailurePct,
      allocation_strategy: genStrategy,
      scenario_name: `Simulation: ${genSourceId} Failure @ ${genFailurePct}% (${genStrategy})`,
    };
    genMutation.mutate(req);
  };

  const handleRunConsumerSim = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ConsumerFailureRequest = {
      gas_type_id: conGas,
      consumer_id: conConsumerId,
      shutdown_percentage: conShutdownPct,
      scenario_name: `Simulation: ${conConsumerId} Shutdown @ ${conShutdownPct}%`,
    };
    conMutation.mutate(req);
  };

  return (
    <Layout
      title="Fuel Gas Impact Simulation Engine"
      subtitle="Operational Decision-Support System: What-If Generator Failure & Consumer Shutdown Analysis"
    >
      {/* Simulation Mode Toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            setSimType('generator');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            simType === 'generator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
              : 'bg-[#131C31] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          Generator Failure Simulation
        </button>

        <button
          onClick={() => {
            setSimType('consumer');
            setResult(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            simType === 'consumer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400'
              : 'bg-[#131C31] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Consumer Shutdown Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls Sidebar */}
        <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
          {simType === 'generator' ? (
            <form onSubmit={handleRunGeneratorSim} className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Generator Failure Parameters
              </h3>

              {/* Gas Type Select */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Gas Type</label>
                <select
                  value={genGas}
                  onChange={(e) => {
                    setGenGas(e.target.value);
                    const firstSrc = generationData?.find((g) => g.gas_id === e.target.value)?.sources[0];
                    if (firstSrc) setGenSourceId(firstSrc.id);
                  }}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="BFG">Blast Furnace Gas (BFG)</option>
                  <option value="COG">Coke Oven Gas (COG)</option>
                  <option value="LDG">Linz-Donawitz Gas (LDG)</option>
                </select>
              </div>

              {/* Source Select */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Failing Source</label>
                <select
                  value={genSourceId}
                  onChange={(e) => setGenSourceId(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  {currentGasSources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.source_name} ({s.generation_value.toLocaleString()} Nm³/hr)
                    </option>
                  ))}
                </select>
              </div>

              {/* Failure % Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span className="uppercase">Failure Level</span>
                  <span className="text-blue-400 font-mono font-bold">{genFailurePct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={genFailurePct}
                  onChange={(e) => setGenFailurePct(Number(e.target.value))}
                  className="mt-2 w-full accent-blue-500 bg-slate-800"
                />
              </div>

              {/* Allocation Strategy */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Allocation Engine Strategy</label>
                <select
                  value={genStrategy}
                  onChange={(e) => setGenStrategy(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="proportional">Proportional Share Allocation</option>
                  <option value="priority">Priority Order Allocation (P-1 First)</option>
                  <option value="equal">Equal Share Allocation</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={genMutation.isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {genMutation.isPending ? 'Calculating Simulation...' : 'Execute Failure Simulation'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRunConsumerSim} className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Consumer Shutdown Parameters
              </h3>

              {/* Gas Type Select */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Gas Type</label>
                <select
                  value={conGas}
                  onChange={(e) => {
                    setConGas(e.target.value);
                    const firstCon = consumptionData?.find((g) => g.gas_id === e.target.value)?.consumers[0];
                    if (firstCon) setConConsumerId(firstCon.id);
                  }}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="BFG">Blast Furnace Gas (BFG)</option>
                  <option value="COG">Coke Oven Gas (COG)</option>
                </select>
              </div>

              {/* Consumer Select */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Consumer Unit</label>
                <select
                  value={conConsumerId}
                  onChange={(e) => setConConsumerId(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  {currentGasConsumers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.consumer_name} ({c.consumption_value ? `${c.consumption_value.toLocaleString()} Nm³/hr` : 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shutdown % Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span className="uppercase">Shutdown Reduction</span>
                  <span className="text-emerald-400 font-mono font-bold">{conShutdownPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={conShutdownPct}
                  onChange={(e) => setConShutdownPct(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-500 bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={conMutation.isPending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {conMutation.isPending ? 'Calculating Simulation...' : 'Execute Shutdown Simulation'}
              </button>
            </form>
          )}
        </div>

        {/* Simulation Output & Consumer Impact View */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              {/* Summary KPIs Banner */}
              <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {result.scenario_name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target Unit: <span className="font-bold text-blue-400">{result.target_name}</span> | Strategy: <span className="font-mono text-cyan-400">{result.allocation_strategy}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold">
                    SIMULATION COMPLETE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Original Supply</span>
                    <p className="text-lg font-bold font-mono text-white">{result.original_generation.toLocaleString()} Nm³/hr</p>
                  </div>

                  <div>
                    <span className="text-slate-400">Available Supply</span>
                    <p className="text-lg font-bold font-mono text-emerald-400">{result.available_generation.toLocaleString()} Nm³/hr</p>
                  </div>

                  <div>
                    <span className="text-slate-400">Network Deficit</span>
                    <p className={`text-lg font-bold font-mono ${result.deficit > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {result.deficit > 0 ? `-${result.deficit.toLocaleString()}` : '0'} Nm³/hr
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">New Utilization</span>
                    <p className={`text-lg font-bold font-mono ${result.new_utilization! > 100 ? 'text-red-400' : 'text-blue-400'}`}>
                      {result.new_utilization}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Affected Consumers Impact Table */}
              <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white tracking-wide mb-3 flex items-center justify-between">
                  <span>Consumer Allocation & Impact Analysis ({result.affected_consumers.length} Consumers)</span>
                  <span className="text-xs font-normal text-slate-400">
                    Deficit Count: <strong className="text-red-400">{result.total_affected_count}</strong>
                  </span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Consumer Name</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5 text-right">Original Demand</th>
                        <th className="px-3 py-2.5 text-right">Allocated Supply</th>
                        <th className="px-3 py-2.5 text-right">Shortage</th>
                        <th className="px-3 py-2.5 text-center">Impact Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {result.affected_consumers.map((ac) => (
                        <tr key={ac.consumer_id} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2.5 font-sans font-bold text-white">{ac.consumer_name}</td>
                          <td className="px-3 py-2.5 font-sans text-slate-400">{ac.consumer_type}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-white">{ac.original_demand.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-emerald-400">{ac.allocated_amount.toLocaleString()}</td>
                          <td className={`px-3 py-2.5 text-right font-bold ${ac.deficit > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {ac.deficit > 0 ? `-${ac.deficit.toLocaleString()}` : '0'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-sans">
                            {ac.impact_percentage > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                                -{ac.impact_percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                100% Served
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[500px] bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Cpu className="w-12 h-12 text-blue-500/40 mb-3 animate-pulse" />
              <h4 className="text-base font-bold text-white">Impact Simulation Engine Ready</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Configure parameters in the form on the left and click <strong className="text-blue-400">Execute Failure Simulation</strong> to model gas redistribution across Tata Steel plant consumers.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
