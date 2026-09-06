import React from 'react';
import { RiskLevel } from '../../types';

interface DistressGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  size?: number;
}

export const DistressGauge: React.FC<DistressGaugeProps> = ({ score, riskLevel, size = 120 }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorMap: Record<RiskLevel, string> = {
    LOW: '#16A34A',
    MODERATE: '#D97706',
    HIGH: '#EA580C',
    CRITICAL: '#DC2626'
  };

  const strokeColor = colorMap[riskLevel] || '#2563EB';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold text-slate-900 leading-none">{Math.round(normalizedScore)}</span>
        <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">/ 100</span>
      </div>
    </div>
  );
};
