import React from 'react';
import { Brain, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AIExplanationProps {
  explanation: {
    top_factors: Array<{ factor: string; impact: string }>;
    components?: Record<string, number>;
    disclaimer?: string;
  };
}

export const AIExplanationCard: React.FC<AIExplanationProps> = ({ explanation }) => {
  const getIcon = (impact: string) => {
    if (impact === 'critical' || impact === 'high') {
      return <ArrowUpRight className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
    }
    if (impact === 'positive') {
      return <ArrowDownRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
    }
    return <Minus className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-lg border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide text-white">AI-Assisted Assessment Explanation</h3>
            <p className="text-[11px] text-slate-400">Explainable factors contributing to current score</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-slate-800 text-teal-400 px-2 py-0.5 rounded">
          Screening Signal
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {explanation.top_factors && explanation.top_factors.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            {getIcon(item.impact)}
            <span className="text-slate-200 font-medium leading-relaxed">{item.factor}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>{explanation.disclaimer || 'Screening signal — requires human professional verification.'}</span>
      </div>
    </div>
  );
};
