import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Building2, ShieldAlert, FileCheck, Users, Activity, CheckCircle2, Clock } from 'lucide-react';

export const DistrictDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDistrictDashboard();
        setData(res);
      } catch (e) {
        console.warn("API failed, using fallback:", e);
        setData({
          district_info: { name: 'Pune', state: 'Maharashtra', district_code: 'MH-PUNE-01' },
          metrics: {
            total_active_cases: 32,
            monitored_victims: 30,
            high_risk_victims: 4,
            active_threat_reports: 2,
            protection_requests_pending: 1,
            rehabilitation_pending: 2,
            compensation_pending: 1
          }
        });
      }
    }
    loadData();
  }, []);

  const m = data?.metrics || { total_active_cases: 32, monitored_victims: 30, high_risk_victims: 4 };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>District Administrative Portal</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Pune District Protection & Welfare Coordination</h2>
          <p className="text-xs text-slate-500">Officer Rajesh Verma — District Magistrate / Protection Coordination Office</p>
        </div>

        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
          MH-PUNE-01 • Maharashtra
        </span>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Atrocity Cases</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{m.total_active_cases}</div>
          <div className="text-[10px] text-slate-400">SC/ST Act Monitoring</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Monitored Victims</div>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">{m.monitored_victims}</div>
          <div className="text-[10px] text-slate-400">Periodic check-in active</div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
          <div className="text-[11px] font-semibold text-red-800 uppercase">High Risk Alerts</div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{m.high_risk_victims}</div>
          <div className="text-[10px] text-red-600">Requires urgent review</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-[11px] font-semibold text-amber-800 uppercase">Threat Reports</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{m.active_threat_reports}</div>
          <div className="text-[10px] text-amber-600">Protection reviews pending</div>
        </div>
      </div>

      {/* Welfare & Protection Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Protection Reviews */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Pending Protection & Relocation Reviews</span>
            </h3>
            <span className="text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
              High Priority
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>VIC-2026-101 (Sunita Devi)</span>
                <span className="text-red-600">CRITICAL</span>
              </div>
              <p className="text-slate-600">Witness intimidation reported near Haveli Village. Police protection escort requested for upcoming trial.</p>
              <div className="pt-2 flex justify-end space-x-2">
                <button className="px-3 py-1 bg-teal-600 text-white rounded font-semibold text-[11px]">
                  Approve Police Escort
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Welfare & Rehabilitation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Welfare & Rehabilitation Status</span>
            </h3>
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
              MoSJE Schemes
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Compensation First Installment Disbursed', count: '₹1,00,000 (Disbursed)', status: 'COMPLETED' },
              { label: 'Legal Aid Advocate Assignment', count: 'Adv. M. K. Kulkarni Assigned', status: 'ACTIVE' },
              { label: 'Temporary Relocation Allowance', count: 'Sanction Pending Review', status: 'PENDING' },
            ].map((w, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{w.label}</div>
                  <div className="text-[11px] text-slate-500">{w.count}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
