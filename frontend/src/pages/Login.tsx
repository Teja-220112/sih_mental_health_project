import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { UserRole } from '../types';
import { Shield, Lock, User, Mail, Eye, EyeOff, AlertCircle, HelpCircle, X, ChevronDown, Sun, Moon } from 'lucide-react';

interface RoleConfig {
  id: UserRole;
  label: string;
  identifierLabel: string;
  placeholder: string;
  icon: 'user' | 'mail';
}

const ROLES: RoleConfig[] = [
  {
    id: 'victim',
    label: 'Victim',
    identifierLabel: 'Victim Access ID / Code',
    placeholder: 'Enter your Login ID (e.g. VIC-DEMO-0001)',
    icon: 'user'
  },
  {
    id: 'police_officer',
    label: 'Police / Case Officer',
    identifierLabel: 'Official Email or Badge ID',
    placeholder: 'Enter official email or badge ID',
    icon: 'mail'
  },
  {
    id: 'counsellor',
    label: 'Counsellor',
    identifierLabel: 'Practitioner Email / ID',
    placeholder: 'Enter practitioner email or ID',
    icon: 'mail'
  },
  {
    id: 'protection_officer',
    label: 'Protection Officer',
    identifierLabel: 'Department Email',
    placeholder: 'Enter protection officer email',
    icon: 'mail'
  },
  {
    id: 'district_officer',
    label: 'District Administrator',
    identifierLabel: 'Administrator Email / ID',
    placeholder: 'Enter administrator email or ID',
    icon: 'mail'
  }
];

export const Login: React.FC = () => {
  const { loginWithCredentials } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<UserRole>('victim');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your login identifier.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await loginWithCredentials(identifier.trim(), password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 py-6 sm:py-10 font-sans relative transition-colors duration-200">
      
      {/* Top Right Theme Toggle */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-800 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="text-slate-200">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-teal-700" />
              <span className="text-slate-700">Dark</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-md my-auto">
        
        {/* Centered Professional Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 p-4 sm:p-8 space-y-5 sm:space-y-6 transition-colors">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-2.5 sm:p-3 bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-2xl shadow-md border border-teal-500/20 mb-1">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-teal-200" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Victim Safety &amp; Rehabilitation Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Secure official gateway for victims, law enforcement, and support officers
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Compact Role Selector */}
            <div>
              <label htmlFor="role-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Your Role
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id} className="dark:bg-slate-800 dark:text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Username / Identifier */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {activeRoleConfig.identifierLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  {activeRoleConfig.icon === 'user' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeRoleConfig.placeholder}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer pt-2.5 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>
          </form>

          {/* Assistance Link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need login assistance?</span>
            </button>
          </div>

        </div>

        {/* Small Discreet Footer */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
          Government of Andhra Pradesh • NTR District Support Cell
        </p>

      </div>

      {/* Login Assistance Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Login Assistance</span>
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">Victims:</strong> Your Access ID and temporary password were provided during official FIR registration at your police station.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Department Personnel:</strong> Official police, clinical, and protection credentials are issued by the District Magistrate Liaison Office.
              </p>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                <strong>Emergency Helpline:</strong> 112 (Police &amp; Emergency) | 181 (Women's Safety)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
