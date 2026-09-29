import React from 'react';
import { Lock, ShieldCheck, FileText } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const sampleLogs = [
    { timestamp: '2026-09-04 12:05:00', user: 'Dr. Ananya Sharma (Counsellor)', action: 'VIEW_VICTIM_PROFILE', resource: 'victims/v1111111', status: 'SUCCESS' },
    { timestamp: '2026-09-04 12:10:15', user: 'Dr. Ananya Sharma (Counsellor)', action: 'RECORD_INTERVENTION', resource: 'interventions/in1', status: 'SUCCESS' },
    { timestamp: '2026-09-04 14:20:00', user: 'Rajesh Verma (District Officer)', action: 'APPROVE_PROTECTION_ESCORT', resource: 'cases/c1111111', status: 'SUCCESS' },
    { timestamp: '2026-09-04 16:45:10', user: 'Sunita Devi (Victim Demo)', action: 'SUBMIT_CHECKIN', resource: 'checkins/chk-89', status: 'SUCCESS' },
    { timestamp: '2026-09-04 18:00:22', user: 'System (AI Backend Engine)', action: 'GENERATE_DYNAMIC_RISK_SCORE', resource: 'assessments/a08', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 dark:bg-slate-800 text-teal-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Audit Logs & Security RLS Enforcement</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Immutable audit log of role-based data access and intervention events</p>
          </div>
        </div>

        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          Supabase RLS Active
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Access & Audit Trail</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Encrypted Log Storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700/60">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User Persona</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              {sampleLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">{log.user}</td>
                  <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-bold">{log.action}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.resource}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
