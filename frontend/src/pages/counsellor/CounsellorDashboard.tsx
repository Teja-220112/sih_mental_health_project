import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { TrendBadge } from '../../components/ui/TrendBadge';
import { 
  Users, AlertTriangle, ShieldCheck, Flame, Search, ArrowUpRight, 
  CheckCircle2, Clock, Sparkles, UserCheck, Plus, X, Calendar
} from 'lucide-react';

export interface CounsellorDashboardProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onSelectVictim: (victimId: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({ 
  activeTab = 'dashboard', 
  onNavigate,
  onSelectVictim 
}) => {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // New intervention modal state
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedVictimForInv, setSelectedVictimForInv] = useState<string>('');
  const [invType, setInvType] = useState('Scheduled In-Person Counselling');
  const [invNotes, setInvNotes] = useState('');
  const [isSubmittingInv, setIsSubmittingInv] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [dashRes, alertRes, invRes] = await Promise.allSettled([
          api.getCounsellorDashboard(),
          api.getAlerts(),
          api.getAllInterventions()
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value) {
          setData(dashRes.value);
        } else {
          setData({
            kpi: { total_assigned: 4, low_risk: 1, moderate_risk: 1, high_risk: 1, critical_risk: 1, new_alerts: 2, pending_interventions: 1 },
            victims: [
              { victim_id: '70000000-0000-0000-0000-000000000001', victim_code: 'VIC-DEMO-0001', name: 'Sunita Devi', case_code: 'CASE-DEMO-0001', latest_score: 82, risk_level: 'CRITICAL', trend: 'Rapidly Increasing', last_checkin: '2026-08-20', threat_reported: true },
              { victim_id: '70000000-0000-0000-0000-000000000002', victim_code: 'VIC-DEMO-0002', name: 'Ramesh Kumar', case_code: 'CASE-DEMO-0002', latest_score: 76, risk_level: 'CRITICAL', trend: 'Increasing', last_checkin: '2026-09-04', threat_reported: true },
              { victim_id: '70000000-0000-0000-0000-000000000004', victim_code: 'VIC-DEMO-0004', name: 'Anuradha V.', case_code: 'CASE-DEMO-0004', latest_score: 48, risk_level: 'MODERATE', trend: 'Improving', last_checkin: '2026-09-02', threat_reported: false },
              { victim_id: '70000000-0000-0000-0000-000000000003', victim_code: 'VIC-DEMO-0003', name: 'Priya S.', case_code: 'CASE-DEMO-0003', latest_score: 24, risk_level: 'LOW', trend: 'Stable', last_checkin: '2026-09-03', threat_reported: false },
            ]
          });
        }

        if (alertRes.status === 'fulfilled' && alertRes.value?.alerts) {
          setAlerts(alertRes.value.alerts);
        } else {
          setAlerts([
            { id: 'al-01', victim_id: '70000000-0000-0000-0000-000000000001', victim_code: 'VIC-DEMO-0001', alert_type: 'RAPID_DISTRESS_SURGE', severity: 'CRITICAL', message: 'Victim reported direct threat/intimidation near residential quarter. Distress surged to 82/100.', status: 'NEW', created_at: '2026-09-08T09:30:00Z' },
            { id: 'al-02', victim_id: '70000000-0000-0000-0000-000000000002', victim_code: 'VIC-DEMO-0002', alert_type: 'SEVERE_ANXIETY_SPIKE', severity: 'HIGH', message: 'Extreme insomnia and panic score reported ahead of court hearing.', status: 'ACKNOWLEDGED', created_at: '2026-09-07T14:15:00Z' },
          ]);
        }

        if (invRes.status === 'fulfilled' && invRes.value?.interventions) {
          setInterventions(invRes.value.interventions);
        } else {
          setInterventions([
            { id: 'inv-01', victim_id: '70000000-0000-0000-0000-000000000001', victim_code: 'VIC-DEMO-0001', intervention_type: 'Emergency Clinical Counselling', approved_by: 'Dr. Ananya Sharma', status: 'COMPLETED', scheduled_at: '2026-09-06T10:00:00Z', notes: 'Conducted grounding exercise and trauma narrative review.' },
            { id: 'inv-02', victim_id: '70000000-0000-0000-0000-000000000002', victim_code: 'VIC-DEMO-0002', intervention_type: 'Pre-Trial Anxiety Support', approved_by: 'Dr. Ananya Sharma', status: 'SCHEDULED', scheduled_at: '2026-09-09T14:00:00Z', notes: 'Scheduled ahead of court witness testimony.' },
          ]);
        }
      } catch (e) {
        console.warn("Error loading counsellor data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const kpi = data?.kpi || { total_assigned: 4, low_risk: 1, moderate_risk: 1, high_risk: 1, critical_risk: 1, new_alerts: 2 };
  const victimList = data?.victims || [];

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a));
      setNotice("Alert acknowledged and assigned to your clinical review queue.");
      setTimeout(() => setNotice(null), 3500);
    } catch (e: any) {
      alert("Failed to acknowledge alert: " + (e.message || "Unknown error"));
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a));
      setNotice("Alert resolved and marked completed in clinical audit.");
      setTimeout(() => setNotice(null), 3500);
    } catch (e: any) {
      alert("Failed to resolve alert: " + (e.message || "Unknown error"));
    }
  };

  const handleCreateInterventionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVictimForInv) {
      alert("Please select a victim.");
      return;
    }
    setIsSubmittingInv(true);
    try {
      const res = await api.createIntervention({
        victim_id: selectedVictimForInv,
        intervention_type: invType,
        notes: invNotes
      });
      if (res && res.intervention) {
        setInterventions(prev => [res.intervention, ...prev]);
      }
      setIsInterventionModalOpen(false);
      setInvNotes('');
      setNotice("Counselling session recorded and added to care timeline.");
      setTimeout(() => setNotice(null), 4000);
    } catch (e: any) {
      alert("Failed to create intervention: " + (e.message || "Unknown error"));
    } finally {
      setIsSubmittingInv(false);
    }
  };

  const filteredVictims = victimList.filter((v: any) => {
    const matchesSearch = v.victim_code.toLowerCase().includes(searchTerm.toLowerCase()) || v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || v.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clinical Counsellor Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trauma-informed distress screening, clinical queue, and longitudinal rehabilitation</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
            Dr. Ananya Sharma — Senior District Counsellor
          </span>
          <button
            onClick={() => {
              if (victimList.length > 0) setSelectedVictimForInv(victimList[0].victim_id);
              setIsInterventionModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Session</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* VIEW 1: ASSIGNED VICTIMS DIRECTORY */}
      {activeTab === 'victims' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <span>Assigned Victims Care Directory</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete caseload roster with objective longitudinal distress status</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search victim code or name..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Filter Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  riskFilter === lvl
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Victims Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Victim Code</th>
                  <th className="py-3 px-4">Case Reference</th>
                  <th className="py-3 px-4">Distress Signal</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Longitudinal Trend</th>
                  <th className="py-3 px-4">Threat Reported</th>
                  <th className="py-3 px-4">Last Check-in</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVictims.map((v: any) => (
                  <tr key={v.victim_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {v.victim_code}
                      <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-normal">{v.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{v.case_code}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{v.latest_score}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">/100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={v.risk_level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <TrendBadge trend={v.trend} />
                    </td>
                    <td className="py-3.5 px-4">
                      {v.threat_reported ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span>Active Threat</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{v.last_checkin}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectVictim(v.victim_id)}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-lg text-xs transition shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Open Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: HIGH-RISK ALERTS QUEUE */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>High-Risk Clinical Alerts &amp; Critical Trajectory Warnings</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous distress surges and threats requiring immediate clinician review</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              {alerts.filter(a => a.status === 'NEW').length} New Urgent
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((a: any) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">{a.victim_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {a.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.alert_type?.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">{a.created_at?.slice(0, 16)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.status === 'NEW' ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 animate-pulse' : a.status === 'ACKNOWLEDGED' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {a.message}
                </p>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  {a.status === 'NEW' && (
                    <button
                      onClick={() => handleAcknowledgeAlert(a.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {a.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => onSelectVictim(a.victim_id)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
                  >
                    <span>Open Patient Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: COUNSELLING RECORDS & INTERVENTIONS */}
      {activeTab === 'interventions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <span>Counselling Sessions &amp; Clinical Interventions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Documented psychological support, clinical sessions, and follow-ups</p>
            </div>
            <button
              onClick={() => {
                if (victimList.length > 0) setSelectedVictimForInv(victimList[0].victim_id);
                setIsInterventionModalOpen(true);
              }}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Session</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Victim Code</th>
                  <th className="py-3 px-4">Intervention Type</th>
                  <th className="py-3 px-4">Clinician Notes</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {interventions.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.victim_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{inv.intervention_type}</td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate">{inv.notes || 'Routine follow-up'}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{inv.approved_by || 'Dr. Ananya Sharma'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{inv.scheduled_at?.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: DEFAULT DASHBOARD (KPIs, DIURNAL, QUICK ROSTER) */}
      {activeTab === 'dashboard' && (
        <>
          {/* KPI Cards with Visual Accent Top Borders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-slate-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Monitored</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{kpi.total_assigned}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned victims</div>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 border-t-4 border-t-emerald-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Low Risk</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{kpi.low_risk}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Score 0 — 29</div>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 border-t-4 border-t-amber-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Moderate</div>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{kpi.moderate_risk}</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">Score 30 — 49</div>
            </div>

            <div className="bg-orange-50/70 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800/60 border-t-4 border-t-orange-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider">High Risk</div>
              <div className="text-2xl font-extrabold text-orange-700 dark:text-orange-300 mt-1">{kpi.high_risk}</div>
              <div className="text-[10px] text-orange-600 dark:text-orange-500 mt-0.5">Score 50 — 74</div>
            </div>

            <div className="bg-red-50/70 dark:bg-red-950/30 p-4 rounded-xl border border-red-300 dark:border-red-800/60 border-t-4 border-t-red-500 shadow-sm transition-colors">
              <div className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Critical</span>
              </div>
              <div className="text-2xl font-extrabold text-red-700 dark:text-red-300 mt-1">{kpi.critical_risk}</div>
              <div className="text-[10px] text-red-600 dark:text-red-500 mt-0.5">Score 75 — 100</div>
            </div>
          </div>

          {/* Diurnal Distress Analytics Card */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>District Diurnal Distress Pattern</span>
              </div>
              <h3 className="text-base font-bold">Peak District Distress Window: <span className="text-amber-300">8:00 PM — 11:00 PM</span></h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Population-level analysis indicates 72% of high-distress signals occur during late evening hours. Counselors are advised to schedule proactive outreach calls between <span className="text-teal-300 font-semibold">4:00 PM and 7:00 PM</span> prior to peak anxiety triggers.
              </p>
            </div>

            <div className="bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700 dark:border-slate-800 p-4 rounded-xl space-y-3 w-full md:w-80 shrink-0">
              <div className="flex items-center justify-between text-xs border-b border-slate-700 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">Optimal Calling Window:</span>
                <span className="font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">4:00 PM - 7:00 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-700 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-medium">High Anxiety Window:</span>
                <span className="font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">8:00 PM - 11:00 PM</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-300 pt-1">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>AI recommendation active for NTR &amp; Guntur Districts</span>
              </div>
            </div>
          </div>

          {/* Quick Roster */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Prioritized Victim Case Roster</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Sorted by dynamic risk severity score</span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('victims')}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  View Full Directory &rarr;
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Victim Code</th>
                    <th className="py-3 px-4">Case Code</th>
                    <th className="py-3 px-4">Distress Score</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Longitudinal Trend</th>
                    <th className="py-3 px-4">Safety Status</th>
                    <th className="py-3 px-4">Last Check-in</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {victimList.slice(0, 5).map((v: any) => (
                    <tr key={v.victim_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{v.victim_code}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{v.case_code}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">{v.latest_score}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">/100</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={v.risk_level} />
                      </td>
                      <td className="py-3.5 px-4">
                        <TrendBadge trend={v.trend} />
                      </td>
                      <td className="py-3.5 px-4">
                        {v.threat_reported ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            <span>Threat Signal</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Normal</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{v.last_checkin}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectVictim(v.victim_id)}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-lg text-xs transition shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Open Profile</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Intervention Modal */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <span>Record Counselling Session</span>
              </h3>
              <button
                onClick={() => setIsInterventionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInterventionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient / Victim *</label>
                <select
                  value={selectedVictimForInv}
                  onChange={(e) => setSelectedVictimForInv(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  {victimList.map((v: any) => (
                    <option key={v.victim_id} value={v.victim_id} className="dark:bg-slate-800 dark:text-white">
                      {v.victim_code} — {v.name} (Risk: {v.risk_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Intervention Type</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  <option value="Scheduled In-Person Counselling">Scheduled In-Person Counselling</option>
                  <option value="Telephonic Crisis Support">Telephonic Crisis Support</option>
                  <option value="Pre-Trial Witness Calming & Grounding">Pre-Trial Witness Calming &amp; Grounding</option>
                  <option value="Psychiatric Consultation Referral">Psychiatric Consultation Referral</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinician Notes &amp; Observations *</label>
                <textarea
                  required
                  rows={3}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Document clinical observations, psychological stabilization, or referral notes..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInterventionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInv}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {isSubmittingInv ? <span>Saving...</span> : <span>Save Session Record</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
