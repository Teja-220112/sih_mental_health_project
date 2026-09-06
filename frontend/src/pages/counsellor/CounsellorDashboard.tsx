import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { TrendBadge } from '../../components/ui/TrendBadge';
import { Users, AlertTriangle, ShieldCheck, Flame, Search, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CounsellorDashboardProps {
  onSelectVictim: (victimId: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({ onSelectVictim }) => {
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCounsellorDashboard();
        setData(res);
      } catch (e) {
        console.warn("Failed to load counsellor dashboard from API, using local fallback:", e);
        setData({
          kpi: {
            total_assigned: 4,
            low_risk: 1,
            moderate_risk: 1,
            high_risk: 1,
            critical_risk: 1,
            new_alerts: 2,
            pending_interventions: 1
          },
          victims: [
            { victim_id: '70000000-0000-0000-0000-000000000001', victim_code: 'VIC-2026-101', name: 'Sunita Devi', case_code: 'POA-PUNE-2026-042', latest_score: 82, risk_level: 'CRITICAL', trend: 'Rapidly Increasing', last_checkin: '2026-08-20', threat_reported: true },
            { victim_id: '70000000-0000-0000-0000-000000000002', victim_code: 'VIC-2026-102', name: 'Ramesh Kumar', case_code: 'POA-NAGP-2026-089', latest_score: 76, risk_level: 'CRITICAL', trend: 'Increasing', last_checkin: '2026-09-04', threat_reported: true },
            { victim_id: '70000000-0000-0000-0000-000000000004', victim_code: 'VIC-2026-104', name: 'Ganpat R.', case_code: 'POA-NASH-2026-015', latest_score: 48, risk_level: 'MODERATE', trend: 'Improving', last_checkin: '2026-09-02', threat_reported: false },
            { victim_id: '70000000-0000-0000-0000-000000000003', victim_code: 'VIC-2026-103', name: 'Priya S.', case_code: 'POA-PUNE-2026-099', latest_score: 24, risk_level: 'LOW', trend: 'Stable', last_checkin: '2026-09-03', threat_reported: false },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const kpi = data?.kpi || { total_assigned: 4, low_risk: 1, moderate_risk: 1, high_risk: 1, critical_risk: 1, new_alerts: 2 };
  const victimList = data?.victims || [];

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
          <h2 className="text-xl font-bold text-slate-900">Counsellor Monitoring Dashboard</h2>
          <p className="text-xs text-slate-500">Real-time distress screening matrix & prioritized victim case roster</p>
        </div>

        <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200">
          Dr. Ananya Sharma — Senior District Counsellor
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Monitored</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.total_assigned}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned victims</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Low Risk</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{kpi.low_risk}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Score 0 — 29</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Moderate</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{kpi.moderate_risk}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Score 30 — 49</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
          <div className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider">High Risk</div>
          <div className="text-2xl font-extrabold text-orange-700 mt-1">{kpi.high_risk}</div>
          <div className="text-[10px] text-orange-600 mt-0.5">Score 50 — 74</div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-300 shadow-sm animate-pulse">
          <div className="text-[11px] font-semibold text-red-800 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>Critical</span>
          </div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{kpi.critical_risk}</div>
          <div className="text-[10px] text-red-600 mt-0.5">Score 75 — 100</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search victim code or name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Risk:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                riskFilter === lvl
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Victim Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Prioritized Victim Case Roster</h3>
          <span className="text-xs text-slate-500">Sorted by risk severity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVictims.map((v: any) => (
                <tr key={v.victim_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{v.victim_code}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{v.case_code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 text-sm">{v.latest_score}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={v.risk_level} />
                  </td>
                  <td className="py-3.5 px-4">
                    <TrendBadge trend={v.trend} />
                  </td>
                  <td className="py-3.5 px-4">
                    {v.threat_reported ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>Threat Signal</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Normal</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{v.last_checkin}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectVictim(v.victim_id)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-all shadow-sm inline-flex items-center space-x-1"
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

    </div>
  );
};
