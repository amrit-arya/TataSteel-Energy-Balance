import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  status?: 'normal' | 'warning' | 'critical' | 'info';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  status = 'normal',
  className = '',
}) => {
  const statusStyles = {
    normal: {
      border: 'border-slate-800/80',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accent: 'from-blue-500/5 to-transparent',
    },
    warning: {
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      accent: 'from-amber-500/5 to-transparent',
    },
    critical: {
      border: 'border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      accent: 'from-red-500/10 to-transparent',
    },
    info: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      accent: 'from-emerald-500/5 to-transparent',
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#131C31]/90 backdrop-blur-md border ${style.border} p-5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/40 ${className}`}
    >
      {/* Background Accent Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.accent} pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-slate-400">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon Badge */}
        <div
          className={`p-3 rounded-xl border ${style.iconBg} flex items-center justify-center shadow-inner`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span
            className={`font-semibold ${
              trend.isNeutral
                ? 'text-slate-400'
                : trend.isPositive
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-[11px] text-slate-500">vs baseline</span>
        </div>
      )}
    </div>
  );
};
