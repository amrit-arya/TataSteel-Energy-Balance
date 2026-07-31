import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  criticalAlertsCount?: number;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  criticalAlertsCount = 0,
  onRefresh,
  isFetching,
}) => {
  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar criticalAlertsCount={criticalAlertsCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          isFetching={isFetching}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
