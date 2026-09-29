import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface VictimThreatReportProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const VictimThreatReport: React.FC<VictimThreatReportProps> = ({ onBack, onSuccess }) => {
  const { victim, user } = useAuth();
  const victimId = victim?.id || user?.id || '70000000-0000-0000-0000-000000000001';

  const [threatType, setThreatType] = useState('Witness Coercion / Verbal Threat');
  const [severity, setSeverity] = useState('4');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the threat or intimidation incident.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.reportThreat({
        victim_id: victimId,
        threat_type: threatType,
        severity: parseInt(severity, 10),
        description: description.trim()
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit threat report. Please call emergency helpline 112.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-xl space-y-5 animate-fade-in transition-colors">
        <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/70 rounded-2xl">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">High-Priority Alert Dispatched</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Protection coordinators and local station officers notified</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 space-y-2">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Incident Classification:</span>
            <span className="font-bold text-slate-900 dark:text-white">{threatType}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Recorded Severity:</span>
            <span className="font-bold text-red-600 dark:text-red-400">Level {severity} / 5</span>
          </div>
          <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Your assigned Protection Officer (Smt. K. Ratna Kumari) and Suryaraopet Police Station have received the incident dispatch.
          </div>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-800 dark:text-red-300">
          <strong>Immediate Danger?</strong> If you are under active physical threat right now, call <strong className="font-mono text-sm underline">112</strong> immediately.
        </div>

        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer"
        >
          Return to My Wellbeing
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Report Threat or Intimidation Event</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Confidential alert sent to your Protection Officer and Police Liaison</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Threat or Harassment Type</label>
          <select
            value={threatType}
            onChange={(e) => setThreatType(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="Witness Coercion / Verbal Threat">Witness Coercion / Verbal Threat</option>
            <option value="Physical Harassment / Stalking">Physical Harassment / Stalking</option>
            <option value="Property Damage Threat">Property Damage Threat</option>
            <option value="Social Pressure to Withdraw Case">Social Pressure to Withdraw Case</option>
            <option value="Online / Phone Harassment">Online / Phone Harassment</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Perceived Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="5">Level 5 — Critical / Immediate Physical Risk</option>
            <option value="4">Level 4 — Severe Harassment or Direct Intimidation</option>
            <option value="3">Level 3 — Moderate Pressure or Verbal Warnings</option>
            <option value="2">Level 2 — Indirect Pressure / Stigmatizing Behaviour</option>
            <option value="1">Level 1 — Low Concern / Precautionary Note</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Incident Description *</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail who approached you, where it took place, what was said or done, and if any vehicles or weapons were seen..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Dispatching Alert...</span>
            ) : (
              <span>Submit Immediate Threat Report</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
