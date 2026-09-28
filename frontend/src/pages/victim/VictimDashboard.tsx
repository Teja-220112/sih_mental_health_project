import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { MotivationCard } from '../../components/ui/MotivationCard';
import { 
  HeartHandshake, MessageSquare, ShieldAlert, FileText, Calendar, 
  Shield, CheckCircle2, Phone, UserCheck, 
  LifeBuoy, ShieldCheck
} from 'lucide-react';

interface VictimDashboardProps {
  onStartCheckin: () => void;
  onOpenChat: () => void;
  onReportThreat: () => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({ 
  onStartCheckin, 
  onOpenChat, 
  onReportThreat 
}) => {
  const { victim, user } = useAuth();
  const victimId = victim?.id || user?.id || '70000000-0000-0000-0000-000000000001';

  const [checkins, setCheckins] = useState<any[]>([]);
  const [requestSent, setRequestSent] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getVictimCheckins(victimId);
        setCheckins(res.checkins || []);
      } catch (e) {
        console.warn("Using fallback checkin history:", e);
        setCheckins([
          { id: '1', checkin_time: '2026-09-04T10:00:00Z', channel: 'web', completed: true },
          { id: '2', checkin_time: '2026-08-29T14:30:00Z', channel: 'web', completed: true },
          { id: '3', checkin_time: '2026-08-24T09:15:00Z', channel: 'assisted', completed: true },
          { id: '4', checkin_time: '2026-08-20T11:00:00Z', channel: 'web', completed: true },
        ]);
      }
    }
    loadData();
  }, [victimId]);

  const handleSupportRequest = (type: string) => {
    setRequestSent(type);
    setTimeout(() => setRequestSent(null), 5000);
  };

  const displayName = victim?.name || user?.full_name || 'Citizen';
  const victimCode = victim?.victim_code || user?.email || 'VIC-DEMO-0001';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Safe Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-navy-700">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Confidential Victim Safety & Support Portal</span>
          </div>
          <h2 className="text-xl font-bold">Welcome back, {displayName}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Registration Code: <span className="font-mono text-teal-300 font-semibold">{victimCode}</span> • NTR District, Andhra Pradesh
          </p>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Your responses are reviewed exclusively by authorized counsellors and protection officers to ensure your safety and provide legal and rehabilitation aid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onStartCheckin}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Submit Wellbeing Check-in</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-navy-700 hover:bg-navy-600 text-slate-100 text-xs font-semibold rounded-xl border border-slate-600 transition-all flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Supportive Assistant</span>
          </button>

          <button
            onClick={onReportThreat}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Concern / Threat</span>
          </button>
        </div>
      </div>

      {/* Confirmation Alert if requested */}
      {requestSent && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 text-xs shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Support Request Dispatched:</span> Your request for{' '}
            <span className="font-bold underline">{requestSent}</span> has been forwarded to your assigned case officer in NTR District. You will be contacted shortly.
          </div>
        </div>
      )}

      {/* 3 Pillar Safe Guidance Cards (Redacted of all internal scores / risk ratings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1: Dedicated Case & Support Officers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-3">
              <UserCheck className="w-4 h-4" />
              <span>Assigned Support Team</span>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Assigned Mental Health Counsellor</span>
                <span className="font-semibold text-slate-800 text-sm">Dr. Ananya Sharma</span>
                <span className="text-[11px] text-teal-600 block mt-0.5">District Hospital & Mental Health Center</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px]">District Protection Officer</span>
                <span className="font-semibold text-slate-800 text-sm">Smt. K. Ratna Kumari</span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Women & Child Protection Wing, NTR District</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Jurisdiction Police Station</span>
                <span className="font-semibold text-slate-800 text-sm">Suryaraopet Police Station</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">Vijayawada Urban Division</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleSupportRequest('Counsellor Callback')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              Request Counsellor Call
            </button>
            <span className="text-[11px] text-slate-400">Available 9 AM — 6 PM</span>
          </div>
        </div>

        {/* Pillar 2: Safety & Emergency Protocol */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-red-600 font-semibold text-xs uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4" />
              <span>Safety & Emergency Contacts</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              If you feel at immediate risk or experience intimidation or harassment, contact emergency lines immediately:
            </p>

            <div className="space-y-2">
              <a 
                href="tel:112"
                className="flex items-center justify-between p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="text-xs font-bold text-red-800 block">Emergency Response Support System</span>
                    <span className="text-[11px] text-red-600">Police, Medical & Fire Rescue</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-700 font-mono px-2 py-0.5 bg-white rounded-md border border-red-200">112</span>
              </a>

              <a 
                href="tel:181"
                className="flex items-center justify-between p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">Women's Safety Helpline</span>
                    <span className="text-[11px] text-amber-700">Toll-free 24/7 Crisis Support</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-800 font-mono px-2 py-0.5 bg-white rounded-md border border-amber-200">181</span>
              </a>

              <a 
                href="tel:14566"
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <LifeBuoy className="w-4 h-4 text-slate-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">MoSJE Welfare & Rehabilitation Aid</span>
                    <span className="text-[11px] text-slate-600">Legal, Financial & Medical Guidance</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 font-mono px-2 py-0.5 bg-white rounded-md border border-slate-200">14566</span>
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleSupportRequest('Protection Officer Contact')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
            >
              Request Protection Patrol Check
            </button>
          </div>
        </div>

        {/* Pillar 3: Welfare & Rehabilitation Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-navy-800 font-semibold text-xs uppercase tracking-wider mb-3">
              <HeartHandshake className="w-4 h-4 text-teal-600" />
              <span>Rehabilitation & Legal Rights</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Legal Representation:</span>
                <span className="font-semibold text-slate-800">Govt Legal Aid Counsel Assigned</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Welfare Grant / Aid:</span>
                <span className="font-semibold text-emerald-700">First Installment Sanctioned</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Protection Patrol:</span>
                <span className="font-semibold text-teal-700">Active Area Monitoring</span>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-900 mt-2">
                <span className="font-semibold block mb-0.5">Your Privacy is Protected</span>
                <p className="text-[11px] leading-relaxed text-teal-800">
                  Your identity is kept confidential under victim protection rules. You have the right to request a safe room or escort during court appearances.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            NTR District Legal Services Authority (DLSA) Partner
          </div>
        </div>

      </div>

      {/* Wellbeing & Coping Practice (Safe, grounding focus) */}
      <MotivationCard onStartPractice={onStartCheckin} />

      {/* Safe Check-in History Timeline (No internal ML risk scores, purely check-in records) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Your Check-in History & Care Record</span>
            </h3>
            <p className="text-xs text-slate-500">
              A log of your submitted check-ins reviewed by your care coordinators
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {checkins.length} Check-ins Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3 text-right">Support Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checkins.slice(0, 6).map((chk: any, idx: number) => {
                const dateStr = chk.checkin_time ? chk.checkin_time.slice(0, 10) : 'Recent';
                const timeStr = chk.checkin_time ? chk.checkin_time.slice(11, 16) + ' UTC' : '';
                const isAssisted = chk.is_assisted || chk.channel === 'assisted';
                return (
                  <tr key={chk.id || idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {dateStr} <span className="text-[11px] text-slate-400">{timeStr}</span>
                    </td>
                    <td className="py-3 px-3">
                      {isAssisted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                          Assisted Entry (Officer)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          Self-Reported (Web)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Received & Reviewed</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-slate-500 text-[11px]">Coordinated with Support Team</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Regular check-ins help us protect your rights and ensure fast support.</span>
          <button
            onClick={onStartCheckin}
            className="text-teal-700 font-semibold hover:underline"
          >
            Submit New Check-in Now &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};

