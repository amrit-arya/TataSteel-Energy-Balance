import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { Bookmark, Cpu, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);

  const { data: scenarios, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['scenarios'],
    queryFn: api.getScenarios,
  });

  const { data: detail } = useQuery({
    queryKey: ['scenario-detail', selectedScenarioId],
    queryFn: () => (selectedScenarioId ? api.getScenarioDetail(selectedScenarioId) : null),
    enabled: !!selectedScenarioId,
  });

  if (isLoading) {
    return (
      <Layout title="Saved Scenarios Intelligence" subtitle="Historical Simulation Logs & Scenario Library">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Saved Scenarios Intelligence"
      subtitle="Operational Decision-Support Scenario Library & Scenario Comparison"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario List */}
        <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-400" />
              Saved Scenarios
            </span>
            <span className="text-xs font-mono text-slate-400">({scenarios?.length || 0})</span>
          </h3>

          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {scenarios && scenarios.length > 0 ? (
              scenarios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedScenarioId === s.id
                      ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-blue-400">{s.gas_type_id} Network</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{s.scenario_name}</h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Strategy: <strong className="text-cyan-400">{s.allocation_strategy}</strong></span>
                    <span className="text-amber-400 font-bold">{s.failure_percentage}% Loss</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No saved scenarios found. Run simulations from the <strong className="text-blue-400">Impact Simulation</strong> dashboard to save scenarios here.
              </div>
            )}
          </div>
        </div>

        {/* Scenario Details View */}
        <div className="lg:col-span-2">
          {detail ? (
            <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-blue-400 uppercase">Scenario #{detail.scenario.id} Details</span>
                <h3 className="text-lg font-bold text-white mt-1">{detail.scenario.scenario_name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gas: <strong>{detail.scenario.gas_type_id}</strong> | Target: <strong>{detail.scenario.target_id}</strong> | Impact: <strong>{detail.scenario.failure_percentage}%</strong>
                </p>
              </div>

              {detail.results && detail.results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Original Supply</span>
                    <p className="text-base font-bold font-mono text-white mt-1">
                      {detail.results[0].original_generation?.toLocaleString()} Nm³/hr
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Available Supply</span>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                      {detail.results[0].available_generation?.toLocaleString()} Nm³/hr
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Network Deficit</span>
                    <p className="text-base font-bold font-mono text-red-400 mt-1">
                      -{detail.results[0].deficit?.toLocaleString()} Nm³/hr
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400">New Utilization</span>
                    <p className="text-base font-bold font-mono text-blue-400 mt-1">
                      {detail.results[0].utilization_percentage}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[450px] bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Bookmark className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Select any saved scenario from the list to view comprehensive results</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
