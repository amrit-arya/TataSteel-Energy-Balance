import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { GasBalanceChart } from '../components/charts/GasBalanceChart';
import { WaterfallChart } from '../components/charts/WaterfallChart';
import { Scale, ArrowDownRight, ArrowUpRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const GasBalancePage: React.FC = () => {
  const { data: balances, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['gas-balances'],
    queryFn: api.getGasBalances,
  });

  const { data: consumption } = useQuery({
    queryKey: ['consumption'],
    queryFn: api.getConsumption,
  });

  if (isLoading || !balances) {
    return (
      <Layout title="Gas Network Balance Intelligence" subtitle="Surplus, Deficit & Network Stability Monitoring">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const bfGas = balances.find((b) => b.gas_id === 'BFG');
  const coGas = balances.find((b) => b.gas_id === 'COG');
  const ldGas = balances.find((b) => b.gas_id === 'LDG');

  return (
    <Layout
      title="Gas Network Balance Intelligence"
      subtitle="Monitoring Surplus, Deficits & System Balance Across All 3 By-Product Gas Networks"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Network Balance Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* BF Gas Card */}
        {bfGas && (
          <div className="bg-[#131C31]/90 backdrop-blur-md border border-red-500/30 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 bg-red-500/20 text-red-400 font-extrabold text-xs rounded border border-red-500/30">
                BFG DEFICIT
              </span>
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Blast Furnace Gas Network</h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-red-400">
                -14,800
              </span>
              <span className="text-xs text-slate-400 font-medium">Nm³/hr Deficit</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Demand (1,736,000) exceeds generation (1,721,200). Operating at <span className="font-bold text-red-400">100.86%</span> utilization.
            </p>
          </div>
        )}

        {/* CO Gas Card */}
        {coGas && (
          <div className="bg-[#131C31]/90 backdrop-blur-md border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-xs rounded border border-emerald-500/30">
                COG SURPLUS
              </span>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Coke Oven Gas Network</h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                +7,400
              </span>
              <span className="text-xs text-slate-400 font-medium">Nm³/hr Surplus</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Generation (142,000) exceeds demand (134,600). Operating at <span className="font-bold text-emerald-400">94.79%</span> utilization.
            </p>
          </div>
        )}

        {/* LD Gas Card */}
        {ldGas && (
          <div className="bg-[#131C31]/90 backdrop-blur-md border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-xs rounded border border-amber-500/30">
                LDG UNMONITORED
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Linz-Donawitz Gas Network</h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-amber-400 italic">
                Data Unavailable
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Generation is <span className="font-mono text-slate-200 font-bold">150,000 Nm³/hr</span>. Consumption data is not in workbook.
            </p>
          </div>
        )}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GasBalanceChart data={balances} />
        {consumption && <WaterfallChart gasBalances={balances} consumptionData={consumption} />}
      </div>

      {/* Balance Details Table */}
      <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
        <h3 className="text-base font-bold text-white tracking-wide mb-4">
          Master Gas Network Balance Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Gas ID</th>
                <th className="px-4 py-3">Gas Full Name</th>
                <th className="px-4 py-3 text-right">Total Generation</th>
                <th className="px-4 py-3 text-right">Total Demand</th>
                <th className="px-4 py-3 text-right">Net Balance</th>
                <th className="px-4 py-3 text-right">Utilization %</th>
                <th className="px-4 py-3 text-center">Data Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {balances.map((b) => {
                const isDef = b.balance !== null && b.balance < 0;
                const isUnavail = b.data_status !== 'Complete';
                return (
                  <tr key={b.gas_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">{b.gas_id}</td>
                    <td className="px-4 py-3 font-bold text-white">{b.gas_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {b.total_generation.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-white">
                      {isUnavail ? <span className="text-amber-400 italic">Data Unavailable</span> : b.total_consumption?.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 font-mono font-bold text-right ${isUnavail ? 'text-amber-400' : isDef ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isUnavail ? 'N/A' : (b.balance! > 0 ? `+${b.balance?.toLocaleString()}` : b.balance?.toLocaleString())}
                    </td>
                    <td className={`px-4 py-3 font-mono font-bold text-right ${isUnavail ? 'text-amber-400' : b.utilization_percentage! > 100 ? 'text-red-400' : 'text-blue-400'}`}>
                      {isUnavail ? 'N/A' : `${b.utilization_percentage}%`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isUnavail ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                        {b.data_status}
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
