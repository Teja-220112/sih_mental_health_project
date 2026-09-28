import React from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface PeakStressCardProps {
  peakWindow?: string;
  peakLevel?: 'HIGH' | 'MODERATE' | 'CRITICAL';
  hourlyData?: Array<{ hour: string; stress: number }>;
}

export const PeakStressCard: React.FC<PeakStressCardProps> = ({
  peakWindow = '8:00 PM — 11:00 PM',
  peakLevel = 'HIGH',
  hourlyData = [
    { hour: '6 AM', stress: 25 },
    { hour: '9 AM', stress: 40 },
    { hour: '12 PM', stress: 35 },
    { hour: '3 PM', stress: 45 },
    { hour: '6 PM', stress: 60 },
    { hour: '9 PM', stress: 82 },
    { hour: '12 AM', stress: 55 },
    { hour: '3 AM', stress: 30 },
  ]
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Personalized Peak Stress Hours</h3>
            <p className="text-[11px] text-slate-400">Diurnal stress pattern derived from check-in timestamps</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40">
          Peak Window Identified
        </span>
      </div>

      {/* Primary Peak Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex items-center space-x-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Peak Stress Window</div>
            <div className="text-base font-extrabold text-white mt-0.5">{peakWindow}</div>
            <div className="text-[10px] text-red-400 font-medium">Nighttime Anxiety Elevation</div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex items-center space-x-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Recommended Care Activity</div>
            <div className="text-xs font-bold text-teal-300 mt-0.5">Guided 5-Min Breathing at 7:30 PM</div>
            <div className="text-[10px] text-slate-400">Proactive relaxation before peak window</div>
          </div>
        </div>
      </div>

      {/* 24h Stress Time Spectrum Spectrum Bar */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-amber-400" /> Morning</span>
          <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Afternoon</span>
          <span className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-orange-400" /> Evening</span>
          <span className="flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-400" /> Night (Peak)</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {hourlyData.map((item, idx) => {
            const isPeak = item.stress >= 70;
            const isMod = item.stress >= 45 && item.stress < 70;
            const barColor = isPeak ? 'bg-red-500' : isMod ? 'bg-amber-500' : 'bg-teal-500';

            return (
              <div key={idx} className="flex flex-col items-center space-y-1">
                <div className="w-full bg-slate-800 rounded-lg h-16 flex items-end p-1 relative group">
                  <div
                    className={`w-full ${barColor} rounded-md transition-all duration-500 group-hover:brightness-125`}
                    style={{ height: `${item.stress}%` }}
                  />
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-950 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                    {item.hour}: {item.stress}/100 Stress
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
        <Heart className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>Your counsellor is notified of your peak hours to avoid scheduling calls during high-anxiety periods.</span>
      </div>

    </div>
  );
};
