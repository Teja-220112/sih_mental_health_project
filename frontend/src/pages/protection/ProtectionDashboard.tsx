import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Shield, AlertTriangle, UserCheck, Home, PhoneCall, CheckCircle, 
  Clock, MapPin, Search, Calendar, CheckCircle2, ChevronRight, FileCheck
} from 'lucide-react';

interface ThreatEvent {
  id: string;
  victim_id: string;
  case_id?: string;
  reported_at: string;
  threat_type: string;
  severity: number;
  description: string;
  action_taken: string;
  status: string;
}

interface ProtectionMetrics {
  active_threat_events: number;
  total_threat_events: number;
  police_escorts_deployed: number;
  relocation_requests_pending: number;
  critical_security_alerts: number;
}

export interface ProtectionDashboardProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const ProtectionDashboard: React.FC<ProtectionDashboardProps> = ({ 
  activeTab = 'dashboard', 
  onNavigate 
}) => {
  const [metrics, setMetrics] = useState<ProtectionMetrics>({
    active_threat_events: 5,
    total_threat_events: 31,
    police_escorts_deployed: 14,
    relocation_requests_pending: 3,
    critical_security_alerts: 4
  });
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Escort roster mock/state
  const [escortRoster, setEscortRoster] = useState([
    { id: 'esc-01', victim_code: 'VIC-DEMO-0001', court_case: 'SC/ST Special Case 104/2026', hearing_date: '2026-10-05', station: 'Suryaraopet PS', officer_assigned: 'HC R. Venkatesh (Armed Escort)', status: 'SCHEDULED' },
    { id: 'esc-02', victim_code: 'VIC-DEMO-0008', court_case: 'SC/ST Special Case 112/2026', hearing_date: '2026-10-08', station: 'Governorpet PS', officer_assigned: 'PC K. Srinivas', status: 'ACTIVE_DEPLOYED' },
    { id: 'esc-03', victim_code: 'VIC-DEMO-0015', court_case: 'SC/ST Special Case 98/2026', hearing_date: '2026-10-12', station: 'Patamata PS', officer_assigned: 'Pending Allocation', status: 'PENDING_APPROVAL' },
    { id: 'esc-04', victim_code: 'VIC-DEMO-0022', court_case: 'SC/ST Special Case 130/2026', hearing_date: '2026-10-14', station: 'Machavaram PS', officer_assigned: 'HC G. Anjaneyulu', status: 'SCHEDULED' }
  ]);

  // Relocation requests
  const [relocations, setRelocations] = useState([
    { id: 'rel-01', victim_code: 'VIC-DEMO-0001', risk_level: 'CRITICAL', shelter_type: 'Secure District Govt Guest Quarters', period_days: 30, approval_status: 'APPROVED', effective_date: '2026-09-10' },
    { id: 'rel-02', victim_code: 'VIC-DEMO-0008', risk_level: 'HIGH', shelter_type: 'Transit Safe Shelter (Wing B)', period_days: 15, approval_status: 'PENDING_REVIEW', effective_date: 'Pending' },
    { id: 'rel-03', victim_code: 'VIC-DEMO-0019', risk_level: 'HIGH', shelter_type: 'Inter-District Protective Housing (Guntur)', period_days: 60, approval_status: 'PENDING_REVIEW', effective_date: 'Pending' }
  ]);

  useEffect(() => {
    const fetchProtectionData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/protection');
        if (res && res.metrics) {
          setMetrics(res.metrics);
        }
        if (res && res.threat_events && res.threat_events.length > 0) {
          setThreatEvents(res.threat_events);
        } else {
          setThreatEvents([
            {
              id: 't-001',
              victim_id: 'VIC-DEMO-0001',
              reported_at: '2026-09-08 09:30',
              threat_type: 'Witness Coercion / Verbal Threat',
              severity: 5,
              description: 'Two associates of the accused approached victim near Suryaraopet market warning against testifying in upcoming trial.',
              action_taken: '24/7 Police Patrol Assigned; FIR supplement submitted at Suryaraopet PS.',
              status: 'OPEN'
            },
            {
              id: 't-002',
              victim_id: 'VIC-DEMO-0008',
              reported_at: '2026-09-07 14:15',
              threat_type: 'Physical Harassment & Stalking',
              severity: 4,
              description: 'Unknown motorbike riders loitering outside residence during evening hours.',
              action_taken: 'Static picket placed near residence; Night beat vehicle route updated.',
              status: 'OPEN'
            },
            {
              id: 't-003',
              victim_id: 'VIC-DEMO-0015',
              reported_at: '2026-09-06 18:00',
              threat_type: 'Social Exclusion Enforcement',
              severity: 3,
              description: 'Panchayat gathering called to exert social pressure to withdraw SC/ST PoA complaint.',
              action_taken: 'Tahsildar & Revenue Divisional Officer issued warning notice under Section 107 CrPC.',
              status: 'RESOLVED'
            },
            {
              id: 't-004',
              victim_id: 'VIC-DEMO-0022',
              reported_at: '2026-09-05 11:20',
              threat_type: 'Witness Intimidation outside Court',
              severity: 5,
              description: 'Accused family members gestured aggressively in Vijayawada District Court corridors.',
              action_taken: 'Court escort security assigned for all subsequent hearings.',
              status: 'RESOLVED'
            }
          ]);
        }
      } catch (err) {
        console.warn("Using offline fallback data for protection dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtectionData();
  }, []);

  const handleResolveEvent = (id: string, actionDesc: string) => {
    setThreatEvents(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'RESOLVED', action_taken: actionDesc };
      }
      return t;
    }));
    setActionSuccessMsg(`Security protocol executed: ${actionDesc}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleApproveEscort = (escortId: string) => {
    setEscortRoster(prev => prev.map(e => {
      if (e.id === escortId) {
        return { ...e, status: 'SCHEDULED', officer_assigned: 'Station Armed Constable Assigned' };
      }
      return e;
    }));
    setActionSuccessMsg('Armed court escort approved and scheduled with station SHO.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleApproveRelocation = (relId: string) => {
    setRelocations(prev => prev.map(r => {
      if (r.id === relId) {
        return { ...r, approval_status: 'APPROVED', effective_date: 'Immediate (24 hrs)' };
      }
      return r;
    }));
    setActionSuccessMsg('Emergency Safe Shelter relocation approved under Rule 15A.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const filteredEvents = threatEvents.filter(t => {
    const matchesSearch = t.threat_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.victim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 sm:p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Role: Protection Officer
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              AP-NTR-01 • Vijayawada
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            NTR District Witness &amp; Victim Protection Cell
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time threat monitoring, witness escort deployment, and emergency relocation oversight under SC/ST Protection of Atrocities Act.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-left md:text-right w-full md:w-auto">
          <p className="text-[11px] text-slate-400 font-medium">Duty Protection Officer</p>
          <p className="text-sm font-bold text-white">Smt. K. Ratna Kumari</p>
          <p className="text-[10px] text-teal-400">NTR District SP Office Liaison</p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-teal-50 border border-teal-300 text-teal-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* VIEW 1: WITNESS THREAT QUEUE */}
      {activeTab === 'threats' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Witness Protection &amp; Threat Event Queue</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live threat reports filed by victims in NTR District police jurisdictions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search code, type..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
                {(['ALL', 'OPEN', 'RESOLVED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      activeFilter === f 
                        ? 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Victim / Code</th>
                  <th className="py-3 px-4">Threat Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Incident Details</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Protection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {event.victim_id}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{event.reported_at?.slice(0, 16)}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {event.threat_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.severity >= 5
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                          : event.severity === 4
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800'
                      }`}>
                        Level {event.severity}/5
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-700 dark:text-slate-300">
                      <p className="line-clamp-2">{event.description}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-400 text-[11px]">
                      {event.action_taken || 'Pending Review'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        event.status === 'OPEN'
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {event.status === 'OPEN' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResolveEvent(event.id, "Police Escort Dispatched & Local Station Picket Deployed")}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-[11px] shadow-xs transition cursor-pointer"
                          >
                            Deploy Escort
                          </button>
                          <button
                            onClick={() => handleResolveEvent(event.id, "Emergency Safe House Relocation Approved")}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition cursor-pointer"
                          >
                            Relocate
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: POLICE ESCORT ROSTER */}
      {activeTab === 'escorts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>Dedicated Police Escort Deployment Roster</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled armed constable court escorts for trial witnesses</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full min-w-[650px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Victim Code</th>
                  <th className="py-3 px-4">Special Court Case</th>
                  <th className="py-3 px-4">Trial Hearing Date</th>
                  <th className="py-3 px-4">Jurisdiction Station</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4">Deployment Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {escortRoster.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{e.victim_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{e.court_case}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-4">
                      <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      <span>{e.hearing_date}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{e.station}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{e.officer_assigned}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        e.status === 'ACTIVE_DEPLOYED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        e.status === 'SCHEDULED' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                        'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {e.status === 'PENDING_APPROVAL' ? (
                        <button
                          onClick={() => handleApproveEscort(e.id)}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Approve Escort
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Secured</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: EMERGENCY RELOCATIONS */}
      {activeTab === 'relocation' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Emergency Safe Shelter &amp; Relocation Reviews</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">30-day and 60-day protective safe housing under Section 15A of SC/ST PoA Act</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full min-w-[650px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Victim Code</th>
                  <th className="py-3 px-4">Assessed Risk</th>
                  <th className="py-3 px-4">Designated Shelter Facility</th>
                  <th className="py-3 px-4">Sanctioned Period</th>
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Protection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {relocations.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{r.victim_code}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.risk_level === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{r.shelter_type}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.period_days} Days Safe Custody</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{r.effective_date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        r.approval_status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {r.approval_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.approval_status === 'PENDING_REVIEW' ? (
                        <button
                          onClick={() => handleApproveRelocation(r.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Approve Housing
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Sanctioned</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: DEFAULT DASHBOARD (OVERVIEW) */}
      {activeTab === 'dashboard' && (
        <>
          {/* KPI Cards with Colored Top Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-red-500 shadow-sm transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Threats</p>
                  <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{metrics.active_threat_events}</h3>
                </div>
                <div className="p-2 bg-red-50 dark:bg-red-950/50 rounded-lg text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-400 mt-2 font-medium">Requires immediate protocol</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-teal-500 shadow-sm transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Police Escorts</p>
                  <h3 className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">{metrics.police_escorts_deployed}</h3>
                </div>
                <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-lg text-teal-700 dark:text-teal-400">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-2 font-medium">Active during court hearings</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-amber-500 shadow-sm transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Relocations</p>
                  <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.relocation_requests_pending}</h3>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
                  <Home className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 font-medium">Safe shelter under review</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500 shadow-sm transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Threats</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.total_threat_events}</h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Recorded since July 2026</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-t-4 border-t-purple-500 shadow-sm transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security Alerts</p>
                  <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{metrics.critical_security_alerts}</h3>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600 dark:text-purple-400">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-2 font-medium">Dispatched to District SP</p>
            </div>
          </div>

          {/* Quick Roster Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rapid Dispatch Box */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>NTR District Rapid Protection Network</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct hotline connectivity to Vijayawada Police Commissionerate and station officers.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Suryaraopet Station</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-0.5">0866-2432101</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Governorpet Station</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-0.5">0866-2432102</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Patamata Station</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-0.5">0866-2432103</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Machavaram Station</p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-0.5">0866-2432104</p>
                </div>
              </div>
            </div>

            {/* Statutory Protocols */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Standard Witness Protection Protocols (SC/ST PoA Act)</span>
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li><strong className="text-slate-800 dark:text-white">Escort Deployment:</strong> Armed constable escort during travel to Special Court.</li>
                <li><strong className="text-slate-800 dark:text-white">Static Picket Posting:</strong> Station picket posted at residence for Level 4 and 5 threat signals.</li>
                <li><strong className="text-slate-800 dark:text-white">Emergency Safe Shelter:</strong> 30-day temporary relocation facility in secure residential quarters.</li>
                <li><strong className="text-slate-800 dark:text-white">Perimeter Monitoring:</strong> Daily patrolling logs verified by Sub-Inspector of concerned jurisdiction.</li>
              </ul>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
