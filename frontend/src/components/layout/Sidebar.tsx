import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  Flame,
  Scale,
  Gauge,
  Network,
  Cpu,
  Bookmark,
  BellRing,
  Settings,
  Activity,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  criticalAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ criticalAlertsCount = 0 }) => {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Gas Generation', path: '/generation', icon: Factory },
    { name: 'Gas Consumption', path: '/consumption', icon: Flame },
    { name: 'Gas Balance', path: '/balance', icon: Scale },
    { name: 'Gas Utilization', path: '/utilization', icon: Gauge },
    { name: 'Gas Network', path: '/network', icon: Network },
    { name: 'Impact Simulation', path: '/simulation', icon: Cpu },
    { name: 'Scenarios', path: '/scenarios', icon: Bookmark },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: BellRing,
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
    },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-wider leading-tight flex items-center gap-1.5">
            TATA STEEL
          </h1>
          <p className="text-[11px] text-blue-400 font-semibold tracking-wider uppercase">
            Fuel Gas Intelligence
          </p>
        </div>
      </div>

      {/* System Status Summary Pill */}
      <div className="px-4 py-3 mx-4 my-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-slate-300 font-medium">Jamshedpur Works</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
          LIVE
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-current" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-500">
        <div className="flex items-center justify-between text-[11px]">
          <span>System Version</span>
          <span className="font-mono text-slate-400">v1.0.0</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">
          Operational Decision Support
        </div>
      </div>
    </aside>
  );
};
