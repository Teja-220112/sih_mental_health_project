import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Shield, AlertTriangle, UserPlus, CheckCircle2, Clock, 
  MapPin, Search, PhoneCall, Copy, Check, FileText, 
  ShieldAlert, UserCheck, Calendar, Lock, Key, ExternalLink,
  ChevronRight, Building2, Send, Filter, Eye
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

export const PoliceDashboard: React.FC = () => {
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

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
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

  // Assisted Check-in Modal State
  const [isAssistedOpen, setIsAssistedOpen] = useState<boolean>(false);
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
        if (res.cases) setCases(res.cases);
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
      const res = await api.submitAssistedCheckin(payload);
      setAssistedSuccess(`Assisted check-in securely logged for ${assistedVictim.victim_code} (${assistedVictim.victim_name || assistedVictim.name}). System updated risk signals.`);
      setTimeout(() => {
        setAssistedSuccess(null);
        setIsAssistedOpen(false);
      }, 3000);
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

  return (
    <div className="space-y-6">
      
      {/* Station Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Andhra Pradesh Police • {stationInfo.district_code}</span>
          </div>
          <h2 className="text-xl font-bold">{stationInfo.police_station}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Station Registration Officer: <span className="text-teal-400 font-semibold">{stationInfo.officer_name}</span> • {stationInfo.jurisdiction}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setCreatedCredential(null);
              setIsRegisterOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Victim & Case</span>
          </button>

          <button
            onClick={() => {
              if (cases.length > 0) setAssistedVictim(cases[0]);
              setIsAssistedOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Assisted Check-in Entry</span>
          </button>
        </div>
      </div>

      {/* 6 Key Police Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Cases</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total_registered_cases}</span>
          <span className="text-[10px] text-teal-600 font-medium">NTR District Roster</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Under Investigation</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{metrics.under_investigation}</span>
          <span className="text-[10px] text-amber-700 font-medium">Active FIR Inquiry</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Charge Sheets Filed</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">{metrics.charge_sheets_filed}</span>
          <span className="text-[10px] text-blue-700 font-medium">Forwarded to Sessions Court</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">In Court Trial</span>
          <span className="text-2xl font-bold text-purple-600 mt-1 block">{metrics.cases_in_trial}</span>
          <span className="text-[10px] text-purple-700 font-medium">Active Hearing Schedule</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Threats</span>
          <span className="text-2xl font-bold text-red-600 mt-1 block">{metrics.active_threat_reports}</span>
          <span className="text-[10px] text-red-700 font-medium">Patrol Dispatches Required</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assisted Check-ins</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{metrics.assisted_checkins_conducted}</span>
          <span className="text-[10px] text-emerald-700 font-medium">Station & Field Submissions</span>
        </div>
      </div>

      {/* Main Content: Cases Roster and Threat Patrol Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Registered Victim & Case Directory */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Station Case Registry & Victim Protection Roster</span>
              </h3>
              <p className="text-xs text-slate-500">Official registry managed under the SC/ST PoA Protection Framework</p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case, victim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 w-full sm:w-44"
                />
              </div>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                <option value="Investigation">Investigation</option>
                <option value="Charge Sheet Filed">Charge Sheet</option>
                <option value="Court / Trial">Court / Trial</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Case Code</th>
                  <th className="py-2.5 px-3">Victim</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-3">Protection</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.slice(0, 15).map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {c.case_code}
                      <span className="block text-[10px] text-slate-400 font-normal">{c.complaint_date}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{c.victim_name || 'Confidential'}</span>
                      <span className="block text-[10px] font-mono text-teal-700">{c.victim_code}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[140px] truncate" title={c.case_category || c.case_type}>
                      {c.case_category || c.case_type}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.case_stage === 'Court / Trial' ? 'bg-purple-100 text-purple-800' :
                        c.investigation_status === 'Charge Sheet Filed' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.investigation_status || c.case_stage}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>{c.protection_status || 'Patrol Monitored'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setAssistedVictim(c);
                          setIsAssistedOpen(true);
                        }}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md text-[11px] font-semibold border border-teal-200 transition-colors"
                      >
                        Assisted Check-in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Showing top {Math.min(15, filteredCases.length)} of {filteredCases.length} cases</span>
            <span className="text-[11px] text-slate-400">Jurisdiction: {stationInfo.police_station}</span>
          </div>
        </div>

        {/* Right Col: Threat Reports & Station Patrol Dispatch Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Station Threat & Patrol Dispatch</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {threatEvents.filter(t => t.status === 'OPEN').length} Open
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Real-time threat alerts escalated to station officers requiring immediate patrol verification.
            </p>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {threatEvents.slice(0, 6).map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{t.threat_type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      t.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {t.description}
                  </p>

                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span>Severity Level: <span className="font-semibold text-red-700">{t.severity || 4}/5</span></span>
                    <span className="text-slate-400">{t.reported_at ? t.reported_at.slice(0, 10) : 'Recent'}</span>
                  </div>

                  {t.status === 'OPEN' && (
                    <button
                      onClick={() => alert(`Patrol vehicle dispatched to secure victim in coordination with Protection Officer Smt. K. Ratna Kumari.`)}
                      className="w-full mt-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dispatch Patrol Unit</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Standard Operating Protocol: Immediate police response within 15 minutes of escalation.
          </div>
        </div>

      </div>

      {/* MODAL 1: Register New Victim & Case */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            
            {!createdCredential ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-teal-800">
                    <UserPlus className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-base">Register New Victim & Case (Official Workflow)</h3>
                  </div>
                  <button 
                    onClick={() => setIsRegisterOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Victim Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mary Rathnam"
                        value={regForm.name}
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Age Group</label>
                      <select
                        value={regForm.age_group}
                        onChange={(e) => setRegForm({...regForm, age_group: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="18-25">18-25 years</option>
                        <option value="26-35">26-35 years</option>
                        <option value="36-50">36-50 years</option>
                        <option value="51+">51+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                      <select
                        value={regForm.gender}
                        onChange={(e) => setRegForm({...regForm, gender: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Preferred Language</label>
                      <select
                        value={regForm.preferred_language}
                        onChange={(e) => setRegForm({...regForm, preferred_language: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Case Category *</label>
                      <select
                        value={regForm.case_category}
                        onChange={(e) => setRegForm({...regForm, case_category: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="Assault and physical violence">Assault and physical violence</option>
                        <option value="Criminal intimidation & witness coercion">Criminal intimidation & witness coercion</option>
                        <option value="Land dispossession & illegal entry">Land dispossession & illegal entry</option>
                        <option value="Public humiliation & verbal abuse">Public humiliation & verbal abuse</option>
                        <option value="Sexual harassment & exploitation">Sexual harassment & exploitation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Police Station</label>
                      <input
                        type="text"
                        disabled
                        value={regForm.police_station}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Incident Description & FIR Details *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Brief details of the incident registered under SC/ST Protection of Atrocities Act..."
                      value={regForm.incident_description}
                      onChange={(e) => setRegForm({...regForm, incident_description: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Assigned Counsellor</label>
                      <input
                        type="text"
                        disabled
                        value={regForm.assigned_counsellor}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Assigned Protection Officer</label>
                      <input
                        type="text"
                        disabled
                        value={regForm.assigned_protection_officer}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="prot-req"
                      checked={regForm.protection_required}
                      onChange={(e) => setRegForm({...regForm, protection_required: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <label htmlFor="prot-req" className="text-xs text-slate-700 font-semibold cursor-pointer">
                      Urgent Protection Escort & Area Patrol Deployment Required
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRegisterOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReg}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs shadow-md flex items-center space-x-1.5"
                    >
                      {isSubmittingReg ? <span>Provisioning...</span> : <span>Register & Issue Credentials</span>}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* One-time Secure Credential Card Display (Part 3) */
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="flex items-center space-x-2 text-emerald-700 pb-2 border-b border-slate-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Registration Successful & Provisioned</h3>
                    <p className="text-xs text-slate-500">Case and victim profile registered in NTR District Roster</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <div className="flex items-start space-x-2">
                    <Key className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm">One-Time Secure Credential Card</span>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Hand over or securely transmit these credentials to the victim privately. For safety and compliance, temporary passwords will only be displayed during this registration session.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Victim Identification Code</span>
                    <span className="text-sm font-bold text-teal-400">{createdCredential.victim_code}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Assigned Case Code</span>
                    <span className="text-sm font-bold text-slate-200">{createdCredential.case_code}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Login Identifier / Handle</span>
                    <span className="text-sm font-bold text-white">{createdCredential.login_identifier}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Temporary Password</span>
                    <span className="text-sm font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {createdCredential.temporary_password}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    onClick={() => copyToClipboard(`Victim Code: ${createdCredential.victim_code}\nLogin ID: ${createdCredential.login_identifier}\nPassword: ${createdCredential.temporary_password}\nCase: ${createdCredential.case_code}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center space-x-1.5 text-xs transition-colors"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                    <span>{copiedKey ? "Copied to Clipboard!" : "Copy Credential Slip"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsRegisterOpen(false);
                      setCreatedCredential(null);
                    }}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs shadow-md"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: Assisted Check-in Tool (Part 6) */}
      {isAssistedOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-teal-800">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base">Assisted Check-in Entry (Officer Tool)</h3>
              </div>
              <button 
                onClick={() => setIsAssistedOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {assistedSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Assisted Check-in Logged</h4>
                <p className="text-xs text-slate-600">{assistedSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAssistedSubmit} className="space-y-4 mt-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <span className="font-bold block text-xs">Offline / Smartphone-less Victim Assistance</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Authorized officers can record wellbeing check-ins on behalf of victims during station visits or field patrol check-ins.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Select Registered Victim</label>
                  <select
                    value={assistedVictim?.id || assistedVictim?.victim_id || ''}
                    onChange={(e) => {
                      const selected = cases.find(c => c.id === e.target.value || c.victim_id === e.target.value);
                      if (selected) setAssistedVictim(selected);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {cases.map((c: any) => (
                      <option key={c.id} value={c.victim_id || c.id}>
                        {c.victim_code} — {c.victim_name || 'Victim'} ({c.case_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Sliders */}
                <div className="space-y-3 pt-2">
                  <span className="font-semibold text-slate-700 block">Structured Wellbeing Screening Domains (0 = None, 4 = Severe)</span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Stress Level:</span>
                        <span className="font-bold">{assistedScores.stress_score}/4</span>
                      </div>
                      <input
                        type="range" min="0" max="4" step="0.5"
                        value={assistedScores.stress_score}
                        onChange={(e) => setAssistedScores({...assistedScores, stress_score: parseFloat(e.target.value)})}
                        className="w-full accent-teal-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Anxiety Level:</span>
                        <span className="font-bold">{assistedScores.anxiety_score}/4</span>
                      </div>
                      <input
                        type="range" min="0" max="4" step="0.5"
                        value={assistedScores.anxiety_score}
                        onChange={(e) => setAssistedScores({...assistedScores, anxiety_score: parseFloat(e.target.value)})}
                        className="w-full accent-teal-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Fear of Retaliation:</span>
                        <span className="font-bold text-red-600">{assistedScores.fear_score}/4</span>
                      </div>
                      <input
                        type="range" min="0" max="4" step="0.5"
                        value={assistedScores.fear_score}
                        onChange={(e) => setAssistedScores({...assistedScores, fear_score: parseFloat(e.target.value)})}
                        className="w-full accent-red-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Perceived Threat:</span>
                        <span className="font-bold text-red-600">{assistedScores.threat_score}/4</span>
                      </div>
                      <input
                        type="range" min="0" max="4" step="0.5"
                        value={assistedScores.threat_score}
                        onChange={(e) => setAssistedScores({...assistedScores, threat_score: parseFloat(e.target.value)})}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="imm-danger"
                    checked={assistedScores.immediate_danger}
                    onChange={(e) => setAssistedScores({...assistedScores, immediate_danger: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="imm-danger" className="text-xs text-red-800 font-bold cursor-pointer">
                    Flag Immediate Danger / Threat Alert (Triggers instant police alert)
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Officer Observation Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Document victim statements, physical demeanor, or witness intimidation notes..."
                    value={assistedScores.free_text_response}
                    onChange={(e) => setAssistedScores({...assistedScores, free_text_response: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAssistedOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAssisted}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs shadow-md"
                  >
                    {isSubmittingAssisted ? <span>Submitting...</span> : <span>Log Assisted Check-in</span>}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
