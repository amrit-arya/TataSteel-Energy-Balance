import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { GenerationTreemap } from '../components/charts/GenerationTreemap';
import { Factory, Filter, CheckCircle } from 'lucide-react';

export const GenerationPage: React.FC = () => {
  const [selectedGas, setSelectedGas] = useState<string>('ALL');

  const { data: generation, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['generation'],
    queryFn: api.getGeneration,
  });

  if (isLoading || !generation) {
    return (
      <Layout title="Gas Generation Intelligence" subtitle="Monitoring 10 Generation Sources Across Plant Areas">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Filter sources
  const filteredData = selectedGas === 'ALL'
    ? generation
    : generation.filter((g) => g.gas_id === selectedGas);

  // Flatten all sources for ranking table
  const allSources: { id: string; name: string; gas: string; area: string; value: number; unit: string }[] = [];
  generation.forEach((g) => {
    g.sources.forEach((s) => {
      if (selectedGas === 'ALL' || g.gas_id === selectedGas) {
        allSources.push({
          id: s.id,
          name: s.source_name,
          gas: g.short_name,
          area: s.plant_area,
          value: s.generation_value,
          unit: s.unit,
        });
      }
    });
  });

  allSources.sort((a, b) => b.value - a.value);
  const totalGen = allSources.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Layout
      title="Gas Generation Intelligence"
      subtitle="Detailed Generation Analysis across Blast Furnaces, Coke Oven Batteries, and LD Converters"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Filter Gas Type:</span>
        </div>
        <div className="flex items-center gap-2">
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
              {type === 'ALL' ? 'All Gases (10 Sources)' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Generation Treemap */}
      <div className="mb-6">
        <GenerationTreemap data={filteredData} />
      </div>

      {/* Sources Ranking & Details Table */}
      <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Generation Sources Ranking & Metrics
            </h3>
            <p className="text-xs text-slate-400">
              Total Filtered Output: <span className="font-mono font-bold text-blue-400">{totalGen.toLocaleString()} Nm³/hr</span>
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
            {allSources.length} Active Sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Source ID</th>
                <th className="px-4 py-3">Source Name</th>
                <th className="px-4 py-3">Gas Type</th>
                <th className="px-4 py-3">Plant Area</th>
                <th className="px-4 py-3 text-right">Generation (Nm³/hr)</th>
                <th className="px-4 py-3 text-right">Share (%)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allSources.map((s, idx) => {
                const share = ((s.value / totalGen) * 100).toFixed(2);
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{s.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {s.gas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.area}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {s.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-blue-400">{share}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
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
