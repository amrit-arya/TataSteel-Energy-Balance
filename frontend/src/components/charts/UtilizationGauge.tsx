import React from 'react';
import ReactECharts from 'echarts-for-react';

interface UtilizationGaugeProps {
  title: string;
  value: number | null;
  statusLabel?: string;
}

export const UtilizationGauge: React.FC<UtilizationGaugeProps> = ({
  title,
  value,
  statusLabel,
}) => {
  const isUnavailable = value === null || value === undefined;

  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 120,
        splitNumber: 6,
        itemStyle: {
          color: value && value > 100 ? '#EF4444' : value && value > 90 ? '#F59E0B' : '#3B82F6',
        },
        progress: {
          show: true,
          width: 12,
        },
        pointer: {
          show: !isUnavailable,
          length: '60%',
          width: 4,
          itemStyle: { color: '#F8FAFC' },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [0.75, '#10B981'],
              [0.85, '#F59E0B'],
              [1, '#EF4444'],
            ],
          },
        },
        axisTick: {
          distance: -20,
          length: 5,
          lineStyle: { color: '#475569', width: 1 },
        },
        splitLine: {
          distance: -24,
          length: 8,
          lineStyle: { color: '#64748B', width: 2 },
        },
        axisLabel: {
          color: '#94A3B8',
          distance: -15,
          fontSize: 10,
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 10,
          itemStyle: { borderWidth: 2, borderColor: '#3B82F6' },
        },
        title: {
          show: true,
          offsetCenter: [0, '75%'],
          fontSize: 12,
          color: '#94A3B8',
          fontWeight: 600,
        },
        detail: {
          valueAnimation: true,
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '40%'],
          color: '#FFFFFF',
          formatter: (val: number) => (isUnavailable ? 'N/A' : `${val.toFixed(1)}%`),
        },
        data: [
          {
            value: isUnavailable ? 0 : value,
            name: statusLabel || title,
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
        {isUnavailable ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Data Unavailable
          </span>
        ) : value! > 100 ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
            Over Capacity
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Optimal
          </span>
        )}
      </div>

      {isUnavailable ? (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
          <p className="text-amber-400 font-semibold text-sm">Consumption Data Unavailable</p>
          <p className="text-slate-500 text-xs mt-1">Utilization cannot be calculated for {title}</p>
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: '180px', width: '100%' }} />
      )}
    </div>
  );
};
