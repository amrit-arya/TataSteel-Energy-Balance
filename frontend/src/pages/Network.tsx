import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network as NetworkIcon, Filter, Layers, Info } from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const [selectedGas, setSelectedGas] = useState<string>('BFG');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const { data: network, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['network', selectedGas],
    queryFn: () => api.getNetwork(selectedGas),
  });

  // Transform backend NetworkNodes and NetworkEdges to ReactFlow Node and Edge formats
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!network) return { flowNodes: [], flowEdges: [] };

    const generators = network.nodes.filter((n) => n.type === 'generator');
    const pools = network.nodes.filter((n) => n.type === 'pool');
    const consumers = network.nodes.filter((n) => n.type === 'consumer');

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Layout configuration
    const colGenX = 50;
    const colPoolX = 450;
    const colConX = 850;

    // 1. Generator Nodes
    generators.forEach((gen, idx) => {
      nodes.push({
        id: gen.id,
        type: 'default',
        position: { x: colGenX, y: 50 + idx * 80 },
        data: {
          label: (
            <div className="p-2 text-left select-none">
              <div className="text-[10px] uppercase font-extrabold text-blue-400">Generator</div>
              <div className="font-bold text-xs text-white leading-tight">{gen.label}</div>
              <div className="text-[11px] font-mono text-slate-300 mt-1">
                {gen.value?.toLocaleString()} Nm³/hr
              </div>
            </div>
          ),
          raw: gen,
        },
        style: {
          background: '#131C31',
          border: '1px solid #3B82F6',
          borderRadius: '10px',
          width: 180,
          color: '#FFF',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)',
        },
      });
    });

    // 2. Pool Nodes
    pools.forEach((pool, idx) => {
      nodes.push({
        id: pool.id,
        type: 'default',
        position: { x: colPoolX, y: 150 + idx * 150 },
        data: {
          label: (
            <div className="p-3 text-center select-none">
              <div className="text-xs uppercase font-extrabold text-cyan-400">Shared Header Pool</div>
              <div className="font-black text-sm text-white mt-0.5">{pool.label}</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                Total Supply: {pool.value?.toLocaleString()} Nm³/hr
              </div>
            </div>
          ),
          raw: pool,
        },
        style: {
          background: '#0F172A',
          border: '2px solid #06B6D4',
          borderRadius: '14px',
          width: 220,
          color: '#FFF',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.25)',
        },
      });
    });

    // 3. Consumer Nodes
    consumers.forEach((con, idx) => {
      nodes.push({
        id: con.id,
        type: 'default',
        position: { x: colConX, y: 30 + idx * 65 },
        data: {
          label: (
            <div className="p-2 text-left select-none">
              <div className="text-[10px] uppercase font-bold text-purple-400">
                {con.consumer_type || 'Consumer'}
              </div>
              <div className="font-bold text-xs text-white leading-tight">{con.label}</div>
              <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                {con.value ? `${con.value.toLocaleString()} Nm³/hr` : 'Data Unavailable'}
              </div>
            </div>
          ),
          raw: con,
        },
        style: {
          background: '#131C31',
          border: con.value ? '1px solid #8B5CF6' : '1px solid #F59E0B',
          borderRadius: '10px',
          width: 190,
          color: '#FFF',
        },
      });
    });

    // Edges
    network.edges.forEach((e) => {
      edges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#3B82F6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3B82F6',
        },
      });
    });

    return { flowNodes: nodes, flowEdges: edges };
  }, [network]);

  const onNodeClick = (_: any, node: Node) => {
    if (node.data && node.data.raw) {
      setSelectedNode(node.data.raw);
    }
  };

  return (
    <Layout
      title="Gas Network Topology"
      subtitle="Interactive Shared Gas Pool Network Model (Generators → Header Pool → Consumers)"
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Gas Selection Bar */}
      <div className="flex items-center justify-between bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Select Gas Network:</span>
        </div>
        <div className="flex items-center gap-2">
          {['BFG', 'COG', 'LDG'].map((gasId) => (
            <button
              key={gasId}
              onClick={() => {
                setSelectedGas(gasId);
                setSelectedNode(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGas === gasId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {gasId} Network Topology
            </button>
          ))}
        </div>
      </div>

      {/* Main Flow Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodeClick={onNodeClick}
              fitView
            >
              <Background color="#1E293B" gap={16} size={1} />
              <Controls className="bg-slate-800 text-white border-slate-700" />
              <MiniMap
                nodeColor={(node) => {
                  if (node.id.startsWith('pool')) return '#06B6D4';
                  if (node.id.includes('GEN')) return '#3B82F6';
                  return '#8B5CF6';
                }}
                className="bg-slate-900 border border-slate-800"
              />
            </ReactFlow>
          )}
        </div>

        {/* Node Inspector Panel */}
        <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 h-[600px] flex flex-col">
          <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Node Inspector Panel
          </h3>

          {selectedNode ? (
            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Node ID</span>
                <p className="font-mono text-sm text-blue-400 font-bold">{selectedNode.id}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Node Label</span>
                <p className="text-base font-bold text-white">{selectedNode.label}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Node Type</span>
                <p className="capitalize font-semibold text-cyan-400">{selectedNode.type}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Gas Volume / Flow</span>
                <p className="font-mono text-base font-bold text-white">
                  {selectedNode.value ? `${selectedNode.value.toLocaleString()} Nm³/hr` : 'Data Unavailable'}
                </p>
              </div>

              {selectedNode.consumer_type && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Consumer Category</span>
                  <p className="font-semibold text-purple-400">{selectedNode.consumer_type}</p>
                </div>
              )}

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Metadata</span>
                  <pre className="mt-1 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedNode.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Layers className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Click any Node in the React Flow network to inspect properties</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
