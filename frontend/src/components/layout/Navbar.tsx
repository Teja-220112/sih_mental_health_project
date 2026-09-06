import React from 'react';
import { useAuth } from '../../lib/authContext';
import { UserRole } from '../../types';
import { Shield, User, LogOut, ChevronDown, Activity, Users, Building2, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();

  const personaOptions: Array<{ role: UserRole; name: string; title: string }> = [
    { role: 'victim', name: 'Sunita Devi', title: 'Victim Demo' },
    { role: 'counsellor', name: 'Dr. Ananya Sharma', title: 'Counsellor' },
    { role: 'district_officer', name: 'Rajesh Verma', title: 'District Officer' },
    { role: 'admin', name: 'MoSJE Admin', title: 'System Admin' },
  ];

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Ministry Emblem Branding */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-700/80 rounded-lg shadow-md border border-teal-500/30">
            <Shield className="w-6 h-6 text-teal-100" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide text-white flex items-center gap-1.5">
              <span>MoSJE</span>
              <span className="text-teal-400 font-normal">| AI Mental Health Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ministry of Social Justice & Empowerment — Atrocity Victim Distress Monitoring
            </p>
          </div>
        </div>

        {/* Right: Quick Demo Persona Switcher & Profile */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 bg-navy-800 p-1 rounded-lg border border-navy-700 text-xs">
            <span className="text-slate-400 px-2 font-medium">Demo Persona:</span>
            {personaOptions.map((p) => (
              <button
                key={p.role}
                onClick={() => switchRole(p.role)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  role === p.role
                    ? 'bg-teal-700 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-navy-700'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 border-l border-navy-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xs border border-teal-600">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-white">{user?.full_name || 'User'}</div>
              <div className="text-[10px] text-teal-400 uppercase font-medium tracking-wider">{role}</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
