import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { UtilizationGauge } from '../components/charts/UtilizationGauge';
import { Gauge, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const UtilizationPage: React.FC = () => {
  const { data: utilization, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['utilization'],
    queryFn: api.getUtilization,
  });

  if (isLoading || !utilization) {
    return (
      <Layout title="Gas Utilization Intelligence" subtitle="System Capacity & Over-Utilization Threshold Monitoring">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Gas Utilization Intelligence"
      subtitle="Real-time Network Load Factor & Over-Capacity Risk Monitoring"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* 3 Utilization Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {utilization.map((u) => (
          <UtilizationGauge
            key={u.gas_id}
            title={u.gas_name}
            value={u.utilization_percentage}
            statusLabel={`${u.short_name} Load Factor`}
          />
        ))}
      </div>

      {/* Threshold Status Banner */}
      <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 mb-6">
        <h3 className="text-base font-bold text-white tracking-wide mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Network Load Factor Threshold Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400">OPTIMAL RANGE (&le; 90%)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">Safe Operating Margin</p>
            <p className="text-xs text-slate-400 mt-1">
              Provides cushion for sudden consumer spikes or minor generator fluctuations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-400">WARNING RANGE (90% - 100%)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-white">Coke Oven Gas (94.79%)</p>
            <p className="text-xs text-slate-400 mt-1">
              High load factor. Tight margin between available gas and total demand.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-red-400">CRITICAL RANGE (&gt; 100%)</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-white">Blast Furnace Gas (100.86%)</p>
            <p className="text-xs text-slate-400 mt-1">
              Demand exceeds generation. Network is operating in deficit. Action required.
            </p>
          </div>
        </div>
      </div>

      {/* Utilization Details Table */}
      <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
        <h3 className="text-base font-bold text-white tracking-wide mb-4">
          Detailed Network Utilization Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Gas ID</th>
                <th className="px-4 py-3">Gas Name</th>
                <th className="px-4 py-3 text-right">Available Supply</th>
                <th className="px-4 py-3 text-right">Consumer Demand</th>
                <th className="px-4 py-3 text-right">Utilization %</th>
                <th className="px-4 py-3 text-center">Threshold Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {utilization.map((u) => {
                const isUnavail = u.data_status !== 'Complete';
                return (
                  <tr key={u.gas_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">{u.gas_id}</td>
                    <td className="px-4 py-3 font-bold text-white">{u.gas_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {u.total_generation.toLocaleString()} Nm³/hr
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {isUnavail ? <span className="text-amber-400 italic">Data Unavailable</span> : `${u.total_consumption?.toLocaleString()} Nm³/hr`}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {isUnavail ? 'N/A' : `${u.utilization_percentage}%`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isUnavail ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Data Unavailable
                        </span>
                      ) : u.threshold_status === 'critical' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                          Critical (&gt;100%)
                        </span>
                      ) : u.threshold_status === 'warning' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Warning (90-100%)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Normal (&lt;90%)
                        </span>
                      )}
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
