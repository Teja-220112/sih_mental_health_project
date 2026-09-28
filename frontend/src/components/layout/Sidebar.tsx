import React from 'react';
import { useAuth } from '../../lib/authContext';
import { 
  HeartHandshake, MessageSquare, ShieldAlert, FileText, LayoutDashboard, 
  Users, AlertCircle, Cpu, FileCheck, Lock, Activity, UserCheck, UserPlus, Building2, Phone
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const policeNav = [
    { id: 'dashboard', label: 'Station Overview & Cases', icon: <Building2 className="w-4 h-4" /> },
    { id: 'register_victim', label: 'Register Victim & Case', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'assisted_checkin', label: 'Assisted Check-in Entry', icon: <FileText className="w-4 h-4" /> },
    { id: 'threat_patrols', label: 'Patrol & Threat Queue', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const victimNav = [
    { id: 'dashboard', label: 'My Wellbeing', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'checkin', label: 'Start Check-in', icon: <FileText className="w-4 h-4" /> },
    { id: 'chat', label: 'Support Chatbot', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'threat', label: 'Report Threat', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Safety', icon: <Lock className="w-4 h-4" /> },
  ];

  const counsellorNav = [
    { id: 'dashboard', label: 'Counsellor Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'victims', label: 'Assigned Victims', icon: <Users className="w-4 h-4" /> },
    { id: 'alerts', label: 'High-Risk Alerts', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'interventions', label: 'Counselling Records', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const protectionNav = [
    { id: 'dashboard', label: 'Protection Overview', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'threats', label: 'Witness Threat Queue', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'escorts', label: 'Police Escort Roster', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'relocation', label: 'Emergency Relocations', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const districtNav = [
    { id: 'dashboard', label: 'District Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'threats', label: 'Threat & Protection', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'welfare', label: 'Welfare & Rehabilitation', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'District Analytics', icon: <Activity className="w-4 h-4" /> },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'State Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ml_metrics', label: 'AI Model Monitoring', icon: <Cpu className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Audit Logs & RLS', icon: <Lock className="w-4 h-4" /> },
  ];

  const navItems = role === 'victim' ? victimNav :
                   role === 'police_officer' ? policeNav :
                   role === 'counsellor' ? counsellorNav :
                   role === 'protection_officer' ? protectionNav :
                   role === 'district_officer' ? districtNav : adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between sticky top-[6.5rem] self-start h-[calc(100vh-6.5rem)] overflow-y-auto shrink-0 shadow-xs">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {role.replace('_', ' ')} Navigation
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-teal-50 text-teal-800 font-semibold border-l-4 border-teal-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {role === 'victim' ? (
        <div className="bg-teal-50/60 border border-teal-200/60 p-3.5 rounded-xl text-xs space-y-1.5">
          <div className="font-bold text-teal-900 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-teal-700" />
            <span>Emergency Assistance</span>
          </div>
          <div className="text-[11px] text-teal-800 font-medium">National Emergency: <span className="font-bold text-teal-950 font-mono">112</span></div>
          <div className="text-[11px] text-teal-800 font-medium">Women's Safety: <span className="font-bold text-teal-950 font-mono">181</span></div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-teal-200/40">NTR District Support Network</div>
        </div>
      ) : role === 'admin' ? (
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>System Diagnostics</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">● ML Engine Active (v1.0.0)</div>
          <div className="text-[11px] text-slate-500">FastAPI • NTR District Roster</div>
        </div>
      ) : null}
    </aside>
  );
};
