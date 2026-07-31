import React from 'react';
import { GasBalance } from '../../types';
import { Flame, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GasSummaryCardProps {
  gas: GasBalance;
}

export const GasSummaryCard: React.FC<GasSummaryCardProps> = ({ gas }) => {
  const isUnavailable = gas.data_status !== 'Complete';
  const isDeficit = gas.balance !== null && gas.balance < 0;

  const gasColors: Record<string, { badge: string; text: string; bg: string }> = {
    BFG: {
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      text: 'text-blue-400',
      bg: 'from-blue-500/10 to-transparent',
    },
    COG: {
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      text: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-transparent',
    },
    LDG: {
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      text: 'text-amber-400',
      bg: 'from-amber-500/10 to-transparent',
    },
  };

  const theme = gasColors[gas.gas_id] || gasColors.BFG;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 p-5 transition-all duration-200 hover:border-slate-700">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} pointer-events-none`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${theme.badge}`}>
              {gas.gas_id}
            </span>
            <h3 className="font-bold text-white text-base tracking-wide">
              {gas.gas_name}
            </h3>
          </div>

          {/* Status Pill */}
          {isUnavailable ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Data Unavailable
            </span>
          ) : isDeficit ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Deficit
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Surplus
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          {/* Generation */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Generation</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">
              {gas.total_generation.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">Nm³/hr</p>
          </div>

          {/* Consumption */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Consumption</p>
            {isUnavailable ? (
              <p className="text-sm font-semibold text-amber-400 mt-1 italic">Data Unavailable</p>
            ) : (
              <>
                <p className="text-lg font-bold text-white font-mono mt-0.5">
                  {gas.total_consumption?.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Nm³/hr</p>
              </>
            )}
          </div>

          {/* Balance */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Net Balance</p>
            {isUnavailable ? (
              <p className="text-sm font-semibold text-amber-400 mt-1 italic">Data Unavailable</p>
            ) : (
              <>
                <p className={`text-lg font-bold font-mono mt-0.5 ${isDeficit ? 'text-red-400' : 'text-emerald-400'}`}>
                  {gas.balance! > 0 ? `+${gas.balance?.toLocaleString()}` : gas.balance?.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Nm³/hr</p>
              </>
            )}
          </div>

          {/* Utilization */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Utilization</p>
            {isUnavailable ? (
              <p className="text-sm font-semibold text-amber-400 mt-1 italic">Data Unavailable</p>
            ) : (
              <>
                <p className={`text-lg font-bold font-mono mt-0.5 ${gas.utilization_percentage! > 100 ? 'text-red-400' : 'text-blue-400'}`}>
                  {gas.utilization_percentage}%
                </p>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${gas.utilization_percentage! > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, gas.utilization_percentage!)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
