import React from 'react';
import { useAuth } from '../../lib/authContext';
import { 
  HeartHandshake, MessageSquare, ShieldAlert, FileText, LayoutDashboard, 
  Users, AlertCircle, Cpu, FileCheck, Lock, Activity, UserCheck, UserPlus, Building2, Phone, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { role } = useAuth();

  const policeNav = [
    { id: 'dashboard', label: 'Station Overview & Cases', shortLabel: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'register_victim', label: 'Register Victim & Case', shortLabel: 'Register', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'assisted_checkin', label: 'Assisted Check-in Entry', shortLabel: 'Assisted', icon: <FileText className="w-4 h-4" /> },
    { id: 'threat_patrols', label: 'Patrol & Threat Queue', shortLabel: 'Patrols', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const victimNav = [
    { id: 'dashboard', label: 'My Wellbeing', shortLabel: 'Wellbeing', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'checkin', label: 'Start Check-in', shortLabel: 'Check-in', icon: <FileText className="w-4 h-4" /> },
    { id: 'chat', label: 'Support Chatbot', shortLabel: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'threat', label: 'Report Threat', shortLabel: 'Threat', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const counsellorNav = [
    { id: 'dashboard', label: 'Counsellor Dashboard', shortLabel: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'victims', label: 'Assigned Victims', shortLabel: 'Victims', icon: <Users className="w-4 h-4" /> },
    { id: 'alerts', label: 'High-Risk Alerts', shortLabel: 'Alerts', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'interventions', label: 'Counselling Records', shortLabel: 'Sessions', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const protectionNav = [
    { id: 'dashboard', label: 'Protection Overview', shortLabel: 'Overview', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'threats', label: 'Witness Threat Queue', shortLabel: 'Threats', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'escorts', label: 'Police Escort Roster', shortLabel: 'Escorts', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'relocation', label: 'Emergency Relocations', shortLabel: 'Relocation', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const districtNav = [
    { id: 'dashboard', label: 'District Dashboard', shortLabel: 'District', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'threats', label: 'Threat & Protection', shortLabel: 'Protection', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'welfare', label: 'Welfare & Rehabilitation', shortLabel: 'Welfare', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'analytics', label: 'District Analytics', shortLabel: 'Analytics', icon: <Activity className="w-4 h-4" /> },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'State Overview', shortLabel: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ml_metrics', label: 'AI Model Monitoring', shortLabel: 'ML Status', icon: <Cpu className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Audit Logs & RLS', shortLabel: 'Audit', icon: <Lock className="w-4 h-4" /> },
  ];

  const navItems = role === 'victim' ? victimNav :
                   role === 'police_officer' ? policeNav :
                   role === 'counsellor' ? counsellorNav :
                   role === 'protection_officer' ? protectionNav :
                   role === 'district_officer' ? districtNav : adminNav;

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <>
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          {role.replace('_', ' ')} Navigation
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === item.id
                ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold border-l-4 border-teal-600 dark:border-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className={activeTab === item.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {role === 'victim' ? (
        <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 p-3.5 rounded-xl text-xs space-y-1.5 mt-4">
          <div className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Emergency Assistance</span>
          </div>
          <div className="text-[11px] text-teal-800 dark:text-teal-200 font-medium">National Emergency: <span className="font-bold text-teal-950 dark:text-teal-300 font-mono">112</span></div>
          <div className="text-[11px] text-teal-800 dark:text-teal-200 font-medium">Women's Safety: <span className="font-bold text-teal-950 dark:text-teal-300 font-mono">181</span></div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-teal-200/50 dark:border-teal-800/50">NTR District Support Network</div>
        </div>
      ) : role === 'admin' ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-4">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>System Diagnostics</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● ML Engine Active (v1.0.0)</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">FastAPI • NTR District Roster</div>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Visible only on lg: screens and above) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex-col justify-between sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto shrink-0 shadow-xs transition-colors duration-200">
        {navContent}
      </aside>

      {/* 2. MOBILE DRAWER MODAL (Slides in on screens < lg when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-out drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between h-full shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Close Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                  Portal Menu
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navContent}
            </div>
          </aside>
        </div>
      )}

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Visible only on screens < lg for instant thumb access) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1 flex items-center justify-around shadow-lg transition-colors"
      >
        {navItems.slice(0, 4).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-teal-50 dark:bg-teal-950/80 scale-105' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight tracking-tight truncate max-w-[70px]">
                {item.shortLabel || item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
