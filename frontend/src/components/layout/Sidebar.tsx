import React from 'react';
import { useAuth } from '../../lib/authContext';
import { 
  HeartHandshake, MessageSquare, ShieldAlert, FileText, LayoutDashboard, 
  Users, AlertCircle, Cpu, FileCheck, Lock, Activity, UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

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
                   role === 'counsellor' ? counsellorNav :
                   role === 'district_officer' ? districtNav : adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
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

      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>System Status</span>
        </div>
        <div className="text-[11px] text-emerald-700 font-medium">● ML Inference Engine Online</div>
        <div className="text-[11px] text-slate-500">FastAPI + Supabase PostgreSQL</div>
      </div>
    </aside>
  );
};
