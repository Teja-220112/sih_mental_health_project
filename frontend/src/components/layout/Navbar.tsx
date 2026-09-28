import React from 'react';
import { useAuth } from '../../lib/authContext';
import { UserRole } from '../../types';
import { Shield, User, LogOut, ChevronDown, Activity, Users, Building2, Lock, Mic } from 'lucide-react';

interface NavbarProps {
  onQuickCheckin?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoiceAssistant }) => {
  const { user, role, logout } = useAuth();

  const getRoleDisplayName = (r: UserRole) => {
    switch (r) {
      case 'police_officer': return 'Police / Registration Officer';
      case 'counsellor': return 'Senior Counsellor';
      case 'protection_officer': return 'Protection Officer';
      case 'district_officer': return 'District Administrator';
      case 'admin': return 'System Administrator';
      case 'victim': return 'Victim Portal';
      default: return 'User';
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Ministry & District Branding */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-700/80 rounded-xl shadow-md border border-teal-500/30">
            <Shield className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide text-white flex items-center gap-1.5">
              <span>MoSJE</span>
              <span className="text-teal-400 font-normal">| Victim Safety & Rehabilitation Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Government of Andhra Pradesh • NTR District (Vijayawada — <span className="font-mono text-teal-300">AP-NTR-01</span>)
            </p>
          </div>
        </div>

        {/* Right: Authenticated User Profile & Logout */}
        <div className="flex items-center space-x-3">
          
          {/* Optional Voice Assistant for Victims */}
          {role === 'victim' && onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-teal-300 border border-teal-500/40 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Mic className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2.5 bg-navy-900/80 px-3 py-1.5 rounded-xl border border-navy-800">
            <div className="w-7 h-7 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xs border border-teal-600">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Authenticated User'}</div>
              <div className="text-[10px] text-teal-400 font-medium tracking-wide">{getRoleDisplayName(role)}</div>
            </div>
          </div>

          {/* Secure Logout Button */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to sign out of the portal?")) {
                logout();
              }
            }}
            title="Sign out of your session"
            className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 border border-slate-700 hover:border-red-800 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>

      </div>
    </header>
  );
};
