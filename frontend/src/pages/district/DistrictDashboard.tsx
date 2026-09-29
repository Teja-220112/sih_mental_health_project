import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Building2, ShieldAlert, FileCheck, Users, Activity, CheckCircle2, 
  Clock, IndianRupee, Scale, Award, ArrowUpRight, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export interface DistrictDashboardProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const DistrictDashboard: React.FC<DistrictDashboardProps> = ({ 
  activeTab = 'dashboard', 
  onNavigate 
}) => {
  const [data, setData] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Welfare records state
  const [welfareList, setWelfareList] = useState([
    { id: 'w-01', victim_code: 'VIC-DEMO-0001', name: 'Sunita Devi', scheme: 'Interim Compensation (Atrocity Relief)', amount: '₹1,00,000', status: 'DISBURSED', action_date: '2026-09-02' },
    { id: 'w-02', victim_code: 'VIC-DEMO-0002', name: 'Ramesh Kumar', scheme: 'Special Court Legal Aid Counsel', amount: 'Sanctioned', status: 'ACTIVE', action_date: '2026-09-04' },
    { id: 'w-03', victim_code: 'VIC-DEMO-0008', name: 'Anuradha V.', scheme: 'Emergency Relocation Maintenance Grant', amount: '₹25,000', status: 'PENDING_APPROVAL', action_date: 'Pending' },
    { id: 'w-04', victim_code: 'VIC-DEMO-0015', name: 'M. Venkatesh', scheme: 'Educational Scholarship Rehabilitation', amount: '₹40,000', status: 'PENDING_APPROVAL', action_date: 'Pending' }
  ]);

  // Protection reviews
  const [protectionReviews, setProtectionReviews] = useState([
    { id: 'pr-01', victim_code: 'VIC-DEMO-0001', name: 'Sunita Devi', risk: 'CRITICAL', incident: 'Witness intimidation reported near Suryaraopet market ahead of trial.', request: '24/7 Armed Police Escort', status: 'PENDING' },
    { id: 'pr-02', victim_code: 'VIC-DEMO-0008', name: 'Anuradha V.', risk: 'HIGH', incident: 'Motorbike riders surveillance outside residence in evening hours.', request: 'Static Station Picket', status: 'PENDING' },
    { id: 'pr-03', victim_code: 'VIC-DEMO-0022', name: 'K. Lakshmi', risk: 'HIGH', incident: 'Aggressive posturing by accused family in Vijayawada court corridors.', request: 'Court Corridor Escort', status: 'APPROVED' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDistrictDashboard();
        setData(res);
      } catch (e) {
        console.warn("API failed, using fallback:", e);
        setData({
          district_info: { name: 'NTR District (Vijayawada)', state: 'Andhra Pradesh', district_code: 'AP-NTR-01' },
          metrics: {
            total_active_cases: 100,
            monitored_victims: 100,
            high_risk_victims: 18,
            active_threat_reports: 5,
            protection_requests_pending: 2,
            rehabilitation_pending: 2,
            compensation_pending: 2
          }
        });
      }
    }
    loadData();
  }, []);

  const handleApproveProtection = (id: string, actionName: string) => {
    setProtectionReviews(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
    setNotice(`Statutory approval issued: ${actionName}`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleDisburseWelfare = (id: string) => {
    setWelfareList(prev => prev.map(w => w.id === id ? { ...w, status: 'DISBURSED', action_date: 'Today' } : w));
    setNotice('Direct Benefit Transfer (DBT) voucher authorized under MoSJE relief fund.');
    setTimeout(() => setNotice(null), 4000);
  };

  const m = data?.metrics || { 
    total_active_cases: 100, 
    monitored_victims: 100, 
    high_risk_victims: 18, 
    active_threat_reports: 5,
    protection_requests_pending: 2,
    rehabilitation_pending: 2
  };

  // Analytics data
  const riskDistData = [
    { name: 'Low (0-29)', count: 46, fill: '#10B981' },
    { name: 'Moderate (30-49)', count: 36, fill: '#F59E0B' },
    { name: 'High (50-74)', count: 13, fill: '#F97316' },
    { name: 'Critical (75-100)', count: 5, fill: '#EF4444' }
  ];

  const caseStageData = [
    { stage: 'Investigation', count: 34 },
    { stage: 'Chargesheet Filed', count: 42 },
    { stage: 'Court Trial', count: 24 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>District Administrative &amp; Magistracy Portal</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">NTR District Protection &amp; Welfare Coordination Cell</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Officer Rajesh Verma — District Magistrate / Protection Coordination Office (Vijayawada)</p>
        </div>

        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          AP-NTR-01 • Andhra Pradesh
        </span>
      </div>

      {notice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* VIEW 1: THREAT & PROTECTION REVIEWS */}
      {activeTab === 'threats' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>District Witness Protection &amp; Relocation Review Bench</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Statutory review of high-threat atrocity cases requiring administrative sanction</p>
          </div>

          <div className="space-y-3">
            {protectionReviews.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">({p.victim_code})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.risk === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {p.risk} RISK
                    </span>
                  </div>

                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p><strong>Incident Notice:</strong> {p.incident}</p>
                  <p className="mt-1 text-teal-800 dark:text-teal-400"><strong>Relief / Protection Requested:</strong> {p.request}</p>
                </div>

                {p.status === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleApproveProtection(p.id, `Order issued for ${p.request}`)}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer text-center"
                    >
                      Issue Statutory Sanction
                    </button>
                    <button
                      onClick={() => handleApproveProtection(p.id, 'Notice under Section 107 CrPC served to Tahsildar')}
                      className="px-3.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer text-center"
                    >
                      Order Tahsildar Notice (Sec 107)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: WELFARE & REHABILITATION */}
      {activeTab === 'welfare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>Statutory Welfare Grants &amp; Rehabilitation Tracker</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monitored under Section 15A of SC/ST (PoA) Act Rules (Interim compensation &amp; DBT)</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full min-w-[650px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Victim / Beneficiary</th>
                  <th className="py-3 px-4">Rehabilitation Scheme</th>
                  <th className="py-3 px-4">Sanction Amount</th>
                  <th className="py-3 px-4">Disbursement Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {welfareList.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">{w.name}</span>
                      <span className="block font-mono text-[10px] text-teal-700 dark:text-teal-400">{w.victim_code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{w.scheme}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{w.amount}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{w.action_date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'DISBURSED' || w.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {w.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => handleDisburseWelfare(w.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Disburse Relief Grant
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Authorized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DISTRICT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Distribution Chart */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Psychological Distress Severity Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Longitudinal stratification of 100 monitored victims</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistData}>
                    <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {riskDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Case Stage Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Legal Case Progression Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Caseload status across NTR District Special Courts</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={caseStageData}>
                    <XAxis dataKey="stage" fontSize={11} stroke="#64748B" />
                    <YAxis fontSize={11} stroke="#64748B" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }} />
                    <Bar dataKey="count" fill="#0D9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Statutory Performance KPI</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Average Emergency Response Time from Alert to Protection Deployment:</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-teal-800 dark:text-teal-400">18.4 Minutes</span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Compliant with Supreme Court 2018 Guidelines</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: DEFAULT DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <>
          {/* KPI Matrix with Border Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-slate-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Cases</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{m.total_active_cases}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">SC/ST Act Monitoring</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-teal-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monitored Victims</div>
              <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">{m.monitored_victims}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Check-in active</div>
            </div>

            <div className="bg-red-50/70 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-800/60 border-t-4 border-t-red-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">High Risk Alerts</div>
              <div className="text-2xl font-extrabold text-red-700 dark:text-red-300 mt-1">{m.high_risk_victims}</div>
              <div className="text-[10px] text-red-600 dark:text-red-500">Requires urgent review</div>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 border-t-4 border-t-amber-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Threat Reports</div>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{m.active_threat_reports}</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-500">Protection reviews pending</div>
            </div>
          </div>

          {/* Welfare & Protection Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Protection Reviews */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Pending Protection &amp; Relocation Reviews</span>
                </h3>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('threats')}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                {protectionReviews.slice(0, 2).map(p => (
                  <div key={p.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{p.victim_code} ({p.name})</span>
                      <span className={p.risk === 'CRITICAL' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>{p.risk}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{p.incident}</p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleApproveProtection(p.id, p.request)}
                        className="px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                      >
                        Approve Sanction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Welfare & Rehabilitation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Welfare &amp; Rehabilitation Tracker</span>
                </h3>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('welfare')}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                {welfareList.slice(0, 3).map((w, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{w.name} — {w.scheme}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{w.amount}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.status === 'DISBURSED' || w.status === 'ACTIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
