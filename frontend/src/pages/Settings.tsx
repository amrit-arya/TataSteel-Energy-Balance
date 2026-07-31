import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Settings as SettingsIcon, Database, ShieldCheck, Layers, Cpu, Server } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <Layout
      title="System Configuration & Settings"
      subtitle="Operational Decision-Support System Architecture & Integration Settings"
    >
      <div className="space-y-6 max-w-4xl">
        {/* System Info Panel */}
        <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            Industrial Architecture & Deployment
          </h3>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Plant Location</span>
              <p className="text-sm font-bold text-white mt-0.5">Tata Steel — Jamshedpur Works</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase text-[10px]">System Model</span>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">Shared Gas Header Pool Architecture</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Measurement Unit</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">Nm³/hr (Normal Cubic Meters / Hour)</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Database Engine</span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">SQLite (PostgreSQL Migration Ready)</p>
            </div>
          </div>
        </div>

        {/* Data Integrity Governance */}
        <div className="bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Data Integrity & Data Fabrication Protection Rules
          </h3>

          <ul className="mt-4 space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/60">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>LD Gas Consumption Data Integrity:</strong> LD Gas has no consumer records in the Excel workbook. The system displays <em>Data Unavailable</em> rather than zero.</span>
            </li>

            <li className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/60">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>No Generator-to-Consumer Fabrication:</strong> The Excel workbook does not define direct connectivity. The system strictly models distribution via a shared gas pool.</span>
            </li>

            <li className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/60">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Original Plant Name Preservation:</strong> Names like <em>HSM Mill</em> vs <em>HSM</em> or <em>TSCR</em> vs <em>TsCR</em> are preserved as distinct units as provided in source workbook.</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};
