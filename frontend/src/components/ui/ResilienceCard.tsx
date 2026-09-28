import React from 'react';
import { ShieldCheck, Flame, Award, Heart, PhoneCall, Sparkles } from 'lucide-react';

interface ResilienceCardProps {
  resilienceScore?: number; // 0-100
  streakDays?: number;
  milestones?: string[];
  onCallHelpline?: () => void;
}

export const ResilienceCard: React.FC<ResilienceCardProps> = ({
  resilienceScore = 78,
  streakDays = 5,
  milestones = [
    'Completed 5 periodic check-ins',
    '3 guided relaxation exercises done',
    'Stable distress trend for 7 consecutive days'
  ],
  onCallHelpline
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative Subtle Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Coping Resilience & Care Streak</h3>
              <p className="text-[11px] text-slate-500">Positive emotional stability & protective recovery index</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200 font-extrabold text-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakDays}-Day Streak</span>
          </div>
        </div>

        {/* Resilience Score Section */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resilience Score</span>
            <div className="text-3xl font-extrabold text-teal-700 mt-1">
              {resilienceScore}<span className="text-xs font-medium text-slate-400">/100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${resilienceScore}%` }} />
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> High Resilience
            </span>
          </div>

          {/* Milestones Achieved */}
          <div className="sm:col-span-2 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Wellness Milestones</span>
            </div>
            <div className="space-y-1.5">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <Heart className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-medium text-[11px]">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Quick Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-[11px] text-slate-500 font-medium">
          Need immediate support? National emergency line is active 24/7.
        </div>
        <button
          onClick={onCallHelpline || (() => window.open('tel:112'))}
          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition-all flex items-center space-x-1.5 shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112 Hotline</span>
        </button>
      </div>

    </div>
  );
};
