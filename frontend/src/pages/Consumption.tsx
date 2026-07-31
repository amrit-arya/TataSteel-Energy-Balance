import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { ConsumptionSunburst } from '../components/charts/ConsumptionSunburst';
import { Flame, Filter, AlertTriangle, Layers } from 'lucide-react';

export const ConsumptionPage: React.FC = () => {
  const [selectedGas, setSelectedGas] = useState<string>('ALL');
  const [consumerTypeFilter, setConsumerTypeFilter] = useState<string>('ALL');

  const { data: consumption, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['consumption'],
    queryFn: api.getConsumption,
  });

  if (isLoading || !consumption) {
    return (
      <Layout title="Gas Consumption Intelligence" subtitle="Monitoring 33 Gas Consumers Across Tata Steel Plant Areas">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Filter Data
  const filteredData = selectedGas === 'ALL'
    ? consumption
    : consumption.filter((c) => c.gas_id === selectedGas);

  // Flatten consumers for ranking table
  const allConsumers: { id: string; name: string; gas: string; type: string; value: number | null; priority: number }[] = [];

  consumption.forEach((g) => {
    if (selectedGas === 'ALL' || g.gas_id === selectedGas) {
      if (g.consumers && g.consumers.length > 0) {
        g.consumers.forEach((c) => {
          if (consumerTypeFilter === 'ALL' || c.consumer_type === consumerTypeFilter) {
            allConsumers.push({
              id: c.id,
              name: c.consumer_name,
              gas: g.short_name,
              type: c.consumer_type,
              value: c.consumption_value,
              priority: c.priority,
            });
          }
        });
      }
    }
  });

  allConsumers.sort((a, b) => (b.value || 0) - (a.value || 0));
  const totalConsumptionSum = allConsumers.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <Layout
      title="Gas Consumption Intelligence"
      subtitle="Detailed Demand Monitoring Across Internal Blast Furnace Self-Consumption & External Plant Areas"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl mb-6">
        {/* Gas Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Gas Type:</span>
          {['ALL', 'BFG', 'COG', 'LDG'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedGas(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGas === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Consumer Type Filter (Internal vs External) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          {['ALL', 'Internal', 'External'].map((cat) => (
            <button
              key={cat}
              onClick={() => setConsumerTypeFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                consumerTypeFilter === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sunburst Donut Chart */}
      <div className="mb-6">
        <ConsumptionSunburst data={filteredData} />
      </div>

      {/* Consumers Table */}
      <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Gas Consumers Demand Ranking & Priority
            </h3>
            <p className="text-xs text-slate-400">
              Total Filtered Demand: <span className="font-mono font-bold text-emerald-400">{totalConsumptionSum.toLocaleString()} Nm³/hr</span>
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            {allConsumers.length} Consumer Units
          </span>
        </div>

        {selectedGas === 'LDG' && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">LD Gas Consumption Data Unavailable</p>
              <p className="text-[11px] text-slate-400">
                The Excel source workbook contains no consumer records for Linz-Donawitz Gas. The dashboard maintains strict data integrity and displays Data Unavailable rather than fabricating zeros.
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Consumer ID</th>
                <th className="px-4 py-3">Consumer Name</th>
                <th className="px-4 py-3">Gas Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Allocation Priority</th>
                <th className="px-4 py-3 text-right">Consumption (Nm³/hr)</th>
                <th className="px-4 py-3 text-right">Demand Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allConsumers.map((c, idx) => {
                const share = c.value ? ((c.value / totalConsumptionSum) * 100).toFixed(2) : 'N/A';
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {c.gas}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          c.type === 'Internal'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                        P-{c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {c.value ? c.value.toLocaleString() : <span className="text-amber-400 italic">Data Unavailable</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-emerald-400">
                      {c.value ? `${share}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
