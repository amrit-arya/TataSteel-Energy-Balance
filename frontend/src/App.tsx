import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OverviewPage } from './pages/Overview';
import { GenerationPage } from './pages/Generation';
import { ConsumptionPage } from './pages/Consumption';
import { GasBalancePage } from './pages/GasBalance';
import { UtilizationPage } from './pages/Utilization';
import { NetworkPage } from './pages/Network';
import { SimulationPage } from './pages/Simulation';
import { ScenariosPage } from './pages/Scenarios';
import { AlertsPage } from './pages/Alerts';
import { SettingsPage } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/generation" element={<GenerationPage />} />
          <Route path="/consumption" element={<ConsumptionPage />} />
          <Route path="/balance" element={<GasBalancePage />} />
          <Route path="/utilization" element={<UtilizationPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
