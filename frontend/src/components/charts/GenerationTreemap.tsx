import React from 'react';
import ReactECharts from 'echarts-for-react';
import { GenerationByGas } from '../../types';

interface GenerationTreemapProps {
  data: GenerationByGas[];
}

export const GenerationTreemap: React.FC<GenerationTreemapProps> = ({ data }) => {
  const treemapData = data.map((gas) => ({
    name: gas.short_name,
    value: gas.total_generation,
    children: gas.sources.map((src) => ({
      name: `${src.source_name}\n(${src.generation_value.toLocaleString()} Nm³/hr)`,
      value: src.generation_value,
      sourceName: src.source_name,
      plantArea: src.plant_area,
    })),
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (info: any) => {
        const val = info.value;
        const treePathInfo = info.treePathInfo;
        const treePath = [];
        for (let i = 1; i < treePathInfo.length; i++) {
          treePath.push(treePathInfo[i].name);
        }
        return [
          `<div class="font-bold border-b border-slate-700 pb-1 mb-1">${treePath.join(' > ')}</div>`,
          `<div class="text-xs">Generation: <span class="font-mono font-bold">${val.toLocaleString()} Nm³/hr</span></div>`,
        ].join('');
      },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC' },
    },
    series: [
      {
        name: 'Gas Generation Share',
        type: 'treemap',
        visibleMin: 300,
        label: {
          show: true,
          formatter: '{b}',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: 11,
        },
        upperLabel: {
          show: true,
          height: 25,
          color: '#94A3B8',
          fontWeight: 'bold',
        },
        itemStyle: {
          borderColor: '#0F172A',
          borderWidth: 2,
          gapWidth: 2,
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#0F172A',
              borderWidth: 3,
              gapWidth: 3,
            },
            upperLabel: { show: false },
          },
          {
            color: ['#3B82F6', '#10B981', '#F59E0B'],
            colorMappingBy: 'id',
            itemStyle: {
              borderColor: '#1E293B',
              borderWidth: 2,
              gapWidth: 2,
            },
          },
        ],
        data: treemapData,
      },
    ],
  };

  return (
    <div className="w-full h-96 bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-2 tracking-wide flex items-center justify-between">
        <span>Generation Share by Gas Type & Source</span>
        <span className="text-xs font-normal text-slate-400">Hierarchical Share</span>
      </h3>
      <ReactECharts option={option} style={{ height: '330px', width: '100%' }} />
    </div>
  );
};
