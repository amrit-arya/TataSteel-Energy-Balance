import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { BellRing, AlertTriangle, Info, CheckCircle2, ShieldAlert, Filter } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const { data: alerts, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(true),
  });

  if (isLoading || !alerts) {
    return (
      <Layout title="Operational Alerts & Risk Center" subtitle="Monitoring Critical Deficits & Data Integrity Alerts">
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const filteredAlerts = severityFilter === 'ALL'
    ? alerts
    : alerts.filter((a) => a.severity === severityFilter.toLowerCase());

  return (
    <Layout
      title="Operational Alerts & Risk Center"
      subtitle="Real-time System Risk Notifications & Data Integrity Monitoring"
      criticalAlertsCount={alerts.filter((a) => a.severity === 'critical' && !a.is_resolved).length}
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-[#131C31]/90 backdrop-blur-md border border-slate-800/80 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Filter Severity:</span>
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-red-500/10 border-red-500/30'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                            isCritical
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        {alert.gas_type_id && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {alert.gas_type_id}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1.5">{alert.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {alert.is_resolved ? 'Resolved' : 'Active Alert'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#131C31]/90 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
            No alerts match the selected filter.
          </div>
        )}
      </div>
    </Layout>
  );
};
