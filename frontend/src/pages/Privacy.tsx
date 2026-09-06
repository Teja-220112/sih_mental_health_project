import React from 'react';
import { Lock, Shield, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-700 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Privacy & Data Governance Policy</h2>
            <p className="text-xs text-slate-500">Privacy-by-design standards for atrocity victims under MoSJE guidelines</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>1. De-identification & Victim Code Masking</span>
            </h3>
            <p>
              To protect victim confidentiality, full personal names are masked with encrypted Victim Codes (e.g. <code>VIC-2026-101</code>) across all operational dashboards, NLP models, and analytical pipelines.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>2. Purpose & Limitations of AI Screening</span>
            </h3>
            <p>
              AI-generated scores are screening signals to prioritize human counsellor review. The AI does NOT make clinical diagnoses, prescribe treatment, or render legal judgments.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>3. Row-Level Security (RLS) & Access Control</span>
            </h3>
            <p>
              Strict Supabase Row Level Security (RLS) policies ensure victims access only their own check-ins, counsellors access only assigned victims, and district officers access aggregated district data.
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};
