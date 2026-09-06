import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-inner">
      <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="font-medium">
          <span className="font-semibold uppercase tracking-wider text-amber-900 mr-1">Hackathon Prototype Notice:</span>
          AI-generated scores are screening and prioritization signals, not medical diagnoses. High-risk cases require review by an authorized human professional.
        </p>
      </div>
    </div>
  );
};
