import React from 'react';
import { useAuth } from '../../lib/authContext';
import { useTheme } from '../../lib/themeContext';
import { UserRole } from '../../types';
import { Shield, LogOut, Mic, Sun, Moon, Menu, X } from 'lucide-react';

interface NavbarProps {
  onQuickCheckin?: () => void;
  onOpenVoiceAssistant?: () => void;
  isMobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenVoiceAssistant,
  isMobileNavOpen = false,
  onToggleMobileNav
}) => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleDisplayName = (r: UserRole) => {
    switch (r) {
      case 'police_officer': return 'Police / Registration Officer';
      case 'counsellor': return 'Senior Clinical Counsellor';
      case 'protection_officer': return 'Statutory Protection Officer';
      case 'district_officer': return 'District Magistrate / Admin';
      case 'admin': return 'System Administrator';
      case 'victim': return 'Citizen / Victim Portal';
      default: return 'User';
    }
  };

  return (
    <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800 dark:border-slate-800/80 sticky top-0 z-50 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Hamburger Button (Mobile) & Ministry / District Branding */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Navigation Drawer Toggle */}
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              aria-label={isMobileNavOpen ? 'Close Menu' : 'Open Navigation Menu'}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
            >
              {isMobileNavOpen ? <X className="w-5 h-5 text-teal-300" /> : <Menu className="w-5 h-5 text-slate-200" />}
            </button>
          )}

          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl shadow-md border border-teal-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide text-white flex items-center gap-1.5">
              <span className="font-extrabold text-teal-400">MoSJE</span>
              <span className="text-slate-200 font-semibold hidden md:inline">| Victim Safety &amp; Rehabilitation Portal</span>
              <span className="text-slate-200 font-medium inline md:hidden text-xs">| Safety Portal</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
              <span>Govt of Andhra Pradesh</span>
              <span>•</span>
              <span className="text-slate-300">NTR District (<strong className="font-mono text-teal-300 font-semibold">AP-NTR-01</strong>)</span>
            </p>
          </div>
        </div>

        {/* Right: Controls, Theme Toggle, Profile & Logout */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-teal-300" />
            )}
          </button>

          {/* Optional Voice Assistant for Victims */}
          {role === 'victim' && onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="px-3 py-1.5 bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-500/40 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2.5 bg-slate-800/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-700 to-teal-900 text-teal-100 flex items-center justify-center font-bold text-xs border border-teal-500/40 shadow-xs">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'Authenticated User'}</div>
              <div className="text-[10px] text-teal-400 font-medium tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{getRoleDisplayName(role)}</span>
              </div>
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
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 text-slate-300 border border-slate-700 hover:border-red-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

        </div>

      </div>
    </header>
  );
};
