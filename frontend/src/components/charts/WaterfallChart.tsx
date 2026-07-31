import React from 'react';
import ReactECharts from 'echarts-for-react';
import { GasBalance, ConsumptionByGas } from '../../types';

interface WaterfallChartProps {
  gasBalances: GasBalance[];
  consumptionData: ConsumptionByGas[];
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  gasBalances,
  consumptionData,
}) => {
  // We'll showcase the Blast Furnace Gas flow waterfall as primary industrial example
  const bfGas = gasBalances.find((g) => g.gas_id === 'BFG');
  const bfConsumption = consumptionData.find((c) => c.gas_id === 'BFG');

  let internalConsumption = 0;
  let externalConsumption = 0;

  if (bfConsumption && bfConsumption.consumers) {
    bfConsumption.consumers.forEach((c) => {
      if (c.consumer_type === 'Internal' && c.consumption_value) {
        internalConsumption += c.consumption_value;
      } else if (c.consumer_type === 'External' && c.consumption_value) {
        externalConsumption += c.consumption_value;
      }
    });
  }

  const totalGen = bfGas ? bfGas.total_generation : 1721200;
  const afterInternal = totalGen - internalConsumption;
  const netBalance = afterInternal - externalConsumption;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
      formatter: (params: any[]) => {
        const p = params[1];
        return `
          <div class="font-bold border-b border-slate-700 pb-1 mb-1">${p.name}</div>
          <div class="text-xs">Volume: <span class="font-mono font-bold">${p.value.toLocaleString()} Nm³/hr</span></div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '30px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      splitLine: { show: false },
      data: ['Total BF Generation', 'Internal Consumption', 'External Consumption', 'Net BF Deficit'],
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      name: 'Nm³/hr',
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent',
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
        },
        data: [0, afterInternal, 0, 0],
      },
      {
        name: 'BF Gas Flow',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
          color: '#FFFFFF',
          fontFamily: 'monospace',
          formatter: (p: any) => `${p.value.toLocaleString()} Nm³/hr`,
        },
        data: [
          { value: totalGen, itemStyle: { color: '#3B82F6' } },
          { value: internalConsumption, itemStyle: { color: '#F59E0B' } },
          { value: externalConsumption, itemStyle: { color: '#8B5CF6' } },
          { value: Math.abs(netBalance), itemStyle: { color: '#EF4444' } },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-80 bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-1 tracking-wide flex items-center justify-between">
        <span>Blast Furnace Gas Waterfall Balance Flow</span>
        <span className="text-xs font-semibold text-red-400">Deficit: -14,800 Nm³/hr</span>
      </h3>
      <ReactECharts option={option} style={{ height: '250px', width: '100%' }} />
    </div>
  );
};
