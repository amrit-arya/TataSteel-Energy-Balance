import React from 'react';
import ReactECharts from 'echarts-for-react';
import { GasBalance } from '../../types';

interface GasBalanceChartProps {
  data: GasBalance[];
}

export const GasBalanceChart: React.FC<GasBalanceChartProps> = ({ data }) => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      formatter: (params: any[]) => {
        let res = `<div class="font-bold border-b border-slate-700 pb-1 mb-1">${params[0].name}</div>`;
        params.forEach(p => {
          const val = p.value !== null && p.value !== undefined ? `${p.value.toLocaleString()} Nm³/hr` : 'Data Unavailable';
          res += `<div class="flex items-center justify-between gap-4 text-xs">
            <span style="color:${p.color}">● ${p.seriesName}:</span>
            <span class="font-mono font-bold">${val}</span>
          </div>`;
        });
        return res;
      }
    },
    legend: {
      data: ['Generation', 'Consumption', 'Balance'],
      textStyle: { color: '#94A3B8' },
      top: 0,
      right: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.short_name),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8', fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      name: 'Nm³/hr',
      nameTextStyle: { color: '#64748B' },
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: [
      {
        name: 'Generation',
        type: 'bar',
        barGap: 0,
        data: data.map(d => d.total_generation),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#1D4ED8' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Consumption',
        type: 'bar',
        data: data.map(d => d.total_consumption),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10B981' },
              { offset: 1, color: '#047857' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: 'Balance',
        type: 'bar',
        data: data.map(d => d.balance),
        itemStyle: {
          color: (params: any) => {
            const val = params.value;
            if (val === null || val === undefined) return '#64748B';
            return val >= 0 ? '#06B6D4' : '#EF4444';
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="w-full h-80 bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-2 tracking-wide flex items-center justify-between">
        <span>Gas Generation vs Consumption Comparison</span>
        <span className="text-xs font-normal text-slate-400">Nm³/hr</span>
      </h3>
      <ReactECharts option={option} style={{ height: '260px', width: '100%' }} />
    </div>
  );
};
