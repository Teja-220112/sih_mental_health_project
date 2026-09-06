import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      border: 'border-emerald-300',
      text: 'text-emerald-700',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'LOW RISK'
    },
    MODERATE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      border: 'border-amber-300',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      label: 'MODERATE'
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200',
      border: 'border-orange-300',
      text: 'text-orange-700',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-orange-600" />,
      label: 'HIGH RISK'
    },
    CRITICAL: {
      bg: 'bg-red-50 text-red-800 border-red-200 animate-pulse',
      border: 'border-red-400',
      text: 'text-red-700 font-bold',
      icon: <Flame className="w-3.5 h-3.5 text-red-600" />,
      label: 'CRITICAL'
    }
  };

  const config = configs[level] || configs.LOW;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
