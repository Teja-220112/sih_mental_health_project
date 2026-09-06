import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface TrendBadgeProps {
  trend: 'Improving' | 'Stable' | 'Increasing' | 'Rapidly Increasing';
  change?: number;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ trend, change }) => {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Improving: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'Improving',
      icon: <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
    },
    Stable: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      text: 'Stable',
      icon: <Minus className="w-3.5 h-3.5 text-slate-500" />
    },
    Increasing: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      text: 'Increasing',
      icon: <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
    },
    'Rapidly Increasing': {
      bg: 'bg-red-50 text-red-700 border-red-300 font-bold',
      text: 'Rapidly Escalating',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
    }
  };

  const config = configs[trend] || configs.Stable;

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border text-xs font-medium ${config.bg}`}>
      {config.icon}
      <span>{config.text}</span>
      {change !== undefined && change !== 0 && (
        <span className="text-[10px] ml-0.5 opacity-80">
          ({change > 0 ? `+${change}` : change})
        </span>
      )}
    </span>
  );
};
