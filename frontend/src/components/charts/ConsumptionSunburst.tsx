import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ConsumptionByGas } from '../../types';

interface ConsumptionSunburstProps {
  data: ConsumptionByGas[];
}

export const ConsumptionSunburst: React.FC<ConsumptionSunburstProps> = ({ data }) => {
  // Aggregate top consumers across all gas types
  const allConsumers: { name: string; value: number; gas: string; type: string }[] = [];

  data.forEach((gas) => {
    if (gas.consumers && gas.consumers.length > 0) {
      gas.consumers.forEach((c) => {
        if (c.consumption_value) {
          allConsumers.push({
            name: `${c.consumer_name} (${gas.short_name})`,
            value: c.consumption_value,
            gas: gas.short_name,
            type: c.consumer_type,
          });
        }
      });
    }
  });

  // Sort and take top 10 consumers
  allConsumers.sort((a, b) => b.value - a.value);
  const top10 = allConsumers.slice(0, 12);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
          <div class="font-bold border-b border-slate-700 pb-1 mb-1">${params.name}</div>
          <div class="text-xs">Consumption: <span class="font-mono font-bold">${params.value.toLocaleString()} Nm³/hr</span></div>
          <div class="text-xs text-slate-400">Share: ${params.percent}%</div>
        `;
      },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      textStyle: { color: '#94A3B8', fontSize: 11 },
    },
    series: [
      {
        name: 'Top Consumers',
        type: 'pie',
        radius: ['40%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0F172A',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#FFFFFF',
            formatter: '{b}\n{c} Nm³/hr',
          },
        },
        labelLine: { show: false },
        data: top10.map((c) => ({
          name: c.name,
          value: c.value,
        })),
      },
    ],
  };

  return (
    <div className="w-full h-96 bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-2 tracking-wide flex items-center justify-between">
        <span>Major Consumer Demand Distribution</span>
        <span className="text-xs font-normal text-slate-400">Top 12 Consumers</span>
      </h3>
      <ReactECharts option={option} style={{ height: '330px', width: '100%' }} />
    </div>
  );
};
