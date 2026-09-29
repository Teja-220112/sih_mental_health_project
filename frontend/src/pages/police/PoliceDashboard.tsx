import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Shield, AlertTriangle, UserPlus, CheckCircle2, Clock, 
  Search, PhoneCall, Copy, Check, FileText, 
  ShieldAlert, UserCheck, Key, ArrowRight, Building2, Eye, Filter
} from 'lucide-react';
import { VictimRegistrationResponse } from '../../types';

interface PoliceStationInfo {
  police_station: string;
  district_code: string;
  district_name: string;
  officer_name: string;
  jurisdiction: string;
}

interface PoliceMetrics {
  total_registered_cases: number;
  under_investigation: number;
  charge_sheets_filed: number;
  cases_in_trial: number;
  active_threat_reports: number;
  assisted_checkins_conducted: number;
  protection_patrols_deployed: number;
}

export interface PoliceDashboardProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export const PoliceDashboard: React.FC<PoliceDashboardProps> = ({ 
  activeTab = 'dashboard', 
  onNavigate 
}) => {
  const [stationInfo, setStationInfo] = useState<PoliceStationInfo>({
    police_station: 'Suryaraopet Police Station, Vijayawada',
    district_code: 'AP-NTR-01',
    district_name: 'NTR District (Vijayawada)',
    officer_name: 'Inspector Vijay Prakash (Registration & Station Officer)',
    jurisdiction: 'Vijayawada Urban Division, Andhra Pradesh'
  });

  const [metrics, setMetrics] = useState<PoliceMetrics>({
    total_registered_cases: 100,
    under_investigation: 34,
    charge_sheets_filed: 42,
    cases_in_trial: 24,
    active_threat_reports: 12,
    assisted_checkins_conducted: 28,
    protection_patrols_deployed: 60
  });

  const [cases, setCases] = useState<any[]>([]);
  const [threatEvents, setThreatEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [threatFilter, setThreatFilter] = useState<string>('ALL');
  const [patrolNotice, setPatrolNotice] = useState<string | null>(null);

  // Selected case for detailed inspection
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    age_group: '26-35',
    gender: 'Female',
    preferred_language: 'en',
    email: '',
    case_category: 'Assault and physical violence',
    incident_description: '',
    police_station: 'Suryaraopet Police Station, Vijayawada',
    assigned_counsellor: 'Dr. Ananya Sharma',
    assigned_protection_officer: 'Smt. K. Ratna Kumari',
    protection_required: true,
    rehabilitation_requirements: 'Legal Aid Support Sanctioned & Interim Compensation'
  });
  const [createdCredential, setCreatedCredential] = useState<VictimRegistrationResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);

  // Assisted Check-in State
  const [assistedVictim, setAssistedVictim] = useState<any>(null);
  const [assistedScores, setAssistedScores] = useState({
    stress_score: 2,
    anxiety_score: 2,
    fear_score: 2,
    sleep_score: 2,
    safety_score: 3,
    threat_score: 1,
    social_support_score: 3,
    functioning_score: 2,
    case_related_distress: 2,
    immediate_danger: false,
    free_text_response: ''
  });
  const [assistedSuccess, setAssistedSuccess] = useState<string | null>(null);
  const [isSubmittingAssisted, setIsSubmittingAssisted] = useState<boolean>(false);

  // Load Dashboard Data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPoliceDashboard();
      if (res) {
        if (res.station_info) setStationInfo(res.station_info);
        if (res.metrics) setMetrics(res.metrics);
        if (res.cases) {
          setCases(res.cases);
          if (!assistedVictim && res.cases.length > 0) {
            setAssistedVictim(res.cases[0]);
          }
        }
        if (res.threat_events) setThreatEvents(res.threat_events);
      }
    } catch (err) {
      console.warn("Using local police dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Victim Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.incident_description) {
      alert("Please provide the victim's name and incident description.");
      return;
    }
    setIsSubmittingReg(true);
    try {
      const res = await api.registerVictim(regForm);
      if (res && res.data) {
        setCreatedCredential(res.data);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Failed to register victim: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Submit Assisted Check-in
  const handleAssistedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistedVictim) return;
    setIsSubmittingAssisted(true);
    try {
      const payload = {
        victim_id: assistedVictim.victim_id || assistedVictim.id,
        recorded_by: "11000000-0000-0000-0000-000000000001",
        ...assistedScores
      };
      await api.submitAssistedCheckin(payload);
      setAssistedSuccess(`Assisted check-in logged for ${assistedVictim.victim_code} (${assistedVictim.victim_name || assistedVictim.name}). System updated risk signals.`);
      setTimeout(() => {
        setAssistedSuccess(null);
      }, 4000);
      fetchDashboardData();
    } catch (err: any) {
      alert("Failed to submit assisted check-in: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmittingAssisted(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleDispatchPatrol = (threatId: string, threatType: string) => {
    setThreatEvents(prev => prev.map(t => {
      if (t.id === threatId) {
        return { ...t, status: 'RESOLVED', action_taken: 'Armed Mobile Patrol Dispatched' };
      }
      return t;
    }));
    setPatrolNotice(`Armed Patrol Dispatched for ${threatType}. Suryaraopet Beat Vehicle deployed.`);
    setTimeout(() => setPatrolNotice(null), 4000);
  };

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.case_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.victim_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.victim_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.case_category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stageFilter === 'ALL') return matchesSearch;
    return matchesSearch && (c.case_stage === stageFilter || (stageFilter === 'Investigation' && (c.investigation_status || '').includes('Investigation')));
  });

  const filteredThreats = threatEvents.filter(t => {
    if (threatFilter === 'ALL') return true;
    return t.status === threatFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Station Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Andhra Pradesh Police • {stationInfo.district_code}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">{stationInfo.police_station}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Station Registration Officer: <span className="text-teal-300 font-semibold">{stationInfo.officer_name}</span> • {stationInfo.jurisdiction}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigate ? onNavigate('register_victim') : null}
            className={`flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'register_victim'
                ? 'bg-teal-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Victim</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('assisted_checkin') : null}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'assisted_checkin'
                ? 'bg-teal-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assisted Entry</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('threat_patrols') : null}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'threat_patrols'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Patrol Queue</span>
          </button>
        </div>
      </div>

      {patrolNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{patrolNotice}</span>
        </div>
      )}

      {/* VIEW 1: REGISTER VICTIM & CASE */}
      {activeTab === 'register_victim' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-400">
              <UserPlus className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Official Victim &amp; Legal Case Registration</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Statutory intake under SC/ST (Prevention of Atrocities) Act</p>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Back to Cases Overview &rarr;
              </button>
            )}
          </div>

          {!createdCredential ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Victim Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mary Rathnam"
                    value={regForm.name}
                    onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Age Group</label>
                  <select
                    value={regForm.age_group}
                    onChange={(e) => setRegForm({...regForm, age_group: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36-50">36-50 years</option>
                    <option value="51+">51+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gender</label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({...regForm, gender: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Preferred Language</label>
                  <select
                    value={regForm.preferred_language}
                    onChange={(e) => setRegForm({...regForm, preferred_language: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Case Category *</label>
                  <select
                    value={regForm.case_category}
                    onChange={(e) => setRegForm({...regForm, case_category: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Assault and physical violence">Assault and physical violence</option>
                    <option value="Criminal intimidation & witness coercion">Criminal intimidation & witness coercion</option>
                    <option value="Land dispossession & illegal entry">Land dispossession & illegal entry</option>
                    <option value="Public humiliation & verbal abuse">Public humiliation & verbal abuse</option>
                    <option value="Sexual harassment & exploitation">Sexual harassment & exploitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jurisdiction Police Station</label>
                  <input
                    type="text"
                    disabled
                    value={regForm.police_station}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Incident Description &amp; FIR Allegation *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record summary of incident, accused details, and FIR sections..."
                  value={regForm.incident_description}
                  onChange={(e) => setRegForm({...regForm, incident_description: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Clinical Counsellor</label>
                  <input
                    type="text"
                    disabled
                    value={regForm.assigned_counsellor}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Protection Officer</label>
                  <input
                    type="text"
                    disabled
                    value={regForm.assigned_protection_officer}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="prot-req-tab"
                  checked={regForm.protection_required}
                  onChange={(e) => setRegForm({...regForm, protection_required: e.target.checked})}
                  className="w-4 h-4 text-teal-700 rounded cursor-pointer"
                />
                <label htmlFor="prot-req-tab" className="text-xs text-teal-900 dark:text-teal-300 font-semibold cursor-pointer">
                  Immediate Protection Protocol Required (Station Picket / Beat Escort Deployment)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmittingReg ? <span>Registering Case...</span> : <span>Register Victim &amp; Issue Credentials</span>}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-300 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Registration Successful &amp; Case Synchronized</h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400">Assigned identifier and single-session access credentials generated</p>
                </div>
              </div>

              <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-2xl space-y-3 font-mono border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Victim Access Code</span>
                  <span className="text-sm font-bold text-teal-400">{createdCredential.victim_code}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Case Reference</span>
                  <span className="text-sm font-bold text-slate-200">{createdCredential.case_code}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Login ID</span>
                  <span className="text-sm font-bold text-white">{createdCredential.login_identifier}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 uppercase">Temporary Password</span>
                  <span className="text-sm font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {createdCredential.temporary_password}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`Victim Code: ${createdCredential.victim_code}\nLogin ID: ${createdCredential.login_identifier}\nPassword: ${createdCredential.temporary_password}\nCase: ${createdCredential.case_code}`)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                  <span>{copiedKey ? "Copied Credentials!" : "Copy Credential Slip"}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedCredential(null);
                      setRegForm({ ...regForm, name: '', incident_description: '' });
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer"
                  >
                    Register Another
                  </button>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-xl transition cursor-pointer"
                    >
                      View Cases
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ASSISTED CHECK-IN ENTRY */}
      {activeTab === 'assisted_checkin' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-400">
              <FileText className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Official Assisted Check-in Entry Tool</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record guided psychometric &amp; safety screening on behalf of rural / non-smartphone citizens</p>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Back to Cases Overview &rarr;
              </button>
            )}
          </div>

          {assistedSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{assistedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAssistedSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Registered Victim *</label>
              <select
                value={assistedVictim?.id || assistedVictim?.victim_id || ''}
                onChange={(e) => {
                  const selected = cases.find(c => c.id === e.target.value || c.victim_id === e.target.value);
                  if (selected) setAssistedVictim(selected);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              >
                {cases.map((c: any) => (
                  <option key={c.id} value={c.victim_id || c.id} className="dark:bg-slate-800 dark:text-white">
                    {c.victim_code} — {c.victim_name || 'Victim'} ({c.case_code} • {c.case_category})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-4">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider">
                Psychometric Screening Scores (Scale 0 to 4)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Stress Score:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-400">{assistedScores.stress_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.stress_score}
                    onChange={(e) => setAssistedScores({...assistedScores, stress_score: parseFloat(e.target.value)})}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Anxiety Score:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-400">{assistedScores.anxiety_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.anxiety_score}
                    onChange={(e) => setAssistedScores({...assistedScores, anxiety_score: parseFloat(e.target.value)})}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fear / Threat Perception:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{assistedScores.fear_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.fear_score}
                    onChange={(e) => setAssistedScores({...assistedScores, fear_score: parseFloat(e.target.value)})}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Sleep Disruption:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-400">{assistedScores.sleep_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.sleep_score}
                    onChange={(e) => setAssistedScores({...assistedScores, sleep_score: parseFloat(e.target.value)})}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Perceived Physical Safety:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{assistedScores.safety_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.safety_score}
                    onChange={(e) => setAssistedScores({...assistedScores, safety_score: parseFloat(e.target.value)})}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Daily Functioning:</span>
                    <span className="font-bold text-teal-800 dark:text-teal-400">{assistedScores.functioning_score}/4</span>
                  </div>
                  <input
                    type="range" min="0" max="4" step="0.5"
                    value={assistedScores.functioning_score}
                    onChange={(e) => setAssistedScores({...assistedScores, functioning_score: parseFloat(e.target.value)})}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center space-x-3">
              <input
                type="checkbox"
                id="imm-danger-tab"
                checked={assistedScores.immediate_danger}
                onChange={(e) => setAssistedScores({...assistedScores, immediate_danger: e.target.checked})}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
              <label htmlFor="imm-danger-tab" className="text-xs text-red-900 dark:text-red-300 font-bold cursor-pointer">
                Immediate Physical Danger / Active Threat Detected (Triggers bypass to Critical Alert)
              </label>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Officer Verbal Observations</label>
              <textarea
                rows={3}
                placeholder="Document victim's statements during station inquiry or beat constable visit..."
                value={assistedScores.free_text_response}
                onChange={(e) => setAssistedScores({...assistedScores, free_text_response: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingAssisted}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                {isSubmittingAssisted ? <span>Submitting Ingestion...</span> : <span>Log Official Assisted Check-in</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: THREAT PATROL QUEUE */}
      {activeTab === 'threat_patrols' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Station Witness Threat &amp; Patrol Dispatch Queue</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of intimidation events and witness coercion reports</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setThreatFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    threatFilter === f 
                      ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Victim Code</th>
                  <th className="py-3 px-4">Threat Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Incident Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Patrol Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredThreats.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {t.victim_id}
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">{t.reported_at?.slice(0, 10)}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {t.threat_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        (t.severity || 4) >= 4 ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        Level {t.severity || 4}/5
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-400">
                      <p className="line-clamp-2">{t.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'OPEN' ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.status === 'OPEN' ? (
                        <button
                          onClick={() => handleDispatchPatrol(t.id, t.threat_type)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer flex items-center space-x-1 ml-auto"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Dispatch Patrol</span>
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Secured</span>
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

      {/* VIEW 4: DEFAULT DASHBOARD (OVERVIEW & CASES) */}
      {activeTab === 'dashboard' && (
        <>
          {/* 6 Key Police Metrics with Rich Colored Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-teal-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Cases</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{metrics.total_registered_cases}</span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">NTR District Roster</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-amber-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Under Inquiry</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">{metrics.under_investigation}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Active Investigation</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Charge Sheets</span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">{metrics.charge_sheets_filed}</span>
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">Special Court Filings</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-purple-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">In Court Trial</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">{metrics.cases_in_trial}</span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">Active Calendar</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-red-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Threat Alerts</span>
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1 block">{metrics.active_threat_reports}</span>
              <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold">Patrol Verification Req</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-500 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Assisted Checkins</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{metrics.assisted_checkins_conducted}</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Field Screenings</span>
            </div>
          </div>

          {/* Cases Roster and Threat Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Registered Victim & Case Directory */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>Station Case Registry &amp; Victim Protection Roster</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Official registry managed under the SC/ST PoA Protection Framework</p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search case, victim..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 w-full sm:w-44"
                    />
                  </div>

                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Stages</option>
                    <option value="Investigation">Investigation</option>
                    <option value="Charge Sheet Filed">Charge Sheet</option>
                    <option value="Court / Trial">Court / Trial</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Case Code</th>
                      <th className="py-2.5 px-3">Victim</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Stage / Status</th>
                      <th className="py-2.5 px-3">Protection</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCases.slice(0, 15).map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white font-mono">
                          {c.case_code}
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">{c.complaint_date}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{c.victim_name || 'Confidential'}</span>
                          <span className="block text-[10px] font-mono text-teal-700 dark:text-teal-400">{c.victim_code}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{c.case_category}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {c.investigation_status || c.case_stage}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>{c.protection_status || 'Patrol Monitored'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setAssistedVictim(c);
                              if (onNavigate) onNavigate('assisted_checkin');
                            }}
                            className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-300 rounded-lg text-[11px] font-semibold border border-teal-200 dark:border-teal-800 transition cursor-pointer"
                          >
                            Assisted Entry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                <span>Showing top {Math.min(15, filteredCases.length)} of {filteredCases.length} cases</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Jurisdiction: {stationInfo.police_station}</span>
              </div>
            </div>

            {/* Right Col: Threat Reports & Station Patrol Dispatch Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Station Threat Alerts</span>
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    {threatEvents.filter(t => t.status === 'OPEN').length} Open
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
                  {threatEvents.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.threat_type}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.status === 'OPEN' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        {t.description}
                      </p>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span>Severity: <strong className="text-red-600 dark:text-red-400">{t.severity || 4}/5</strong></span>
                        <span className="text-slate-400 dark:text-slate-500">{t.reported_at ? t.reported_at.slice(0, 10) : 'Recent'}</span>
                      </div>

                      {t.status === 'OPEN' && (
                        <button
                          onClick={() => handleDispatchPatrol(t.id, t.threat_type)}
                          className="w-full mt-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Dispatch Patrol Unit</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('threat_patrols')}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition text-center cursor-pointer"
                >
                  View All Threat Reports &rarr;
                </button>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};
