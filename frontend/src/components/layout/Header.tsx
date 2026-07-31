import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isFetching = false,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0E1524]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-4">
        {/* Gas Pool Model Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Shared Pool Architecture</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/60 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-400' : ''}`}
            />
          </button>
        )}

        {/* Live System Clock */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Clock className="w-4 h-4 text-blue-400" />
          <div className="flex flex-col items-end">
            <span className="font-mono text-slate-200 font-bold tracking-wider leading-none">
              {time || '00:00:00'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              {date}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
