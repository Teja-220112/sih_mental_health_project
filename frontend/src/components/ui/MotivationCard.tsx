import React, { useState } from 'react';
import { Sparkles, RefreshCw, Quote, Heart, Sun } from 'lucide-react';

interface MotivationCardProps {
  onStartPractice?: () => void;
}

const AFFIRMATIONS = [
  {
    quote: "You have survived every difficult day so far. Your courage and strength are your greatest shield.",
    author: "Mental Health Guidance",
    tip: "Take 3 deep, slow breaths whenever you feel overwhelmed today."
  },
  {
    quote: "Seeking support is not a sign of weakness; it is a profound act of self-protection and dignity.",
    author: "MoSJE Wellbeing Care",
    tip: "Remember that your assigned counsellor and legal protection team are standing with you."
  },
  {
    quote: "Healing is not linear, but every small step forward builds lasting emotional resilience.",
    author: "Recovery Thought",
    tip: "Write down or speak one thing that made you feel safe or grounded today."
  },
  {
    quote: "Peace begins when you focus on your safety, your breath, and the present moment.",
    author: "Mindfulness Reflection",
    tip: "Try the 5-4-3-2-1 grounding exercise: notice 5 things around you right now."
  }
];

export const MotivationCard: React.FC<MotivationCardProps> = ({ onStartPractice }) => {
  const [index, setIndex] = useState(0);

  const current = AFFIRMATIONS[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  return (
    <div className="bg-gradient-to-br from-teal-900 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800/40 relative overflow-hidden flex flex-col justify-between">
      
      {/* Subtle Ambient Glow */}
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-teal-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Sun className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Daily Motivation & Resilience</h3>
              <p className="text-[11px] text-teal-200/80">Supportive affirmation for your recovery journey</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            title="Next Affirmation"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-teal-300 rounded-xl border border-slate-700 transition-all flex items-center space-x-1 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Quote Content */}
        <div className="mt-4 relative bg-slate-800/40 p-4 rounded-xl border border-teal-500/20">
          <Quote className="w-6 h-6 text-teal-400/40 absolute top-2 right-2" />
          <p className="text-xs sm:text-sm italic font-medium leading-relaxed text-slate-100">
            "{current.quote}"
          </p>
          <div className="mt-2 text-[10px] text-teal-300 font-semibold uppercase tracking-wider text-right">
            — {current.author}
          </div>
        </div>
      </div>

      {/* Daily Mindfulness Tip */}
      <div className="mt-4 pt-3 border-t border-teal-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-teal-100 text-[11px]">
          <Heart className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span><strong>Daily Care Tip:</strong> {current.tip}</span>
        </div>

        {onStartPractice && (
          <button
            onClick={onStartPractice}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] rounded-lg shadow transition-all shrink-0 flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-Min Mindfulness</span>
          </button>
        )}
      </div>

    </div>
  );
};
