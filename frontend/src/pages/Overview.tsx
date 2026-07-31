import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Layout } from '../components/layout/Layout';
import { KPICard } from '../components/cards/KPICard';
import { GasSummaryCard } from '../components/cards/GasSummaryCard';
import { GasBalanceChart } from '../components/charts/GasBalanceChart';
import { WaterfallChart } from '../components/charts/WaterfallChart';
import { UtilizationGauge } from '../components/charts/UtilizationGauge';
import {
  Factory,
  Flame,
  Scale,
  Gauge,
  Layers,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Activity,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { data: overview, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['overview'],
    queryFn: api.getOverview,
    refetchInterval: 10000,
  });

  const { data: consumption } = useQuery({
    queryKey: ['consumption'],
    queryFn: api.getConsumption,
  });

  if (isLoading || !overview) {
    return (
      <Layout title="Operational Overview" subtitle="System Overview & KPI Dashboard" isFetching={isFetching}>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">Loading Tata Steel Fuel Intelligence...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const bfGas = overview.gas_balances.find((g) => g.gas_id === 'BFG');
  const coGas = overview.gas_balances.find((g) => g.gas_id === 'COG');
  const ldGas = overview.gas_balances.find((g) => g.gas_id === 'LDG');

  return (
    <Layout
      title="Operational Overview"
      subtitle="Real-time By-Product Gas Intelligence & Decision Support"
      criticalAlertsCount={overview.critical_alerts}
      onRefresh={refetch}
      isFetching={isFetching}
    >
      {/* Overview 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Gas Generation"
          value={overview.total_generation}
          unit="Nm³/hr"
          subtitle="Across BFG, COG, and LDG"
          icon={Factory}
          status="normal"
        />
        <KPICard
          title="Total Gas Consumption"
          value={overview.total_consumption ? overview.total_consumption : 'Data Unavailable'}
          unit={overview.total_consumption ? 'Nm³/hr' : undefined}
          subtitle="BFG & COG Total Demand"
          icon={Flame}
          status="normal"
        />
        <KPICard
          title="Net Network Balance"
          value={overview.net_balance ? `+${overview.net_balance.toLocaleString()}` : 'Data Unavailable'}
          unit={overview.net_balance ? 'Nm³/hr' : undefined}
          subtitle="CO Gas Surplus (+7.4k) - BFG Deficit (-14.8k)"
          icon={Scale}
          status={overview.net_balance && overview.net_balance < 0 ? 'critical' : 'info'}
        />
        <KPICard
          title="Overall Utilization"
          value={overview.overall_utilization ? `${overview.overall_utilization}%` : 'N/A'}
          subtitle="Weighted Average (BFG & COG)"
          icon={Gauge}
          status="normal"
        />
        <KPICard
          title="Total Gas Sources"
          value={overview.total_sources}
          unit="Sources"
          subtitle="6 BF Furnaces, 2 CO Batteries, 2 LD Converters"
          icon={Layers}
          status="normal"
        />
        <KPICard
          title="Total Gas Consumers"
          value={overview.total_consumers}
          unit="Consumers"
          subtitle="15 BFG Consumers + 18 COG Consumers"
          icon={Users}
          status="normal"
        />
        <KPICard
          title="Critical Alerts"
          value={overview.critical_alerts}
          subtitle="BF Gas Deficit & Over-Utilization"
          icon={AlertTriangle}
          status={overview.critical_alerts > 0 ? 'critical' : 'normal'}
        />
        <KPICard
          title="Healthy Systems"
          value={`${overview.healthy_systems} / 3`}
          subtitle="CO Gas Balanced, BFG Deficit, LDG Unmonitored"
          icon={CheckCircle2}
          status="info"
        />
      </div>

      {/* Per-Gas Summary Cards (BFG, COG, LDG) */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-white mb-3 tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          By-Product Gas Summary by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bfGas && <GasSummaryCard gas={bfGas} />}
          {coGas && <GasSummaryCard gas={coGas} />}
          {ldGas && <GasSummaryCard gas={ldGas} />}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GasBalanceChart data={overview.gas_balances} />
        {consumption && <WaterfallChart gasBalances={overview.gas_balances} consumptionData={consumption} />}
      </div>

      {/* Gauges Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UtilizationGauge
          title="Blast Furnace Gas (BFG)"
          value={bfGas?.utilization_percentage || null}
          statusLabel="BF Gas Utilization"
        />
        <UtilizationGauge
          title="Coke Oven Gas (COG)"
          value={coGas?.utilization_percentage || null}
          statusLabel="CO Gas Utilization"
        />
        <UtilizationGauge
          title="Linz-Donawitz Gas (LDG)"
          value={ldGas?.utilization_percentage || null}
          statusLabel="LD Gas Utilization"
        />
      </div>
    </Layout>
  );
};
